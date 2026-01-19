import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import type { AIProvider, AITone } from '@/types/database';
import { getSystemPrompt } from './prompts';

// Available models for selection
export const AVAILABLE_MODELS = {
  // OpenAI models
  'gpt-4o': { 
    name: 'GPT-4o', 
    provider: 'openai' as const, 
    capabilities: ['chat', 'tools', 'vision'],
    costTier: 'high',
    description: 'Most capable, best for complex tasks'
  },
  'gpt-4o-mini': { 
    name: 'GPT-4o Mini', 
    provider: 'openai' as const, 
    capabilities: ['chat', 'tools'],
    costTier: 'low',
    description: 'Fast and cost-effective'
  },
  'gpt-4-turbo': { 
    name: 'GPT-4 Turbo', 
    provider: 'openai' as const, 
    capabilities: ['chat', 'tools', 'vision'],
    costTier: 'high',
    description: 'Previous flagship model'
  },
  // Anthropic models
  'claude-3-5-sonnet-20241022': { 
    name: 'Claude 3.5 Sonnet', 
    provider: 'anthropic' as const, 
    capabilities: ['chat'],
    costTier: 'medium',
    description: 'Balanced performance'
  },
  'claude-3-opus-20240229': { 
    name: 'Claude 3 Opus', 
    provider: 'anthropic' as const, 
    capabilities: ['chat'],
    costTier: 'high',
    description: 'Most capable Claude model'
  },
} as const;

export type ModelId = keyof typeof AVAILABLE_MODELS;

// Model selection modes
export type ModelMode = 'auto' | ModelId;

// Default model configurations
export const MODELS = {
  // Cost-effective model for regular chat
  CHAT: 'gpt-4o-mini' as ModelId,
  // More capable model for complex tool operations
  TOOLS: 'gpt-4o' as ModelId,
  // Anthropic models
  CLAUDE_CHAT: 'claude-3-5-sonnet-20241022' as ModelId,
} as const;

/**
 * Select the best model based on mode and task requirements
 */
export function selectModel(
  mode: ModelMode,
  requiresTools: boolean = false
): ModelId {
  if (mode === 'auto') {
    // Auto mode: use mini for chat, full for tools
    return requiresTools ? MODELS.TOOLS : MODELS.CHAT;
  }
  
  // If specific model selected, validate it supports tools if needed
  if (requiresTools) {
    const modelInfo = AVAILABLE_MODELS[mode];
    if (!modelInfo.capabilities.includes('tools')) {
      console.warn(`Model ${mode} doesn't support tools, falling back to ${MODELS.TOOLS}`);
      return MODELS.TOOLS;
    }
  }
  
  return mode;
}

// Initialize clients (will be null if API keys not set)
const openai = process.env.OPENAI_API_KEY 
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

const anthropic = process.env.ANTHROPIC_API_KEY
  ? new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  : null;

/**
 * Get OpenAI client instance for direct API usage (e.g., function calling)
 * This is used by routes that need direct access to the OpenAI client
 */
export async function getAIClient(userId: string): Promise<OpenAI> {
  // TODO: In the future, check if user has BYOK and use their key
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY not configured. Please add your OpenAI API key to .env.local');
  }
  
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

/**
 * Check if OpenAI is configured
 */
export function isOpenAIConfigured(): boolean {
  return !!process.env.OPENAI_API_KEY;
}

/**
 * Check if Anthropic is configured
 */
export function isAnthropicConfigured(): boolean {
  return !!process.env.ANTHROPIC_API_KEY;
}

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface ChatOptions {
  provider: AIProvider;
  tone: AITone;
  userName?: string;
  messages: ChatMessage[];
  systemPrompt?: string; // Allow custom system prompt
}

export async function chat(options: ChatOptions): Promise<string> {
  const { provider, tone, userName, messages, systemPrompt: customSystemPrompt } = options;
  const systemPrompt = customSystemPrompt || getSystemPrompt(tone, userName);

  if (provider === 'openai') {
    if (!openai) {
      throw new Error('OpenAI API key not configured. Please add OPENAI_API_KEY to your .env.local file.');
    }
    return chatWithOpenAI(systemPrompt, messages);
  } else if (provider === 'anthropic') {
    if (!anthropic) {
      throw new Error('Anthropic API key not configured. Please add ANTHROPIC_API_KEY to your .env.local file.');
    }
    return chatWithClaude(systemPrompt, messages);
  } else {
    throw new Error(`Unknown AI provider: ${provider}. Please configure OpenAI or Anthropic.`);
  }
}

async function chatWithOpenAI(systemPrompt: string, messages: ChatMessage[]): Promise<string> {
  if (!openai) throw new Error('OpenAI client not initialized');
  
  const response = await openai.chat.completions.create({
    model: MODELS.CHAT,
    messages: [
      { role: 'system', content: systemPrompt },
      ...messages.map(m => ({ role: m.role as 'user' | 'assistant', content: m.content })),
    ],
    max_tokens: 300,
    temperature: 0.7,
  });

  return response.choices[0]?.message?.content || 'Sorry, I couldn\'t generate a response.';
}

