import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

function isSafeInternalRedirectPath(path: string) {
  // Only allow same-origin, internal paths (avoid open redirects).
  // Disallow protocol-relative URLs like `//evil.com`.
  return path.startsWith('/') && !path.startsWith('//');
}

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const next = requestUrl.searchParams.get('next');

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      const url = new URL('/login', requestUrl.origin);
      url.searchParams.set('error', 'oauth_callback_failed');
      return NextResponse.redirect(url);
    }

    // Check if user has completed onboarding
    const { data: preferences } = await supabase
      .from('user_preferences')
      .select('onboarding_completed')
      .single<{ onboarding_completed: boolean }>();

    // Redirect to onboarding if not completed
    if (preferences && !preferences.onboarding_completed) {
      return NextResponse.redirect(new URL('/onboarding', requestUrl.origin));
    }

    // Use custom redirect or dashboard
    const redirectPath =
      next && isSafeInternalRedirectPath(next) ? next : '/dashboard';
    return NextResponse.redirect(new URL(redirectPath, requestUrl.origin));
  }

  // No code, redirect to login
  return NextResponse.redirect(new URL('/login', requestUrl.origin));
}

