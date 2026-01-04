-- =====================================================
-- YOUMAXING RECOMMENDATION ENGINE DATABASE MIGRATION
-- Adds tables for Twitter trends integration and 
-- enhanced AI recommendations
-- =====================================================

-- Update ai_recommendations table with new columns
ALTER TABLE ai_recommendations 
  ADD COLUMN IF NOT EXISTS dismissed boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS priority text DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  ADD COLUMN IF NOT EXISTS source text DEFAULT 'user_data' CHECK (source IN ('user_data', 'twitter_trend', 'hybrid')),
  ADD COLUMN IF NOT EXISTS trend_context text,
  ADD COLUMN IF NOT EXISTS expires_at timestamptz;

-- Update action_type to include 'trending'
ALTER TABLE ai_recommendations 
  DROP CONSTRAINT IF EXISTS ai_recommendations_action_type_check;
ALTER TABLE ai_recommendations 
  ADD CONSTRAINT ai_recommendations_action_type_check 
  CHECK (action_type IN ('info', 'action', 'reminder', 'trending'));

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_ai_recommendations_user_dismissed 
  ON ai_recommendations(user_id, dismissed);
CREATE INDEX IF NOT EXISTS idx_ai_recommendations_user_priority 
  ON ai_recommendations(user_id, priority);
CREATE INDEX IF NOT EXISTS idx_ai_recommendations_source 
  ON ai_recommendations(source);

-- =====================================================
-- TWITTER TRENDS TABLE
-- Stores trending topics fetched from X/Twitter
-- =====================================================

