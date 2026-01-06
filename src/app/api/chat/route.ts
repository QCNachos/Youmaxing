import { NextRequest, NextResponse } from 'next/server';
import { chat } from '@/lib/ai/client';
import { routeAIRequest } from '@/lib/ai/router';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { isDemoMode, isSupabaseConfigured } from '@/lib/env';
import type { AIProvider, AITone } from '@/types/database';

const chatBodySchema = z.object({
  messages: z
    .array(
      z.object({
        role: z.enum(['user', 'assistant']),
        content: z.string().min(1).max(2000),
      })
    )
    .min(1)
    .max(20),
  provider: z.enum(['openai', 'anthropic']).optional(),
  tone: z.enum(['chill', 'professional', 'motivational', 'friendly']).optional(),
  userName: z.string().max(80).optional(),
});

export async function POST(request: NextRequest) {
  try {
    // In production, require Supabase to be configured and the user to be authenticated.
    if (process.env.NODE_ENV === 'production') {
      if (!isSupabaseConfigured) {
        return NextResponse.json(
          { error: 'Server is not configured' },
          { status: 503 }
        );
      }
      const supabase = await createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    }

    const parsed = chatBodySchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      );
    }

    const { messages, provider, tone, userName } = parsed.data as {
      messages: { role: 'user' | 'assistant'; content: string }[];
      provider?: AIProvider;
      tone?: AITone;
      userName?: string;
    };

    // Dev/demo fallback: if Supabase isn't configured, still allow the UI to work locally.
    if (process.env.NODE_ENV !== 'production' && isDemoMode && !isSupabaseConfigured) {
      const response = await chat({
        provider: provider ?? 'anthropic',
        tone: tone ?? 'chill',
        userName,
        messages,
      });
      return NextResponse.json({ message: response });
    }

    // Get authenticated user
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Use the new AI router with BYOK support
    try {
      const result = await routeAIRequest(user.id, messages);
      return NextResponse.json({ 
        message: result.message,
        provider: result.provider,
        model: result.model,
      });
    } catch (error: any) {
      // Handle specific errors
      if (error.message === 'QUOTA_EXCEEDED') {
        return NextResponse.json({
          error: 'AI quota exceeded',
          message: 'You\'ve reached your monthly AI message limit. Upgrade to Pro for unlimited messages or add your own API key.',
          upgradeUrl: '/settings?tab=subscription',
        }, { status: 429 });
      } else if (error.message === 'BYOK_KEY_MISSING') {
        return NextResponse.json({
          error: 'API key required',
          message: 'Please add your OpenAI or Anthropic API key in Settings, or upgrade to a paid plan.',
          settingsUrl: '/settings?tab=api-keys',
        }, { status: 402 });
      } else if (error.message === 'SUBSCRIPTION_INACTIVE') {
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
      { error: 'Failed to generate response' },
      { status: 500 }
    );
  }
}

