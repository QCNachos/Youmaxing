import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { isSupabaseConfigured } from '@/lib/env';
import type { Json } from '@/types/supabase';

// Type for message validation
interface ConversationMessage {
  id: string;
  type: string;
  content: string;
  timestamp: string;
  isFromUser: boolean;
  aspectId?: string;
  metadata?: Record<string, Json | undefined>;
}

// Simple validation function (avoiding Zod issues)
function validateMessages(messages: unknown): messages is ConversationMessage[] {
  if (!Array.isArray(messages)) return false;
  return messages.every(m => 
    typeof m === 'object' && m !== null &&
    typeof m.id === 'string' &&
    typeof m.content === 'string' &&
    typeof m.isFromUser === 'boolean'
  );
}

// GET - Load conversation
export async function GET(request: NextRequest) {
  try {
    if (!isSupabaseConfigured) {
      return NextResponse.json({ messages: [] });
    }

    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ messages: [] });
    }

    // Get aspect from query params (default to 'global')
    const { searchParams } = new URL(request.url);
    const aspect = searchParams.get('aspect') || 'global';

    // Fetch conversation for this user and aspect
    const { data, error } = await supabase
      .from('conversations')
      .select('messages, created_at')
      .eq('user_id', user.id)
      .eq('aspect', aspect)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
      console.error('Error loading conversation:', error);
      return NextResponse.json({ messages: [] });
    }

    return NextResponse.json({ 
      messages: data?.messages || [],
      lastUpdated: data?.created_at,
    });
  } catch (error) {
    console.error('Conversation load error:', error);
    return NextResponse.json({ messages: [] });
  }
}

// POST - Save conversation
export async function POST(request: NextRequest) {
  try {
    if (!isSupabaseConfigured) {
      return NextResponse.json({ success: false, error: 'Not configured' }, { status: 503 });
    }

    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    
    // Validate messages array
    if (!body.messages || !validateMessages(body.messages)) {
      return NextResponse.json(
        { success: false, error: 'Invalid request body' },
        { status: 400 }
      );
    }

    const messages = body.messages as ConversationMessage[];
    const aspect = (body.aspect as string) || 'global';

    // Keep only last 50 messages to avoid bloat
    const trimmedMessages = messages.slice(-50);

    // Upsert conversation using the unique constraint on (user_id, aspect)
    const { error } = await supabase
      .from('conversations')
      .upsert(
        {
          user_id: user.id,
          aspect,
          messages: trimmedMessages as unknown as Json,
          created_at: new Date().toISOString(),
        },
        {
          onConflict: 'user_id,aspect',
        }
      );

    if (error) {
      console.error('Conversation save error:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to save conversation' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Conversation save error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE - Clear conversation
export async function DELETE(request: NextRequest) {
  try {
    if (!isSupabaseConfigured) {
      return NextResponse.json({ success: false, error: 'Not configured' }, { status: 503 });
    }

    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const aspect = searchParams.get('aspect') || 'global';

    await supabase
      .from('conversations')
      .delete()
      .eq('user_id', user.id)
      .eq('aspect', aspect);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Conversation delete error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
