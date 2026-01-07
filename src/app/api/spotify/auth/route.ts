import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getSpotifyAuthUrl } from '@/lib/spotify/client';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }
    
    const authUrl = getSpotifyAuthUrl(user.id);
    
    return NextResponse.json({ url: authUrl });
    
  } catch (error) {
    console.error('Spotify auth error:', error);
    
    if (error instanceof Error && error.message.includes('SPOTIFY_CLIENT_ID')) {
      return NextResponse.json(
        { error: 'Spotify not configured' },
        { status: 503 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to generate auth URL' },
      { status: 500 }
    );
  }
}



