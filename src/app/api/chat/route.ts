import { NextRequest, NextResponse } from 'next/server';
import { 
  chatWithTools, 
  completeWithContext, 
  MODELS, 
  isOpenAIConfigured, 
  selectModel, 
  AVAILABLE_MODELS, 
  type ModelMode,
  chatWithWebSearch,
  mightNeedWebSearch,
} from '@/lib/ai/client';
import { routeAIRequest } from '@/lib/ai/router';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { isSupabaseConfigured } from '@/lib/env';
import { getUserContext, buildContextualSystemPrompt } from '@/lib/ai/userContext';
import { ASPECT_TOOLS, executeAspectTool } from '@/lib/ai/aspectTools';
import type { AspectType } from '@/types/database';

// Valid model IDs for the schema
const modelIds = Object.keys(AVAILABLE_MODELS) as [string, ...string[]];

const chatBodySchema = z.object({
  messages: z
    .array(
      z.object({
        role: z.enum(['user', 'assistant']),
        content: z.string().min(1).max(2000),
      })
    )
    .min(1)
    .max(10), // Limit to last 10 messages for token efficiency
  aspectId: z.string().optional(), // Current aspect context
  enableTools: z.boolean().optional(), // Whether to enable tool calling
  model: z.enum(['auto', ...modelIds]).optional(), // Model selection: 'auto' or specific model ID
});

