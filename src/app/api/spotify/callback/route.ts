import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { exchangeCodeForTokens } from '@/lib/spotify/client';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  const state = searchParams.get('state'); // Contains user_id
  const error = searchParams.get('error');
  
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  
  // Handle user denial
  if (error) {
    return NextResponse.redirect(
      `${baseUrl}/dashboard?app_error=${encodeURIComponent('Spotify connection was denied')}`
    );
  }
  
  if (!code || !state) {
    return NextResponse.redirect(
      `${baseUrl}/dashboard?app_error=${encodeURIComponent('Invalid callback parameters')}`
    );
  }
  
  try {
    // Exchange code for tokens
    const tokens = await exchangeCodeForTokens(code);
    
    // Store tokens in user_installed_apps
    // Note: user_installed_apps table must be created via migration 00006_entertainment_social.sql
    const supabase = await createClient();
    
    const { error: updateError } = await supabase
      .from('user_installed_apps' as any)
      .upsert({
        user_id: state,
        app_slug: 'music',
        oauth_tokens: {
          access_token: tokens.access_token,
          refresh_token: tokens.refresh_token,
          expires_at: tokens.expires_at,
        },
        is_connected: true,
        installed_at: new Date().toISOString(),
      } as any, {
        onConflict: 'user_id,app_slug',
      });
    
    if (updateError) {
      console.error('Failed to store Spotify tokens:', updateError);
      return NextResponse.redirect(
        `${baseUrl}/dashboard?app_error=${encodeURIComponent('Failed to save connection')}`
      );
    }
    
    // Redirect to music app with success
    return NextResponse.redirect(
      `${baseUrl}/dashboard?app_connected=spotify`
    );
    
  } catch (err) {
    console.error('Spotify OAuth error:', err);
    return NextResponse.redirect(
      `${baseUrl}/dashboard?app_error=${encodeURIComponent('Failed to connect Spotify')}`
    );
  }
}

