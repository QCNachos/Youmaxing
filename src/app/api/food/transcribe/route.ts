import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { createClient } from '@/lib/supabase/server';
import { isSupabaseConfigured } from '@/lib/env';

// OpenAI client for Whisper API
const openai = process.env.OPENAI_API_KEY 
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

export async function POST(request: NextRequest) {
  try {
    // Authentication check in production
    if (process.env.NODE_ENV === 'production') {
      if (!isSupabaseConfigured) {
        return NextResponse.json({ error: 'Server not configured' }, { status: 503 });
      }
      const supabase = await createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    }

    if (!openai) {
      return NextResponse.json(
        { error: 'Voice transcription not configured. Please add OPENAI_API_KEY.' },
        { status: 503 }
      );
    }

    const formData = await request.formData();
    const audioFile = formData.get('audio') as File | null;

    if (!audioFile) {
      return NextResponse.json(
        { error: 'No audio file provided' },
        { status: 400 }
      );
    }

    // Validate file type
    const validTypes = ['audio/webm', 'audio/mp3', 'audio/mp4', 'audio/mpeg', 'audio/wav', 'audio/m4a'];
    if (!validTypes.some(type => audioFile.type.includes(type.split('/')[1]))) {
      return NextResponse.json(
        { error: 'Invalid audio format. Supported: webm, mp3, mp4, wav, m4a' },
        { status: 400 }
      );
    }

    // Limit file size (25MB max for Whisper)
    const MAX_SIZE = 25 * 1024 * 1024;
    if (audioFile.size > MAX_SIZE) {
      return NextResponse.json(
        { error: 'Audio file too large. Maximum 25MB.' },
        { status: 400 }
      );
    }

    // Transcribe using Whisper
    const transcription = await openai.audio.transcriptions.create({
      file: audioFile,
      model: 'whisper-1',
      language: 'en',
      prompt: 'This is a food logging entry. The user is describing what they ate or are about to eat, including meals, snacks, drinks, portions, and ingredients.',
    });

    // Clean up and enhance the transcript for food logging
    const cleanedTranscript = cleanFoodTranscript(transcription.text);

    return NextResponse.json({
      success: true,
      transcript: cleanedTranscript,
      raw_transcript: transcription.text,
    });

  } catch (error) {
    console.error('Voice transcription error:', error);
    return NextResponse.json(
      { error: 'Failed to transcribe audio', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

/**
 * Clean and enhance food-related transcripts
 * Handles common speech patterns when logging food
 */
function cleanFoodTranscript(text: string): string {
  let cleaned = text.trim();

  // Remove common filler phrases
  const fillerPhrases = [
    /^(um|uh|so|like|okay|well|let me see|let's see)\s*,?\s*/gi,
    /\s*(um|uh)\s*/gi,
    /^(i (had|ate|drank|just had|just ate))\s+/i,
  ];

  for (const pattern of fillerPhrases) {
    cleaned = cleaned.replace(pattern, '');
  }

  // Normalize common food terms
  const foodNormalizations: [RegExp, string][] = [
    [/\bprotein shake\b/gi, 'protein shake'],
    [/\bpre[ -]?workout\b/gi, 'pre-workout'],
    [/\bpost[ -]?workout\b/gi, 'post-workout'],
    [/\bpb\s*&?\s*j\b/gi, 'peanut butter and jelly sandwich'],
    [/\bblt\b/gi, 'BLT sandwich'],
    [/\bpb\b/gi, 'peanut butter'],
    [/\bOJ\b/g, 'orange juice'],
  ];

  for (const [pattern, replacement] of foodNormalizations) {
    cleaned = cleaned.replace(pattern, replacement);
  }

  // Capitalize first letter
  if (cleaned.length > 0) {
    cleaned = cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
  }

  return cleaned;
}



