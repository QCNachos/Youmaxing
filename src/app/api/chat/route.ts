import { NextRequest, NextResponse } from 'next/server';
import { chat } from '@/lib/ai/client';
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

    const response = await chat({
      provider: provider ?? 'anthropic',
      tone: tone ?? 'chill',
      userName,
      messages,
    });

    return NextResponse.json({ message: response });
  } catch (error) {
    console.error('Chat API error');
    return NextResponse.json(
      { error: 'Failed to generate response' },
      { status: 500 }
    );
  }
}

