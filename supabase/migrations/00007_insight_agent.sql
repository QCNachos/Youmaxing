-- ============================================
-- INSIGHT AGENT SCHEMA
-- ============================================
-- Tables for storing insights extracted by Claude Code
-- from user's logged-in browser sessions.
-- Privacy-first: Only derived insights, no raw personal data.

-- User insights (individual extracted insights)
CREATE TABLE IF NOT EXISTS user_insights (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  platform text NOT NULL, -- 'netflix', 'facebook', 'linkedin', etc.
  category text NOT NULL, -- 'interests', 'entertainment_prefs', etc.
  confidence decimal(3,2) NOT NULL DEFAULT 0.5, -- 0.00 to 1.00
  value jsonb NOT NULL, -- The insight data
  evidence text, -- Brief explanation of why this was derived
  extracted_at timestamptz DEFAULT now(),
  expires_at timestamptz, -- Some insights expire (e.g., currently watching)
  is_active boolean DEFAULT true,
  
  CONSTRAINT valid_confidence CHECK (confidence >= 0 AND confidence <= 1)
);

-- Analysis records (when we analyzed each platform)
CREATE TABLE IF NOT EXISTS insight_analyses (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  platform text NOT NULL,
  analyzed_at timestamptz DEFAULT now(),
  logged_in boolean NOT NULL DEFAULT false,
  insights_count integer DEFAULT 0,
  error text,
  duration_seconds integer
);

-- Aggregated user insight profiles (rebuilt from individual insights)
CREATE TABLE IF NOT EXISTS user_insight_profiles (
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  
  -- Interests (JSON array of {topic, strength, sources})
  interests jsonb DEFAULT '[]'::jsonb,
  
  -- Entertainment preferences
  entertainment jsonb DEFAULT '{}'::jsonb,
  
  -- Social patterns
  social jsonb DEFAULT '{}'::jsonb,
  
  -- Work patterns
  work jsonb DEFAULT '{}'::jsonb,
  
  -- Health & fitness
  health jsonb DEFAULT '{}'::jsonb,
  
  -- Financial behavior
  financial jsonb DEFAULT '{}'::jsonb,
  
  -- Travel preferences
  travel jsonb DEFAULT '{}'::jsonb,
  
  -- Meta
  last_analysis timestamptz DEFAULT now(),
  platforms_analyzed text[] DEFAULT '{}',
  total_insights integer DEFAULT 0,
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- User preferences for insight agent
CREATE TABLE IF NOT EXISTS insight_agent_settings (
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  has_claude_code boolean DEFAULT false,
  enabled_platforms text[] DEFAULT '{}',
  auto_analyze boolean DEFAULT false,
  analyze_frequency_days integer DEFAULT 7,
  privacy_level text DEFAULT 'standard', -- 'minimal', 'standard', 'detailed'
  last_prompted timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_user_insights_user_platform 
  ON user_insights(user_id, platform);
CREATE INDEX IF NOT EXISTS idx_user_insights_category 
  ON user_insights(user_id, category);
CREATE INDEX IF NOT EXISTS idx_user_insights_active 
  ON user_insights(user_id, is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_insight_analyses_user_platform 
  ON insight_analyses(user_id, platform);

-- RLS Policies
ALTER TABLE user_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE insight_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_insight_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE insight_agent_settings ENABLE ROW LEVEL SECURITY;

-- Users can only access their own data
CREATE POLICY "Users can view own insights"
  ON user_insights FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own insights"
  ON user_insights FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own insights"
  ON user_insights FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own insights"
  ON user_insights FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view own analyses"
  ON insight_analyses FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own analyses"
  ON insight_analyses FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own profile"
  ON user_insight_profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own profile"
  ON user_insight_profiles FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view own settings"
  ON insight_agent_settings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own settings"
  ON insight_agent_settings FOR ALL
  USING (auth.uid() = user_id);

-- Function to get recommendations based on insights
CREATE OR REPLACE FUNCTION get_personalized_recommendations(
  p_user_id uuid,
  p_aspect text DEFAULT NULL,
  p_limit integer DEFAULT 10
) RETURNS jsonb AS $$
DECLARE
  v_profile jsonb;
  v_recommendations jsonb := '[]'::jsonb;
BEGIN
  -- Get user's insight profile
  SELECT row_to_json(p)::jsonb INTO v_profile
  FROM user_insight_profiles p
  WHERE p.user_id = p_user_id;
  
  IF v_profile IS NULL THEN
    RETURN '{"message": "No insight profile found. Run analysis first."}'::jsonb;
  END IF;
  
  -- The actual recommendation logic is in the application layer
  -- This function just returns the profile for the app to process
  RETURN jsonb_build_object(
    'profile', v_profile,
    'has_insights', true,
    'platforms_analyzed', v_profile->'platforms_analyzed',
    'last_analysis', v_profile->'last_analysis'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


