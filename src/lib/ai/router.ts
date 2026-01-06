import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import { createClient } from '@/lib/supabase/server';

export type AIProvider = 'openai' | 'anthropic' | 'user_openai' | 'user_anthropic';
export type AITier = 'free_byok' | 'basic' | 'intermediate' | 'pro';

export interface AIMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface AIRouterResult {
  message: string;
  provider: AIProvider;
  model: string;
  tokensUsed?: number;
  cost?: number;
}

/**
 * Main AI router - determines which API key and model to use based on user's tier
 */
export async function routeAIRequest(
  userId: string,
  messages: AIMessage[]
): Promise<AIRouterResult> {
  const supabase = await createClient();
  
  // TODO: Implement subscription checks when monetization is added
  // For now, use platform keys for all users
  const tier: AITier = 'basic'; // Default tier
  
  // TODO: Implement BYOK when feature is added
  
  // 3. Check usage quota for paid tiers (Basic and Intermediate)
  if (tier === 'basic' || tier === 'intermediate') {
    const canMakeRequest = await checkAndIncrementUsage(userId, tier);
    if (!canMakeRequest) {
      throw new Error('QUOTA_EXCEEDED');
    }
  }
  
  // 4. Route to appropriate model based on tier (using our API keys)
  const modelConfig = {
    basic: { provider: 'openai' as const, model: 'gpt-3.5-turbo' },
    intermediate: { provider: 'anthropic' as const, model: 'claude-3-sonnet-20240229' },
    pro: { provider: 'anthropic' as const, model: 'claude-3-opus-20240229' },
  };
  
  const config = modelConfig[tier as 'basic' | 'intermediate' | 'pro'];
  
  if (config.provider === 'openai') {
    return await callOpenAIWithOurKey(config.model, messages, userId);
  } else {
    return await callAnthropicWithOurKey(config.model, messages, userId);
  }
}

/**
 * Check if user can make a request and increment usage counter
 */
async function checkAndIncrementUsage(userId: string, tier: AITier): Promise<boolean> {
  // TODO: Implement usage tracking when monetization is added
  return true; // No usage limits for now
}

/**
 * Call OpenAI with user's API key
 */
async function callOpenAIWithUserKey(
  apiKey: string,
  messages: AIMessage[],
  userId: string
): Promise<AIRouterResult> {
  const openai = new OpenAI({ apiKey });
  
  const startTime = Date.now();
  const response = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: messages as any,
    temperature: 0.7,
    max_tokens: 1000,
  });
  
  const responseTime = Date.now() - startTime;
  
  // Log the message
  await logAIMessage(userId, 'user_openai', 'gpt-4', response.usage?.total_tokens || 0, responseTime, true);
  
  return {
    message: response.choices[0]?.message?.content || '',
    provider: 'user_openai',
    model: 'gpt-4',
    tokensUsed: response.usage?.total_tokens,
  };
}

/**
 * Call Anthropic with user's API key
 */
async function callAnthropicWithUserKey(
  apiKey: string,
  messages: AIMessage[],
  userId: string
): Promise<AIRouterResult> {
  const anthropic = new Anthropic({ apiKey });
  
  const startTime = Date.now();
  const response = await anthropic.messages.create({
    model: 'claude-3-sonnet-20240229',
    max_tokens: 1000,
    messages: messages.filter(m => m.role !== 'system') as any,
  });
  
  const responseTime = Date.now() - startTime;
  
  // Log the message
  await logAIMessage(userId, 'user_anthropic', 'claude-3-sonnet-20240229', response.usage.input_tokens + response.usage.output_tokens, responseTime, true);
  
  return {
    message: response.content[0]?.type === 'text' ? response.content[0].text : '',
    provider: 'user_anthropic',
    model: 'claude-3-sonnet-20240229',
    tokensUsed: response.usage.input_tokens + response.usage.output_tokens,
  };
}

/**
 * Call OpenAI with our API key
 */
async function callOpenAIWithOurKey(
  model: string,
  messages: AIMessage[],
  userId: string
): Promise<AIRouterResult> {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY not configured');
  }
  
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  
  const startTime = Date.now();
  const response = await openai.chat.completions.create({
    model,
    messages: messages as any,
    temperature: 0.7,
    max_tokens: 1000,
  });
  
  const responseTime = Date.now() - startTime;
  
  // Log the message
  await logAIMessage(userId, 'openai', model, response.usage?.total_tokens || 0, responseTime, false);
  
  return {
    message: response.choices[0]?.message?.content || '',
    provider: 'openai',
    model,
    tokensUsed: response.usage?.total_tokens,
  };
}

/**
 * Call Anthropic with our API key
 */
async function callAnthropicWithOurKey(
  model: string,
  messages: AIMessage[],
  userId: string
): Promise<AIRouterResult> {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error('ANTHROPIC_API_KEY not configured');
  }
  
  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  
  const startTime = Date.now();
  const response = await anthropic.messages.create({
    model,
    max_tokens: 1000,
    messages: messages.filter(m => m.role !== 'system') as any,
  });
  
  const responseTime = Date.now() - startTime;
  
  // Log the message
  await logAIMessage(userId, 'anthropic', model, response.usage.input_tokens + response.usage.output_tokens, responseTime, false);
  
  return {
    message: response.content[0]?.type === 'text' ? response.content[0].text : '',
    provider: 'anthropic',
    model,
    tokensUsed: response.usage.input_tokens + response.usage.output_tokens,
  };
}

/**
 * Log AI message for analytics
 */
async function logAIMessage(
  userId: string,
  provider: AIProvider,
  model: string,
  tokensUsed: number,
  responseTimeMs: number,
  isByok: boolean
) {
  const supabase = await createClient();
  
  // Estimate cost (rough estimates)
  const costPer1kTokens = {
    'gpt-3.5-turbo': 0.002,
    'gpt-4': 0.03,
    'gpt-4-turbo': 0.01,
    'claude-3-haiku-20240307': 0.00025,
    'claude-3-sonnet-20240229': 0.003,
    'claude-3-opus-20240229': 0.015,
  };
  
  // TODO: Implement message logging when analytics feature is added
  // const estimatedCost = (tokensUsed / 1000) * (costPer1kTokens[model as keyof typeof costPer1kTokens] || 0);
  // await supabase.from('ai_message_log').insert({
  //   user_id: userId,
  //   provider,
  //   model,
  //   tokens_used: tokensUsed,
  //   estimated_cost_usd: estimatedCost,
  //   is_byok: isByok,
  //   response_time_ms: responseTimeMs,
  //   success: true,
  // });
}

