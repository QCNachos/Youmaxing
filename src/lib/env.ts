/**
 * Client-safe env (NEXT_PUBLIC_* only).
 *
 * Uses default placeholder values for development/build
 * to allow the app to compile without actual credentials.
 */

const DEFAULT_SUPABASE_URL = 'https://placeholder.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY = 'placeholder-anon-key';

export const publicEnv = {
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || DEFAULT_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY,
  // Safer default: demo must be explicitly enabled in production.
  NEXT_PUBLIC_DEMO_MODE: process.env.NEXT_PUBLIC_DEMO_MODE || 'false',
};

export const isSupabaseConfigured = 
  publicEnv.NEXT_PUBLIC_SUPABASE_URL !== DEFAULT_SUPABASE_URL &&
  publicEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY !== DEFAULT_SUPABASE_ANON_KEY;

export const isDemoMode =
  publicEnv.NEXT_PUBLIC_DEMO_MODE === 'true' ||
  (process.env.NODE_ENV !== 'production' && !isSupabaseConfigured);
