-- =====================================================
-- BYOK (Bring Your Own Key) & SUBSCRIPTION SYSTEM
-- Supports Free (BYOK), Basic ($9.99), Intermediate ($29.99), Pro ($99.99)
-- =====================================================

-- =====================================================
-- USER SUBSCRIPTIONS
-- =====================================================

CREATE TABLE IF NOT EXISTS user_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) UNIQUE NOT NULL,
  
  -- Subscription tier
  tier text CHECK (tier IN ('free_byok', 'basic', 'intermediate', 'pro')) DEFAULT 'free_byok' NOT NULL,
  status text CHECK (status IN ('active', 'canceled', 'past_due', 'trialing', 'incomplete')) DEFAULT 'active' NOT NULL,
  
  -- Stripe fields (null for free_byok)
  stripe_customer_id text UNIQUE,
  stripe_subscription_id text UNIQUE,
  stripe_price_id text,
  current_period_start timestamptz,
  current_period_end timestamptz,
  cancel_at_period_end boolean DEFAULT false,
  canceled_at timestamptz,
  
  -- Trial info
  trial_start timestamptz,
  trial_end timestamptz,
  
  -- Metadata
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- =====================================================
-- USER API KEYS (BYOK)
-- =====================================================

CREATE TABLE IF NOT EXISTS user_api_keys (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) UNIQUE NOT NULL,
  
  -- Encrypted API keys (encrypted at application level before storing)
  openai_key_encrypted text,
  anthropic_key_encrypted text,
  
  -- Key validation status
  openai_key_valid boolean DEFAULT false,
  anthropic_key_valid boolean DEFAULT false,
  openai_last_validated_at timestamptz,
  anthropic_last_validated_at timestamptz,
  
  -- Error tracking
  openai_validation_error text,
  anthropic_validation_error text,
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- =====================================================
-- AI USAGE TRACKING (for quota enforcement)
-- =====================================================

CREATE TABLE IF NOT EXISTS ai_usage_tracking (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  
  -- Usage counters
  messages_used integer DEFAULT 0 NOT NULL,
  messages_limit integer, -- NULL = unlimited (free_byok or pro)
  
  -- Period tracking (monthly reset)
  period_start timestamptz DEFAULT date_trunc('month', now()) NOT NULL,
  period_end timestamptz DEFAULT (date_trunc('month', now()) + interval '1 month') NOT NULL,
  
  -- Last reset
  last_reset_at timestamptz DEFAULT now(),
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  UNIQUE(user_id, period_start)
);

-- =====================================================
-- AI MESSAGE LOG (detailed tracking for analytics)
-- =====================================================

CREATE TABLE IF NOT EXISTS ai_message_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  
  -- Message details
  provider text CHECK (provider IN ('openai', 'anthropic', 'user_openai', 'user_anthropic')) NOT NULL,
  model text NOT NULL,
  tokens_used integer,
  
  -- Cost tracking (for our internal analysis)
  estimated_cost_usd numeric(10, 6),
  
  -- Using BYOK?
  is_byok boolean DEFAULT false,
  
  -- Response time
  response_time_ms integer,
  
  -- Status
  success boolean DEFAULT true,
  error_message text,
  
  created_at timestamptz DEFAULT now()
);

-- =====================================================
-- TIER LIMITS CONFIGURATION
-- =====================================================

