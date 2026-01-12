/**
 * Calendar Chat API Route
 * 
 * Handles natural language requests for calendar, task, and objective operations.
 * Uses LLM with tool calling to parse requests and execute CRUD operations.
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import Anthropic from '@anthropic-ai/sdk';
import { createClient } from '@/lib/supabase/server';
import { isSupabaseConfigured } from '@/lib/env';
import {
  executeCalendarTool,
  getToolsForAnthropic,
  getCalendarSystemPrompt,
  type ToolExecutionResult,
} from '@/lib/chat/tools';
import { format } from 'date-fns';

// ============================================================================
// REQUEST SCHEMA
// ============================================================================

const requestSchema = z.object({
  messages: z.array(
    z.object({
      role: z.enum(['user', 'assistant']),
      content: z.string().min(1).max(4000),
    })
  ).min(1).max(30),
  context: z.object({
    currentDate: z.string().optional(),
    recentItems: z.array(z.object({
      id: z.string(),
      title: z.string(),
      type: z.enum(['task', 'weekly_objective', 'monthly_objective', 'event']),
    })).optional(),
  }).optional(),
});

// ============================================================================
// TYPES
// ============================================================================

// Use Anthropic's types directly
type ContentBlock = Anthropic.Messages.ContentBlock;
type ToolUseBlock = Anthropic.Messages.ToolUseBlock;

// ============================================================================
// MAIN HANDLER
// ============================================================================

export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    if (!isSupabaseConfigured) {
      return NextResponse.json(
        { error: 'Server is not configured' },
        { status: 503 }
      );
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse and validate request
    const body = await request.json();
    const parsed = requestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request body', details: parsed.error.issues },
        { status: 400 }
      );
    }

    const { messages, context } = parsed.data;
    const currentDate = context?.currentDate || format(new Date(), 'yyyy-MM-dd');

    // Build context summary for system prompt
    const contextSummary = buildContextSummary(context?.recentItems || []);

    // Get API key (from user's BYOK or system default)
    const anthropicKey = await getAnthropicKey(user.id, supabase);
    
    if (!anthropicKey) {
      return NextResponse.json({
        error: 'API key required',
        message: 'Please add your Anthropic API key in Settings to use calendar chat.',
        settingsUrl: '/settings?tab=api-keys',
      }, { status: 402 });
    }

    // Initialize Anthropic client
    const anthropic = new Anthropic({ apiKey: anthropicKey });

    // Call Anthropic with tools
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      system: getCalendarSystemPrompt(currentDate, contextSummary),
      tools: getToolsForAnthropic(),
      messages: messages.map((m) => ({
        role: m.role,
        content: m.content,
      })),
    });

    // Process the response
    const result = await processAnthropicResponse(
      anthropic,
      response,
      user.id,
      messages,
      currentDate,
      contextSummary
    );

    return NextResponse.json(result);

  } catch (error) {
    console.error('Calendar chat API error:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get Anthropic API key from user's BYOK settings or system default
 */
async function getAnthropicKey(
  userId: string,
  supabase: Awaited<ReturnType<typeof createClient>>
): Promise<string | null> {
  // First, try to get user's own key
  const { data: userKeys } = await supabase
    .from('user_api_keys')
    .select('anthropic_key_encrypted, anthropic_key_valid')
    .eq('user_id', userId)
    .single();

  if (userKeys?.anthropic_key_encrypted && userKeys.anthropic_key_valid) {
    // In production, you'd decrypt this
    // For now, we're assuming it's stored directly (not recommended for production)
    return userKeys.anthropic_key_encrypted;
  }

  // Fall back to system key
  return process.env.ANTHROPIC_API_KEY || null;
}

/**
 * Build context summary from recent items
 */