export async function POST(request: NextRequest) {
  try {
    // Verify OpenAI is configured
    if (!isOpenAIConfigured()) {
      return NextResponse.json(
        { error: 'OpenAI API key not configured. Please add OPENAI_API_KEY to .env.local' },
        { status: 503 }
      );
    }

    // In production, require Supabase to be configured
    if (process.env.NODE_ENV === 'production' && !isSupabaseConfigured) {
      return NextResponse.json(
        { error: 'Server is not configured' },
        { status: 503 }
      );
    }

    // Get authenticated user
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const parsed = chatBodySchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request body', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { messages, aspectId, enableTools = true, model: modelMode = 'auto' } = parsed.data;

    // Fetch real user context from database
    const userContext = await getUserContext(user.id);
    
    // Build contextual system prompt with real data
    const systemPrompt = buildContextualSystemPrompt(
      userContext,
      aspectId as AspectType | undefined
    );

    // Determine if we should use tools based on the message content
    const lastMessage = messages[messages.length - 1]?.content || '';
    const lastMessageLower = lastMessage.toLowerCase();
    
    // Check if logging/tracking/action tools are needed
    const needsLoggingTools = enableTools && (
      lastMessageLower.includes('log') ||
      lastMessageLower.includes('track') ||
      lastMessageLower.includes('record') ||
      lastMessageLower.includes('did') ||
      lastMessageLower.includes('slept') ||
      lastMessageLower.includes('ate') ||
      lastMessageLower.includes('workout') ||
      lastMessageLower.includes('exercise') ||
      lastMessageLower.includes('ran') ||
      lastMessageLower.includes('gym') ||
      // Grocery list actions
      lastMessageLower.includes('add') ||
      lastMessageLower.includes('grocery') ||
      lastMessageLower.includes('shopping list') ||
      lastMessageLower.includes('buy') ||
      lastMessageLower.includes('pick up')
    );
    
    // Check if web search is needed (news, current events, real-time info)
    const needsWebSearch = mightNeedWebSearch(lastMessage);

    // Select the appropriate model based on mode and requirements
    const selectedModel = selectModel(modelMode as ModelMode, needsLoggingTools || needsWebSearch);
    console.log(`[Chat API] Model: ${selectedModel} (mode: ${modelMode}, logging: ${needsLoggingTools}, webSearch: ${needsWebSearch})`);

    try {
      // Priority 1: Web search for news/current events
      if (needsWebSearch && !needsLoggingTools) {
        console.log('[Chat API] Using Responses API with web search');
        const result = await chatWithWebSearch(systemPrompt, messages, selectedModel);
        
        return NextResponse.json({ 
          message: result.text,
          model: selectedModel,
          webSearchUsed: result.usedWebSearch,
          sources: result.sources,
        });
      }
      
      // Priority 2: Logging/tracking tools
      if (needsLoggingTools) {
        // Use tool-enabled chat for potential logging actions
        const response = await chatWithTools(systemPrompt, messages, ASPECT_TOOLS, selectedModel);
        const choice = response.choices[0];
        
        // Check if the model wants to use tools
        if (choice?.message?.tool_calls && choice.message.tool_calls.length > 0) {
          // Execute all tool calls (filter for function type)
          const toolResults = await Promise.all(
            choice.message.tool_calls
              .filter((tc): tc is typeof tc & { type: 'function'; function: { name: string; arguments: string } } => 
                tc.type === 'function' && 'function' in tc
              )
              .map(async (toolCall) => {
                const args = JSON.parse(toolCall.function.arguments);
                const result = await executeAspectTool(user.id, toolCall.function.name, args);
                return {
                  toolCallId: toolCall.id,
                  toolName: toolCall.function.name,
                  result,
                };
              })
          );

          // Build a summary of what was done
          const successfulActions = toolResults
            .filter(r => r.result.success)
            .map(r => r.result.message);
          
          const failedActions = toolResults
            .filter(r => !r.result.success)
            .map(r => r.result.message);

          // Generate a natural response incorporating the tool results
          let responseMessage: string;
          
          if (successfulActions.length > 0) {
            // Create a follow-up message with tool results context
            const toolContext = successfulActions.join('. ');
            responseMessage = await completeWithContext(
              systemPrompt,
              [
                ...messages.map(m => ({ role: m.role as 'user' | 'assistant', content: m.content })),
                { 
                  role: 'assistant' as const, 
                  content: `I just completed: ${toolContext}. Let me acknowledge this to the user.`
                },
              ]
            );
          } else if (failedActions.length > 0) {
            responseMessage = `I tried to help but ran into an issue: ${failedActions[0]}`;
          } else {
            responseMessage = choice.message.content || 'Done!';
          }

          return NextResponse.json({ 
            message: responseMessage,
            model: MODELS.TOOLS,
            toolsUsed: toolResults.map(r => r.toolName),
            actions: successfulActions,
          });
        }
        
        // No tools needed, return the regular response
        return NextResponse.json({ 
          message: choice?.message?.content || 'I\'m not sure how to help with that.',
          model: MODELS.TOOLS,
        });
      }

      // Regular chat without tools - use the efficient model
      const result = await routeAIRequest(user.id, messages, {
        systemPrompt,
        requiresTools: false,
      });
      
      return NextResponse.json({ 
        message: result.message,
        model: result.model,
      });
      
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      // Handle specific errors
      if (errorMessage === 'QUOTA_EXCEEDED') {
        return NextResponse.json({
          error: 'AI quota exceeded',
          message: 'You\'ve reached your monthly AI message limit. Upgrade to Pro for unlimited messages or add your own API key.',
          upgradeUrl: '/settings?tab=subscription',
        }, { status: 429 });
      } else if (errorMessage === 'BYOK_KEY_MISSING') {
        return NextResponse.json({
          error: 'API key required',
          message: 'Please add your OpenAI or Anthropic API key in Settings, or upgrade to a paid plan.',
          settingsUrl: '/settings?tab=api-keys',
        }, { status: 402 });
      } else if (errorMessage === 'SUBSCRIPTION_INACTIVE') {
        return NextResponse.json({
          error: 'Subscription inactive',
          message: 'Your subscription is not active. Please update your payment method.',
          billingUrl: '/settings?tab=billing',
        }, { status: 402 });
      }
      
      throw error;
    }
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: 'Failed to generate response', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

