import { NextResponse } from 'next/server';
import { AVAILABLE_MODELS, isOpenAIConfigured, isAnthropicConfigured } from '@/lib/ai/client';

/**
 * GET /api/chat/models
 * Returns available AI models that the user can select from
 */
export async function GET() {
  const openaiConfigured = isOpenAIConfigured();
  const anthropicConfigured = isAnthropicConfigured();

  // Filter models based on which providers are configured
  const availableModels = Object.entries(AVAILABLE_MODELS)
    .filter(([, info]) => {
      if (info.provider === 'openai' && !openaiConfigured) return false;
      if (info.provider === 'anthropic' && !anthropicConfigured) return false;
      return true;
    })
    .map(([id, info]) => ({
      id,
      name: info.name,
      provider: info.provider,
      capabilities: info.capabilities,
      costTier: info.costTier,
      description: info.description,
    }));

  return NextResponse.json({
    models: [
      // Add auto mode first
      {
        id: 'auto',
        name: 'Auto',
        provider: 'auto',
        capabilities: ['chat', 'tools'],
        costTier: 'optimized',
        description: 'Automatically selects the best model for each task',
      },
      ...availableModels,
    ],
    defaultModel: 'auto',
    openaiConfigured,
    anthropicConfigured,
  });
}