function buildContextSummary(recentItems: Array<{ id: string; title: string; type: string }>): string {
  if (recentItems.length === 0) {
    return 'No recent items in context.';
  }

  const grouped: Record<string, Array<{ id: string; title: string }>> = {};
  
  recentItems.forEach((item) => {
    if (!grouped[item.type]) {
      grouped[item.type] = [];
    }
    grouped[item.type].push({ id: item.id, title: item.title });
  });

  const parts: string[] = [];
  
  if (grouped.task) {
    parts.push(`Recent tasks: ${grouped.task.map((t) => `"${t.title}" (ID: ${t.id})`).join(', ')}`);
  }
  if (grouped.weekly_objective) {
    parts.push(`Recent weekly objectives: ${grouped.weekly_objective.map((o) => `"${o.title}" (ID: ${o.id})`).join(', ')}`);
  }
  if (grouped.monthly_objective) {
    parts.push(`Recent monthly objectives: ${grouped.monthly_objective.map((o) => `"${o.title}" (ID: ${o.id})`).join(', ')}`);
  }
  if (grouped.event) {
    parts.push(`Recent events: ${grouped.event.map((e) => `"${e.title}" (ID: ${e.id})`).join(', ')}`);
  }

  return parts.length > 0 ? parts.join('\n') : 'No recent items in context.';
}

/**
 * Process Anthropic response, handling tool calls
 */
async function processAnthropicResponse(
  anthropic: Anthropic,
  response: Anthropic.Message,
  userId: string,
  originalMessages: Array<{ role: 'user' | 'assistant'; content: string }>,
  currentDate: string,
  contextSummary: string
): Promise<{
  message: string;
  toolResults?: ToolExecutionResult[];
  affectedItems?: Array<{ id: string; title: string; type: string }>;
}> {
  const toolResults: ToolExecutionResult[] = [];
  const affectedItems: Array<{ id: string; title: string; type: string }> = [];

  // Check if the response contains tool calls
  const toolUseBlocks = response.content.filter(
    (block): block is ToolUseBlock => block.type === 'tool_use'
  );

  if (toolUseBlocks.length === 0) {
    // No tool calls, just return the text response
    const textBlock = response.content.find((block) => block.type === 'text');
    const textContent = textBlock && 'text' in textBlock ? textBlock.text : null;
    return {
      message: textContent || 'I understood your request but couldn\'t generate a response.',
    };
  }

  // Execute all tool calls
  const toolResultsForContinuation: Array<{
    type: 'tool_result';
    tool_use_id: string;
    content: string;
  }> = [];

  for (const toolBlock of toolUseBlocks) {
    const result = await executeCalendarTool(
      userId,
      toolBlock.name,
      toolBlock.input as Record<string, unknown>
    );

    toolResults.push(result);

    // Collect affected items for context updates
    if (result.affectedItems) {
      const itemType = getItemTypeFromToolName(toolBlock.name);
      result.affectedItems.forEach((item) => {
        affectedItems.push({ ...item, type: itemType });
      });
    }

    // Format result for continuation
    toolResultsForContinuation.push({
      type: 'tool_result',
      tool_use_id: toolBlock.id,
      content: result.success
        ? JSON.stringify({ success: true, message: result.message, data: result.data })
        : JSON.stringify({ success: false, error: result.error, message: result.message }),
    });
  }

  // Continue the conversation with tool results
  const continuationResponse = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1024,
    system: getCalendarSystemPrompt(currentDate, contextSummary),
    tools: getToolsForAnthropic(),
    messages: [
      ...originalMessages.map((m) => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      })),
      {
        role: 'assistant' as const,
        content: response.content as ContentBlock[],
      },
      {
        role: 'user' as const,
        content: toolResultsForContinuation,
      },
    ],
  });

  // Extract the final text response
  const finalTextBlock = continuationResponse.content.find((block) => block.type === 'text');
  const finalTextContent = finalTextBlock && 'text' in finalTextBlock ? finalTextBlock.text : null;

  return {
    message: finalTextContent || 'Operation completed.',
    toolResults,
    affectedItems: affectedItems.length > 0 ? affectedItems : undefined,
  };
}

/**
 * Get item type from tool name
 */
function getItemTypeFromToolName(toolName: string): string {
  if (toolName.includes('task')) return 'task';
  if (toolName.includes('weekly')) return 'weekly_objective';
  if (toolName.includes('monthly')) return 'monthly_objective';
  if (toolName.includes('event')) return 'event';
  return 'unknown';
}

