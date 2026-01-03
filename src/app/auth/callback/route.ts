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
  const redirectPath =
    next && isSafeInternalRedirectPath(next) ? next : '/dashboard';

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      const url = new URL('/login', requestUrl.origin);
      url.searchParams.set('error', 'oauth_callback_failed');
      return NextResponse.redirect(url);
    }
  }

  // Check if user has completed onboarding
  // For now, redirect to dashboard
  return NextResponse.redirect(new URL(redirectPath, requestUrl.origin));
}

