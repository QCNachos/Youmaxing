# YOUMAXING Setup Instructions

## 🚀 Quick Start (After Implementation)

### Step 1: Run Database Migration

1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Create a new query
4. Copy and paste the contents of `supabase/migrations/00009_byok_subscriptions.sql`
5. Click "Run" to execute the migration
6. Verify tables were created:
   - `user_subscriptions`
   - `user_api_keys`
   - `ai_usage_tracking`
   - `ai_message_log`
   - `tier_limits`

### Step 2: Regenerate Database Types

```bash
# Install Supabase CLI if you haven't
npm install -g supabase

# Login to Supabase
supabase login

# Link your project (get project ID from Supabase dashboard URL)
supabase link --project-ref YOUR_PROJECT_ID

# Generate types
supabase gen types typescript --linked > src/types/database.ts
```

**Alternative (if CLI doesn't work)**:
1. Go to Supabase Dashboard → API Docs → TypeScript
2. Copy the generated types
3. Paste into `src/types/database.ts`

### Step 3: Create Stripe Products

1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. Navigate to **Products** → **Add Product**

**Create 3 Products**:

#### Product 1: YOUMAXING Basic
- Name: `YOUMAXING Basic`
- Description: `500 AI messages/month with GPT-3.5`
- **Pricing**:
  - Monthly: $9.99
  - Yearly: $99 (save $20)
- Copy the Price IDs

#### Product 2: YOUMAXING Intermediate
- Name: `YOUMAXING Intermediate`
- Description: `2,000 AI messages/month with GPT-4`
- **Pricing**:
  - Monthly: $29.99
  - Yearly: $299 (save $60)
- Copy the Price IDs

#### Product 3: YOUMAXING Pro
- Name: `YOUMAXING Pro`
- Description: `Unlimited AI messages with GPT-4 Turbo`
- **Pricing**:
  - Monthly: $99.99
  - Yearly: $999 (save $200)
- Copy the Price IDs

### Step 4: Set Up Stripe Webhook

1. Go to **Developers** → **Webhooks** → **Add Endpoint**
2. **Endpoint URL**: `https://your-domain.com/api/stripe/webhook`
   - For local testing: Use [Stripe CLI](https://stripe.com/docs/stripe-cli)
3. **Events to send**:
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
4. Copy the **Signing Secret** (starts with `whsec_`)

### Step 5: Configure Environment Variables

Create `.env.local` file (copy from `env.example`):

```env
# Supabase (already configured)
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# AI Providers (already configured)
OPENAI_API_KEY=your-openai-key
ANTHROPIC_API_KEY=your-anthropic-key

# Stripe - NEW
STRIPE_SECRET_KEY=sk_test_... # or sk_live_... for production
STRIPE_PUBLISHABLE_KEY=pk_test_... # or pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Stripe Price IDs (from Step 3)
NEXT_PUBLIC_STRIPE_BASIC_MONTHLY_PRICE_ID=price_...
NEXT_PUBLIC_STRIPE_BASIC_YEARLY_PRICE_ID=price_...
NEXT_PUBLIC_STRIPE_INTERMEDIATE_MONTHLY_PRICE_ID=price_...
NEXT_PUBLIC_STRIPE_INTERMEDIATE_YEARLY_PRICE_ID=price_...
NEXT_PUBLIC_STRIPE_PRO_MONTHLY_PRICE_ID=price_...
NEXT_PUBLIC_STRIPE_PRO_YEARLY_PRICE_ID=price_...

# Encryption Key - NEW (generate random 32-char string)
ENCRYPTION_KEY=your-random-32-character-key-here

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000 # or your production URL
```

**Generate Encryption Key**:
```bash
# On Mac/Linux:
openssl rand -base64 32

# Or use this Node.js command:
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### Step 6: Test Locally

```bash
# Install dependencies (Stripe already installed)
npm install

# Run type check (should pass after regenerating types)
npm run typecheck

# Start development server
npm run dev
```

### Step 7: Test Stripe Webhook Locally

```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe

# Login
stripe login

# Forward webhooks to local server
stripe listen --forward-to localhost:3000/api/stripe/webhook

# Copy the webhook signing secret (starts with whsec_) to .env.local
# as STRIPE_WEBHOOK_SECRET
```

---

## 🧪 Testing Checklist

### Test BYOK Flow

1. **Sign up / Log in**
2. Go to **Settings** → **API Keys**
3. Add your OpenAI API key
4. Click "Validate & Save"
5. Go to dashboard and send an AI message
6. Verify it works (check OpenAI usage dashboard)
7. Delete the API key
8. Try sending a message → should get error asking for key or subscription

### Test Subscription Flow

1. **Upgrade to Basic**:
   - Click upgrade button
   - Complete Stripe checkout (use test card: `4242 4242 4242 4242`)
   - Verify redirected back with success message
   - Check Settings → Usage shows Basic plan
   - Send 500 messages and verify quota enforcement

2. **Upgrade to Intermediate**:
   - Click upgrade button
   - Verify plan changes
   - Check quota increased to 2,000

3. **Upgrade to Pro**:
   - Click upgrade button
   - Verify unlimited messages

4. **Cancel Subscription**:
   - Go to billing portal
   - Cancel subscription
   - Verify downgrade to free_byok

### Test Webhook Events

1. In Stripe Dashboard, go to **Developers** → **Events**
2. Find recent subscription events
3. Click "Send test webhook"
4. Verify database updates correctly

---

## 🔧 Troubleshooting

### TypeScript Errors

**Problem**: `Property 'X' does not exist on type 'never'`

**Solution**: Regenerate database types (Step 2)

### Stripe Webhook Fails

**Problem**: Webhook returns 400 error

**Solution**: 
- Verify `STRIPE_WEBHOOK_SECRET` is set correctly
- Check webhook signature in logs
- Use Stripe CLI for local testing

### API Key Validation Fails

**Problem**: Valid key shows as invalid

**Solution**:
- Check OpenAI/Anthropic API key has sufficient credits
- Verify API key format (OpenAI: `sk-...`, Anthropic: `sk-ant-...`)
- Check rate limits

### Quota Not Enforcing

**Problem**: Users can send more messages than limit

**Solution**:
- Verify `ai_usage_tracking` table has correct limits
- Check `period_start` and `period_end` dates
- Run `SELECT * FROM ai_usage_tracking WHERE user_id = 'USER_ID';`

---

## 📦 Production Deployment

### Vercel Environment Variables

Add all environment variables from `.env.local` to Vercel:

1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add each variable
3. **Important**: Use production Stripe keys (`sk_live_...`, `pk_live_...`)
4. Update `NEXT_PUBLIC_APP_URL` to your production domain
5. Redeploy

### Supabase Production

1. Run migration on production database
2. Update Supabase connection strings if different
3. Verify RLS policies are enabled

### Stripe Production

1. Switch to live mode in Stripe Dashboard
2. Create production products (same as test)
3. Update webhook endpoint to production URL
4. Update environment variables with live keys

---

## 🔐 Security Checklist

- [ ] `ENCRYPTION_KEY` is 32+ random characters
- [ ] Stripe webhook secret is set and verified
- [ ] API keys are never logged
- [ ] RLS policies enabled on all tables
- [ ] Rate limiting added to key validation endpoint (TODO)
- [ ] Upgrade encryption from XOR to AES-256 for production (TODO)

---

## 📞 Support

If you encounter issues:

1. Check `IMPLEMENTATION_STATUS.md` for known issues
2. Review Vercel logs for errors
3. Check Supabase logs for database errors
4. Check Stripe Dashboard → Developers → Logs for webhook issues

---

**Last Updated**: January 6, 2025

