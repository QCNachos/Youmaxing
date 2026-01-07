# Environment Setup Guide

## Create Your `.env.local` File

Copy this into a new file called `.env.local` in your project root:

```bash
## ============================================
## REQUIRED FOR TRAVEL FEATURES TO WORK
## ============================================

## Supabase (REQUIRED)
# 1. Go to https://supabase.com/dashboard
# 2. Create a new project or select existing
# 3. Go to Settings > API
# 4. Copy the Project URL and anon/public key
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here

## ============================================
## OPTIONAL - For AI Features
## ============================================

## OpenAI (for AI chat, food analysis)
# Get API key at https://platform.openai.com/api-keys
# OPTIONAL - Only needed if you want AI features
OPENAI_API_KEY=

## Anthropic Claude (alternative to OpenAI)
# Get API key at https://console.anthropic.com/
# OPTIONAL - Only needed if you want Claude AI
ANTHROPIC_API_KEY=

## ============================================
## OPTIONAL - For Payments
## ============================================

## Stripe (for subscriptions)
# Get keys at https://dashboard.stripe.com/apikeys
# OPTIONAL - Only needed for premium features
STRIPE_SECRET_KEY=
STRIPE_PUBLISHABLE_KEY=
STRIPE_WEBHOOK_SECRET=

# Product Price IDs (create products in Stripe Dashboard)
NEXT_PUBLIC_STRIPE_BASIC_MONTHLY_PRICE_ID=
NEXT_PUBLIC_STRIPE_BASIC_YEARLY_PRICE_ID=
NEXT_PUBLIC_STRIPE_INTERMEDIATE_MONTHLY_PRICE_ID=
NEXT_PUBLIC_STRIPE_INTERMEDIATE_YEARLY_PRICE_ID=
NEXT_PUBLIC_STRIPE_PRO_MONTHLY_PRICE_ID=
NEXT_PUBLIC_STRIPE_PRO_YEARLY_PRICE_ID=

## ============================================
## REQUIRED FOR SECURITY
## ============================================

## Encryption (for BYOK API keys)
# Generate a random 32-character string for production
# For local dev, you can leave this default
ENCRYPTION_KEY=change-this-in-production-to-random-32-chars

## ============================================
## OPTIONAL - For Films Feature
## ============================================

## TMDB API (for Films streaming availability)
# Get a free API key at https://www.themoviedb.org/settings/api
# OPTIONAL - Only needed for films feature
TMDB_API_KEY=

## ============================================
## OPTIONAL - For Music Feature
## ============================================

## Spotify API (for Music integration)
# Get credentials at https://developer.spotify.com/dashboard
# OPTIONAL - Only needed for music features
SPOTIFY_CLIENT_ID=
SPOTIFY_CLIENT_SECRET=
NEXT_PUBLIC_SPOTIFY_CLIENT_ID=

## ============================================
## APP CONFIGURATION
## ============================================

## App URL (for OAuth callbacks)
# Change to your production URL when deploying
NEXT_PUBLIC_APP_URL=http://localhost:3001

## Demo Mode (OPTIONAL)
# Set to true to enable demo mode UI buttons
# Good for testing without real API keys
NEXT_PUBLIC_DEMO_MODE=true
```

---

## Quick Setup Steps

### 1️⃣ Create the file
```bash
# In your project root
touch .env.local
```

### 2️⃣ Copy the template above into `.env.local`

### 3️⃣ Get Supabase Credentials (REQUIRED)

**To make travel features work, you MUST set up Supabase:**

1. Go to https://supabase.com/dashboard
2. Sign in or create account
3. Click "New Project"
4. Fill in:
   - Name: `youmaxing` (or any name)
   - Database Password: (generate a strong one)
   - Region: Choose closest to you
5. Wait 2-3 minutes for project to provision
6. Go to **Settings → API**
7. Copy these values:
   - **Project URL** → Put in `NEXT_PUBLIC_SUPABASE_URL`
   - **anon/public key** → Put in `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 4️⃣ Run the Database Migration

**After setting up Supabase:**

1. In Supabase Dashboard, go to **SQL Editor**
2. Click "New Query"
3. Copy contents of `supabase/migrations/00010_travel_enhancements.sql`
4. Paste into SQL Editor
5. Click **Run**
6. Verify tables created: Go to **Table Editor** and check for:
   - `trips`
   - `bucket_list`
   - `visited_places`

### 5️⃣ Restart Your Dev Server

```bash
# Kill current server (Ctrl+C)
# Then restart
PORT=3001 npm run dev
```

### 6️⃣ Sign Up / Login

1. Go to http://localhost:3001
2. Create an account or login
3. Now the travel features will work!

---

## Minimal Setup (Just to Test)

If you just want to see the UI without database:

```env
NEXT_PUBLIC_SUPABASE_URL=https://placeholder.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=placeholder
NEXT_PUBLIC_APP_URL=http://localhost:3001
NEXT_PUBLIC_DEMO_MODE=true
```

**Note:** This won't save data, but you'll see the UI.

---

## Optional Features Setup

### For AI Chat (Optional)
Get OpenAI key at: https://platform.openai.com/api-keys
```env
OPENAI_API_KEY=sk-...
```

### For Films Feature (Optional)
Get free TMDB key at: https://www.themoviedb.org/settings/api
```env
TMDB_API_KEY=...
```

---

## Troubleshooting

### "Failed to add place" error
- ✅ Check Supabase URL and key are correct
- ✅ Run the migration (step 4 above)
- ✅ Make sure you're logged in
- ✅ Restart dev server after adding .env.local

### "Unauthorized" error
- ✅ Create an account / login
- ✅ Check Supabase is configured

### Server won't start
- ✅ Kill ports: `lsof -ti:3001 | xargs kill -9`
- ✅ Check .env.local syntax (no spaces around =)

---

## What's Required vs Optional

| Feature | Required Env Vars | Optional? |
|---------|------------------|-----------|
| **Travel (trips, map, bucket list)** | Supabase | ❌ Required |
| **AI Chat** | OpenAI or Anthropic | ✅ Optional |
| **Films** | TMDB | ✅ Optional |
| **Music** | Spotify | ✅ Optional |
| **Payments** | Stripe | ✅ Optional |

---

## Security Notes

- ✅ `.env.local` is already in `.gitignore` (won't be committed)
- ✅ Never commit API keys to git
- ✅ Change `ENCRYPTION_KEY` in production
- ✅ Use different Supabase projects for dev/prod

