# Production Deployment TODO

## ✅ Completed
- [x] Deployed to Vercel (Preview)
- [x] Connected GitHub repository
- [x] Created Vercel project: https://vercel.com/qcnachos-projects/youmaxing

## 🚧 Required Before Production

### 1. Environment Variables Setup
Go to: https://vercel.com/qcnachos-projects/youmaxing/settings/environment-variables

Add all required environment variables:

#### Required (Supabase)
- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anon/public key

#### Required for AI Features
- `OPENAI_API_KEY` - OpenAI API key (for food analysis, chat, etc.)
- `ANTHROPIC_API_KEY` - Anthropic API key (for Claude AI features)

#### Optional Integrations
- `TMDB_API_KEY` - The Movie Database API (for Films streaming availability)
- `SPOTIFY_CLIENT_ID` - Spotify API credentials
- `SPOTIFY_CLIENT_SECRET` - Spotify API credentials
- `NEXT_PUBLIC_SPOTIFY_CLIENT_ID` - Public Spotify client ID

#### App Configuration
- `NEXT_PUBLIC_APP_URL` - Set to your production URL (e.g., https://youmaxing.vercel.app)
- `NEXT_PUBLIC_DEMO_MODE` - Set to `false` for production

### 2. Supabase Configuration ⚠️ IMPORTANT

#### Auth URL Configuration
Go to: https://supabase.com/dashboard/project/egymipweqxkhrezdauvu/auth/url-configuration

**Update these settings:**
- **Site URL**: Set to your production URL (e.g., `https://youmaxing-bmfrkj4c6-qcnachos-projects.vercel.app`)
- **Redirect URLs**: Add these:
  - `https://youmaxing-bmfrkj4c6-qcnachos-projects.vercel.app/auth/callback`
  - `https://youmaxing-bmfrkj4c6-qcnachos-projects.vercel.app/**`
  - If using custom domain, add those URLs too

#### Database Setup (COMPLETED ✅)
- ✅ Migration 00001 executed - all base tables created
- ✅ Trigger `handle_new_user()` fixed and working
- ✅ RLS policies are properly configured

#### Optional: Disable Email Confirmation (for testing)
Go to: https://supabase.com/dashboard/project/egymipweqxkhrezdauvu/auth/providers
- Find "Email" provider settings
- Toggle "Confirm email" OFF if you want instant signup (not recommended for production)

### 3. Deploy to Production
Once environment variables are set:
```bash
vercel --prod
```

### 4. Post-Deployment
- Test all features in production
- Verify authentication flow
- Test API routes
- Check Spotify OAuth callback
- Monitor errors in Vercel logs

## Current Deployment URLs
- **Preview**: https://youmaxing-bmfrkj4c6-qcnachos-projects.vercel.app
- **Dashboard**: https://vercel.com/qcnachos-projects/youmaxing
- **Settings**: https://vercel.com/qcnachos-projects/youmaxing/settings