CREATE TABLE IF NOT EXISTS tier_limits (
  tier text PRIMARY KEY CHECK (tier IN ('free_byok', 'basic', 'intermediate', 'pro')),
  
  -- AI limits
  ai_messages_per_month integer, -- NULL = unlimited
  ai_model text,
  
  -- Feature flags
  has_weekly_summary boolean DEFAULT false,
  has_proactive_checkins boolean DEFAULT false,
  has_trend_insights boolean DEFAULT false,
  has_goal_coaching boolean DEFAULT false,
  has_integrations boolean DEFAULT false,
  has_voice_mode boolean DEFAULT false,
  has_weekly_review boolean DEFAULT false,
  has_analytics_dashboard boolean DEFAULT false,
  has_social_features boolean DEFAULT false,
  has_priority_support boolean DEFAULT false,
  has_early_access boolean DEFAULT false,
  
  -- Support level
  support_level text DEFAULT 'community' CHECK (support_level IN ('community', 'email', 'priority')),
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Insert default tier limits
INSERT INTO tier_limits (tier, ai_messages_per_month, ai_model, has_weekly_summary, has_proactive_checkins, has_trend_insights, has_goal_coaching, has_integrations, has_voice_mode, has_weekly_review, has_analytics_dashboard, has_social_features, has_priority_support, has_early_access, support_level) VALUES
  ('free_byok', NULL, 'user_choice', false, false, false, false, false, false, false, false, false, false, false, 'community'),
  ('basic', 500, 'gpt-3.5-turbo', true, false, false, false, false, false, false, false, false, false, false, 'email'),
  ('intermediate', 2000, 'gpt-4', true, true, true, true, true, false, false, false, false, true, false, 'priority'),
  ('pro', NULL, 'gpt-4-turbo', true, true, true, true, true, true, true, true, true, true, true, 'priority')
ON CONFLICT (tier) DO UPDATE SET
  ai_messages_per_month = EXCLUDED.ai_messages_per_month,
  ai_model = EXCLUDED.ai_model,
  has_weekly_summary = EXCLUDED.has_weekly_summary,
  has_proactive_checkins = EXCLUDED.has_proactive_checkins,
  has_trend_insights = EXCLUDED.has_trend_insights,
  has_goal_coaching = EXCLUDED.has_goal_coaching,
  has_integrations = EXCLUDED.has_integrations,
  has_voice_mode = EXCLUDED.has_voice_mode,
  has_weekly_review = EXCLUDED.has_weekly_review,
  has_analytics_dashboard = EXCLUDED.has_analytics_dashboard,
  has_social_features = EXCLUDED.has_social_features,
  has_priority_support = EXCLUDED.has_priority_support,
  has_early_access = EXCLUDED.has_early_access,
  support_level = EXCLUDED.support_level;

-- =====================================================
-- INDEXES
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user ON user_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_stripe_customer ON user_subscriptions(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_stripe_subscription ON user_subscriptions(stripe_subscription_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_tier ON user_subscriptions(tier);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_status ON user_subscriptions(status);

CREATE INDEX IF NOT EXISTS idx_user_api_keys_user ON user_api_keys(user_id);
CREATE INDEX IF NOT EXISTS idx_user_api_keys_valid ON user_api_keys(user_id, openai_key_valid, anthropic_key_valid);

CREATE INDEX IF NOT EXISTS idx_ai_usage_tracking_user ON ai_usage_tracking(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_usage_tracking_period ON ai_usage_tracking(user_id, period_start, period_end);

CREATE INDEX IF NOT EXISTS idx_ai_message_log_user ON ai_message_log(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_message_log_created ON ai_message_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_message_log_byok ON ai_message_log(is_byok);

-- =====================================================
-- ROW LEVEL SECURITY
-- =====================================================

ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_usage_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_message_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE tier_limits ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- RLS POLICIES
-- =====================================================

-- User subscriptions - users can only see their own
CREATE POLICY "Users can view own subscription" ON user_subscriptions 
  FOR SELECT TO authenticated 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own subscription" ON user_subscriptions 
  FOR UPDATE TO authenticated 
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- User API keys - users can only manage their own
CREATE POLICY "Users can manage own API keys" ON user_api_keys 
  FOR ALL TO authenticated 
  USING (auth.uid() = user_id);

-- AI usage tracking - users can only see their own
CREATE POLICY "Users can view own usage" ON ai_usage_tracking 
  FOR SELECT TO authenticated 
  USING (auth.uid() = user_id);

-- AI message log - users can only see their own
CREATE POLICY "Users can view own message log" ON ai_message_log 
  FOR SELECT TO authenticated 
  USING (auth.uid() = user_id);

-- Tier limits - everyone can read (for display purposes)
CREATE POLICY "Everyone can read tier limits" ON tier_limits 
  FOR SELECT TO authenticated 
  USING (true);

-- =====================================================
-- HELPER FUNCTIONS
-- =====================================================

-- Function to get user's current tier and limits
CREATE OR REPLACE FUNCTION get_user_tier_info(p_user_id uuid)
RETURNS TABLE (
  tier text,
  status text,
  messages_used integer,
  messages_limit integer,
  has_valid_byok boolean,
  stripe_customer_id text
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    us.tier,
    us.status,
    COALESCE(aut.messages_used, 0) as messages_used,
    tl.ai_messages_per_month as messages_limit,
    COALESCE(uak.openai_key_valid OR uak.anthropic_key_valid, false) as has_valid_byok,
    us.stripe_customer_id
  FROM user_subscriptions us
  LEFT JOIN ai_usage_tracking aut ON aut.user_id = us.user_id 
    AND aut.period_start = date_trunc('month', now())
  LEFT JOIN tier_limits tl ON tl.tier = us.tier
  LEFT JOIN user_api_keys uak ON uak.user_id = us.user_id
  WHERE us.user_id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user can make AI request
CREATE OR REPLACE FUNCTION can_make_ai_request(p_user_id uuid)
RETURNS boolean AS $$
DECLARE
  v_tier text;
  v_status text;
  v_messages_used integer;
  v_messages_limit integer;
  v_has_byok boolean;
BEGIN
  SELECT tier, status, messages_used, messages_limit, has_valid_byok
  INTO v_tier, v_status, v_messages_used, v_messages_limit, v_has_byok
  FROM get_user_tier_info(p_user_id);
  
  -- Check subscription status
  IF v_status != 'active' AND v_status != 'trialing' THEN
    RETURN false;
  END IF;
  
  -- BYOK users can always make requests if they have valid keys
  IF v_tier = 'free_byok' AND v_has_byok THEN
    RETURN true;
  END IF;
  
  -- Pro users have unlimited messages
  IF v_tier = 'pro' THEN
    RETURN true;
  END IF;
  
  -- Check quota for Basic and Intermediate
  IF v_messages_limit IS NOT NULL AND v_messages_used >= v_messages_limit THEN
    RETURN false;
  END IF;
  
  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to increment AI usage
CREATE OR REPLACE FUNCTION increment_ai_usage(p_user_id uuid)
RETURNS void AS $$
DECLARE
  v_current_period_start timestamptz := date_trunc('month', now());
  v_current_period_end timestamptz := date_trunc('month', now()) + interval '1 month';
BEGIN
  INSERT INTO ai_usage_tracking (user_id, messages_used, messages_limit, period_start, period_end)
  SELECT 
    p_user_id,
    1,
    tl.ai_messages_per_month,
    v_current_period_start,
    v_current_period_end
  FROM user_subscriptions us
  LEFT JOIN tier_limits tl ON tl.tier = us.tier
  WHERE us.user_id = p_user_id
  ON CONFLICT (user_id, period_start) 
  DO UPDATE SET 
    messages_used = ai_usage_tracking.messages_used + 1,
    updated_at = now();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to reset monthly usage (called by cron job)
CREATE OR REPLACE FUNCTION reset_monthly_usage()
RETURNS void AS $$
BEGIN
  -- Archive old usage records
  UPDATE ai_usage_tracking
  SET updated_at = now()
  WHERE period_end < now();
  
  -- Create new usage records for current month if needed
  INSERT INTO ai_usage_tracking (user_id, messages_used, messages_limit, period_start, period_end)
  SELECT 
    us.user_id,
    0,
    tl.ai_messages_per_month,
    date_trunc('month', now()),
    date_trunc('month', now()) + interval '1 month'
  FROM user_subscriptions us
  LEFT JOIN tier_limits tl ON tl.tier = us.tier
  WHERE NOT EXISTS (
    SELECT 1 FROM ai_usage_tracking aut
    WHERE aut.user_id = us.user_id
    AND aut.period_start = date_trunc('month', now())
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Auto-create subscription record for new users
CREATE OR REPLACE FUNCTION handle_new_user_subscription()
RETURNS trigger AS $$
BEGIN
  INSERT INTO user_subscriptions (user_id, tier, status)
  VALUES (NEW.id, 'free_byok', 'active')
  ON CONFLICT (user_id) DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-create subscription
DROP TRIGGER IF EXISTS on_auth_user_created_subscription ON auth.users;
CREATE TRIGGER on_auth_user_created_subscription
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user_subscription();

-- =====================================================
-- GRANTS (for service role - needed for API routes)
-- =====================================================

GRANT SELECT, INSERT, UPDATE ON user_subscriptions TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON user_api_keys TO service_role;
GRANT SELECT, INSERT, UPDATE ON ai_usage_tracking TO service_role;
GRANT INSERT ON ai_message_log TO service_role;
GRANT SELECT ON tier_limits TO service_role;