async function chatWithClaude(systemPrompt: string, messages: ChatMessage[]): Promise<string> {
  if (!anthropic) throw new Error('Anthropic client not initialized');
  
  const response = await anthropic.messages.create({
    model: MODELS.CLAUDE_CHAT,
    max_tokens: 300,
    system: systemPrompt,
    messages: messages.map(m => ({ role: m.role, content: m.content })),
  });

  const textBlock = response.content.find(block => block.type === 'text');
  return textBlock && 'text' in textBlock ? textBlock.text : 'Sorry, I couldn\'t generate a response.';
}

/**
 * Chat with OpenAI using function calling (tools)
 */
export async function chatWithTools(
  systemPrompt: string,
  messages: ChatMessage[],
  tools: OpenAI.Chat.Completions.ChatCompletionTool[],
  model: ModelId = MODELS.TOOLS
): Promise<OpenAI.Chat.Completions.ChatCompletion> {
  if (!openai) {
    throw new Error('OpenAI API key not configured. Please add OPENAI_API_KEY to your .env.local file.');
  }
  
  // Ensure we're using an OpenAI model that supports tools
  const modelInfo = AVAILABLE_MODELS[model];
  const actualModel = modelInfo.provider === 'openai' && modelInfo.capabilities.includes('tools')
    ? model
    : MODELS.TOOLS;
  
  console.log(`[chatWithTools] Using model: ${actualModel}`);
  
  return openai.chat.completions.create({
    model: actualModel,
    messages: [
      { role: 'system', content: systemPrompt },
      ...messages.map(m => ({ role: m.role as 'user' | 'assistant', content: m.content })),
    ],
    tools,
    tool_choice: 'auto',
    max_tokens: 500,
    temperature: 0.7,
  });
}

/**
 * Simple completion without tools (for follow-up after tool execution)
 */
export async function completeWithContext(
  systemPrompt: string,
  messages: Array<{ role: 'user' | 'assistant' | 'system' | 'tool'; content: string; tool_call_id?: string }>
): Promise<string> {
  if (!openai) {
    throw new Error('OpenAI API key not configured. Please add OPENAI_API_KEY to your .env.local file.');
  }
  
  const response = await openai.chat.completions.create({
    model: MODELS.CHAT,
    messages: [
      { role: 'system', content: systemPrompt },
      ...messages as OpenAI.Chat.Completions.ChatCompletionMessageParam[],
    ],
    max_tokens: 300,
    temperature: 0.7,
  });

  return response.choices[0]?.message?.content || 'Done!';
}

// ============================================================================
// RESPONSES API WITH WEB SEARCH
// ============================================================================

interface ResponsesApiResult {
  text: string;
  sources?: Array<{ title: string; url: string }>;
  usedWebSearch: boolean;
}

// Formatting instructions for web search responses
const WEB_SEARCH_FORMATTING = `
## Response Formatting Rules (ALWAYS FOLLOW):

You are a Grade-A personal assistant. Format ALL responses for easy reading:

1. **Be Concise**: Summarize information, don't dump raw content
2. **Use Bullet Points**: Key facts should be in bullet lists
3. **Structure with Headers**: Use **bold headers** to organize sections
4. **Clean Links**: Format links as [descriptive text](url) - never show raw URLs
5. **Max 3-5 Key Points**: Focus on what matters most to the user
6. **Add Context**: Brief intro sentence, then structured content
7. **No Walls of Text**: Break up information into digestible chunks
8. **Video Suggestions**: For news/events, suggest 1-2 relevant YouTube clips

## Video Source Guidelines:
When suggesting YouTube videos, PREFER these unbiased/balanced sources:
- Reuters, AP News, PBS NewsHour, NPR
- Al Jazeera English, BBC News, DW News
- The Economist, Financial Times
- Breaking Points, The Hill
- CSPAN (for US politics)
AVOID partisan outlets: CNN, Fox News, MSNBC, Newsmax, OAN

Example format:
**Topic Overview**
Brief 1-2 sentence summary.

**Key Points:**
- First important point
- Second important point  
- Third important point

**Watch:** [Short video title](youtube-url) (3 min, Reuters)

**Read More:** [Article Title](url)
`;

/**
 * Use OpenAI's Responses API with built-in web search capability.
 * This allows the AI to search the web for real-time information without
 * requiring any additional API keys from the user.
 */