CREATE TABLE IF NOT EXISTS twitter_trends (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  topic text NOT NULL UNIQUE,
  category text NOT NULL CHECK (category IN (
    'finance', 'health', 'tech', 'business', 
    'lifestyle', 'entertainment', 'sports', 'general'
  )),
  relevance_score numeric NOT NULL DEFAULT 0,
  tweet_volume integer,
  sentiment text NOT NULL DEFAULT 'neutral' CHECK (sentiment IN (
    'positive', 'negative', 'neutral', 'mixed'
  )),
  key_insights text[] DEFAULT '{}',
  influential_accounts text[] DEFAULT '{}',
  related_aspects text[] DEFAULT '{}',
  raw_data jsonb,
  first_seen_at timestamptz NOT NULL DEFAULT now(),
  last_updated_at timestamptz NOT NULL DEFAULT now(),
  is_emerging boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Indexes for twitter_trends
CREATE INDEX IF NOT EXISTS idx_twitter_trends_category ON twitter_trends(category);
CREATE INDEX IF NOT EXISTS idx_twitter_trends_relevance ON twitter_trends(relevance_score DESC);
CREATE INDEX IF NOT EXISTS idx_twitter_trends_updated ON twitter_trends(last_updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_twitter_trends_aspects ON twitter_trends USING gin(related_aspects);

-- =====================================================
-- TREND RECOMMENDATIONS MAPPING TABLE
-- Links trends to recommendation templates per aspect
-- =====================================================

CREATE TABLE IF NOT EXISTS trend_recommendations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trend_id uuid REFERENCES twitter_trends(id) ON DELETE CASCADE,
  aspect text NOT NULL,
  user_segment text[] DEFAULT '{}',
  recommendation_template text NOT NULL,
  personalization_hints jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Index for trend_recommendations
CREATE INDEX IF NOT EXISTS idx_trend_recommendations_trend ON trend_recommendations(trend_id);
CREATE INDEX IF NOT EXISTS idx_trend_recommendations_aspect ON trend_recommendations(aspect);

-- =====================================================
-- USER INTEREST SIGNALS TABLE
-- Tracks user interests for better recommendation matching
-- =====================================================

CREATE TABLE IF NOT EXISTS user_interest_signals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  aspect text NOT NULL,
  signal_type text NOT NULL CHECK (signal_type IN ('explicit', 'implicit', 'inferred')),
  keywords text[] DEFAULT '{}',
  strength numeric NOT NULL DEFAULT 0.5 CHECK (strength >= 0 AND strength <= 1),
  last_updated timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  
  -- Ensure one record per user per aspect per signal type
  UNIQUE(user_id, aspect, signal_type)
);

-- Indexes for user_interest_signals
CREATE INDEX IF NOT EXISTS idx_user_interest_signals_user ON user_interest_signals(user_id);
CREATE INDEX IF NOT EXISTS idx_user_interest_signals_aspect ON user_interest_signals(aspect);
CREATE INDEX IF NOT EXISTS idx_user_interest_signals_keywords ON user_interest_signals USING gin(keywords);

-- =====================================================
-- ROW LEVEL SECURITY POLICIES
-- =====================================================

-- Enable RLS on new tables
ALTER TABLE twitter_trends ENABLE ROW LEVEL SECURITY;
ALTER TABLE trend_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_interest_signals ENABLE ROW LEVEL SECURITY;

-- Twitter trends are readable by all authenticated users
CREATE POLICY "Users can read twitter trends" ON twitter_trends
  FOR SELECT TO authenticated
  USING (true);

-- Trend recommendations are readable by all authenticated users  
CREATE POLICY "Users can read trend recommendations" ON trend_recommendations
  FOR SELECT TO authenticated
  USING (true);

-- User interest signals - users can only see their own
CREATE POLICY "Users can read own interest signals" ON user_interest_signals
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own interest signals" ON user_interest_signals
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own interest signals" ON user_interest_signals
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own interest signals" ON user_interest_signals
  FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- =====================================================
-- FUNCTIONS FOR RECOMMENDATION ENGINE
-- =====================================================

-- Function to clean up old/expired recommendations
CREATE OR REPLACE FUNCTION cleanup_expired_recommendations()
RETURNS void AS $$
BEGIN
  -- Delete recommendations older than 7 days that were dismissed or acted on
  DELETE FROM ai_recommendations
  WHERE (dismissed = true OR acted_on = true)
    AND created_at < now() - interval '7 days';
    
  -- Delete expired recommendations
  DELETE FROM ai_recommendations
  WHERE expires_at IS NOT NULL 
    AND expires_at < now();
    
  -- Clean up old trends (older than 30 days)
  DELETE FROM twitter_trends
  WHERE last_updated_at < now() - interval '30 days';
END;
$$ LANGUAGE plpgsql;

-- Function to update user interest signals based on activity
CREATE OR REPLACE FUNCTION update_user_interests(
  p_user_id uuid,
  p_aspect text,
  p_keywords text[],
  p_strength numeric DEFAULT 0.5
)
RETURNS void AS $$
BEGIN
  INSERT INTO user_interest_signals (user_id, aspect, signal_type, keywords, strength)
  VALUES (p_user_id, p_aspect, 'implicit', p_keywords, p_strength)
  ON CONFLICT (user_id, aspect, signal_type)
  DO UPDATE SET 
    keywords = array_cat(user_interest_signals.keywords, p_keywords),
    strength = LEAST(1.0, user_interest_signals.strength + 0.1),
    last_updated = now();
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- CRON JOB SETUP (for Supabase pg_cron)
-- Uncomment these if pg_cron extension is available
-- =====================================================

-- SELECT cron.schedule(
--   'cleanup-recommendations',
--   '0 3 * * *', -- Run at 3am daily
--   'SELECT cleanup_expired_recommendations()'
-- );

-- =====================================================
-- GRANTS FOR SERVICE ROLE
-- Required for Edge Functions to insert trends
-- =====================================================

GRANT INSERT, UPDATE ON twitter_trends TO service_role;
GRANT INSERT, UPDATE ON trend_recommendations TO service_role;
GRANT INSERT ON ai_recommendations TO service_role;