export async function chatWithWebSearch(
  systemPrompt: string,
  messages: ChatMessage[],
  model: string = 'gpt-4o'
): Promise<ResponsesApiResult> {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OpenAI API key not configured.');
  }

  // Enhance system prompt with formatting instructions
  const enhancedSystemPrompt = systemPrompt + '\n\n' + WEB_SEARCH_FORMATTING;

  // Build the input for the Responses API
  const input = [
    {
      role: 'system',
      content: enhancedSystemPrompt,
    },
    ...messages.map(m => ({
      role: m.role,
      content: m.content,
    })),
  ];

  console.log(`[Responses API] Calling with web_search enabled, model: ${model}`);

  try {
    const response = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model,
        input,
        tools: [{ type: 'web_search' }],
        tool_choice: 'auto',
        include: ['web_search_call.results'],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[Responses API] Error:', response.status, errorText);
      
      // If Responses API fails (maybe not available), fall back to regular chat
      if (response.status === 404 || response.status === 400) {
        console.log('[Responses API] Falling back to Chat Completions API');
        return await fallbackToRegularChat(systemPrompt, messages, model);
      }
      
      throw new Error(`Responses API error: ${response.status}`);
    }

    const data = await response.json();
    console.log('[Responses API] Response received');

    // Extract the text response and any web search sources
    let text = '';
    let sources: Array<{ title: string; url: string }> = [];
    let usedWebSearch = false;

    // Parse the response output
    if (data.output && Array.isArray(data.output)) {
      for (const item of data.output) {
        if (item.type === 'message' && item.content) {
          for (const content of item.content) {
            if (content.type === 'output_text' || content.type === 'text') {
              text += content.text;
            }
          }
        }
        if (item.type === 'web_search_call') {
          usedWebSearch = true;
          if (item.results) {
            sources = item.results.map((r: { title: string; url: string }) => ({
              title: r.title,
              url: r.url,
            }));
          }
        }
      }
    }

    // If no text was extracted, try alternative response format
    if (!text && data.choices?.[0]?.message?.content) {
      text = data.choices[0].message.content;
    }

    return {
      text: text || 'I found some information but had trouble formatting it.',
      sources: sources.length > 0 ? sources : undefined,
      usedWebSearch,
    };
  } catch (error) {
    console.error('[Responses API] Error:', error);
    // Fall back to regular chat on any error
    return await fallbackToRegularChat(systemPrompt, messages, model);
  }
}

/**
 * Fallback to regular Chat Completions API if Responses API is unavailable
 */
async function fallbackToRegularChat(
  systemPrompt: string,
  messages: ChatMessage[],
  model: string
): Promise<ResponsesApiResult> {
  if (!openai) {
    throw new Error('OpenAI client not initialized');
  }

  const response = await openai.chat.completions.create({
    model,
    messages: [
      { role: 'system', content: systemPrompt + '\n\nNote: I cannot search the web for real-time information. I can only provide information based on my training data.' },
      ...messages.map(m => ({ role: m.role as 'user' | 'assistant', content: m.content })),
    ],
    max_tokens: 500,
    temperature: 0.7,
  });

  return {
    text: response.choices[0]?.message?.content || 'Sorry, I couldn\'t generate a response.',
    usedWebSearch: false,
  };
}

/**
 * Check if web search might be needed based on the message content
 */
export function mightNeedWebSearch(message: string): boolean {
  const lowerMessage = message.toLowerCase();
  
  // Normalize common variations (remove apostrophes, normalize spacing)
  const normalizedMessage = lowerMessage
    .replace(/[''`]/g, '')  // Remove apostrophes: what's -> whats
    .replace(/\s+/g, ' ');   // Normalize spaces
  
  // Keywords that strongly indicate need for real-time info
  const searchKeywords = [
    'news', 'trending', 'latest', 'current', 'today', 'recent', 'now',
    'happening', 'update', 'price', 'stock', 'market', 'weather',
    'score', 'result', 'election', 'announcement', 'breaking',
    'search', 'look up', 'find out', 'check'
  ];
  
  // Phrases that indicate current events questions
  const searchPhrases = [
    'whats going on', 'what is going on', 'what going on',
    'whats happening', 'what is happening', 'what happening',
    'tell me about', 'tell me whats', 'tell me what is',
    'any news', 'any updates', 'anything new',
    'how is the', 'hows the',
  ];
  
  // Topics that typically need current info when asked about
  const currentEventTopics = [
    'politic', 'government', 'president', 'prime minister', 'congress', 
    'parliament', 'senate', 'election', 'vote', 'campaign',
    'war', 'conflict', 'crisis', 'protest', 'strike',
    'economy', 'inflation', 'recession', 'gdp',
    'crypto', 'bitcoin', 'ethereum',
    'sports', 'game', 'match', 'championship', 'tournament',
  ];
  
  // Check for direct keyword matches
  if (searchKeywords.some(kw => normalizedMessage.includes(kw))) {
    return true;
  }
  
  // Check for phrase matches
  if (searchPhrases.some(phrase => normalizedMessage.includes(phrase))) {
    return true;
  }
  
  // Check if asking about current event topics with question words
  const isQuestion = /^(what|who|how|when|where|why|is|are|did|does|has|have|any)\b/.test(normalizedMessage) 
    || normalizedMessage.includes('?');
  
  if (isQuestion && currentEventTopics.some(topic => normalizedMessage.includes(topic))) {
    return true;
  }
  
  return false;
}





