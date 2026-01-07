-- =====================================================
-- YOUMAXING COMPLETE DATABASE SCHEMA
-- Run this in Supabase SQL Editor
-- =====================================================

-- =====================================================
-- CORE TABLES
-- =====================================================

-- User Profiles
CREATE TABLE user_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  display_name text,
  avatar_url text,
  avatar_3d_url text,
  ai_tone text DEFAULT 'chill' CHECK (ai_tone IN ('chill', 'professional', 'motivational', 'friendly')),
  ai_provider text DEFAULT 'openai' CHECK (ai_provider IN ('openai', 'anthropic')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- User Preferences
CREATE TABLE user_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  aspect_priorities text[] DEFAULT ARRAY['training', 'food', 'finance', 'business', 'friends'],
  daily_message_count integer DEFAULT 3,
  notifications_enabled boolean DEFAULT true,
  onboarding_completed boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Conversations (AI Chat History)
CREATE TABLE conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  messages jsonb DEFAULT '[]',
  aspect text,
  created_at timestamptz DEFAULT now()
);

-- AI Recommendations
CREATE TABLE ai_recommendations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  aspect text NOT NULL,
  title text NOT NULL,
  content text NOT NULL,
  action_type text DEFAULT 'info' CHECK (action_type IN ('info', 'action', 'reminder', 'trending')),
  action_url text,
  acted_on boolean DEFAULT false,
  dismissed boolean DEFAULT false,
  priority text DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  source text DEFAULT 'user_data' CHECK (source IN ('user_data', 'twitter_trend', 'hybrid')),
  trend_context text,
  expires_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Training Logs
CREATE TABLE training_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  type text DEFAULT 'other' CHECK (type IN ('strength', 'cardio', 'flexibility', 'sports', 'other')),
  duration_minutes integer,
  intensity text DEFAULT 'medium' CHECK (intensity IN ('low', 'medium', 'high')),
  notes text,
  completed_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Meals
CREATE TABLE meals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  type text DEFAULT 'snack' CHECK (type IN ('breakfast', 'lunch', 'dinner', 'snack')),
  calories integer,
  notes text,
  logged_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Sports Activities
CREATE TABLE sports_activities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  sport text NOT NULL,
  duration_minutes integer,
  location text,
  with_team boolean DEFAULT false,
  notes text,
  activity_date timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Watchlist (Films/Series)
CREATE TABLE watchlist (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  type text DEFAULT 'movie' CHECK (type IN ('movie', 'series', 'documentary')),
  status text DEFAULT 'want_to_watch' CHECK (status IN ('want_to_watch', 'watching', 'watched')),
  rating integer CHECK (rating >= 1 AND rating <= 10),
  notes text,
  created_at timestamptz DEFAULT now()
);

-- Finances
CREATE TABLE finances (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  type text NOT NULL CHECK (type IN ('income', 'expense', 'investment', 'saving')),
  category text NOT NULL,
  amount numeric NOT NULL,
  currency text DEFAULT 'USD',
  description text,
  date timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Business Projects
CREATE TABLE business_projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  status text DEFAULT 'idea' CHECK (status IN ('idea', 'planning', 'active', 'paused', 'completed')),
  description text,
  priority text DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  deadline timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Trips
CREATE TABLE trips (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  destination text NOT NULL,
  status text DEFAULT 'dream' CHECK (status IN ('dream', 'planning', 'booked', 'completed')),
  start_date timestamptz,
  end_date timestamptz,
  budget numeric,
  notes text,
  created_at timestamptz DEFAULT now()
);

-- Family Members
CREATE TABLE family_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  relationship text NOT NULL,
  birthday date,
  notes text,
  created_at timestamptz DEFAULT now()
);

-- Friends
CREATE TABLE friends (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  how_met text,
  last_contact timestamptz,
  notes text,
  created_at timestamptz DEFAULT now()
);

-- Calendar Events
CREATE TABLE calendar_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  description text,
  aspect text NOT NULL,
  start_date timestamptz NOT NULL,
  end_date timestamptz,
  all_day boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- =====================================================
-- RECOMMENDATION ENGINE TABLES
-- =====================================================

-- Twitter/X Trends
CREATE TABLE twitter_trends (
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

-- Trend Recommendations Mapping
CREATE TABLE trend_recommendations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trend_id uuid REFERENCES twitter_trends(id) ON DELETE CASCADE,
  aspect text NOT NULL,
  user_segment text[] DEFAULT '{}',
  recommendation_template text NOT NULL,
  personalization_hints jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- User Interest Signals
CREATE TABLE user_interest_signals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  aspect text NOT NULL,
  signal_type text NOT NULL CHECK (signal_type IN ('explicit', 'implicit', 'inferred')),
  keywords text[] DEFAULT '{}',
  strength numeric NOT NULL DEFAULT 0.5 CHECK (strength >= 0 AND strength <= 1),
  last_updated timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, aspect, signal_type)
);

-- =====================================================
-- INDEXES
-- =====================================================

CREATE INDEX idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX idx_user_preferences_user_id ON user_preferences(user_id);
CREATE INDEX idx_conversations_user_id ON conversations(user_id);
CREATE INDEX idx_ai_recommendations_user_id ON ai_recommendations(user_id);
CREATE INDEX idx_ai_recommendations_dismissed ON ai_recommendations(user_id, dismissed);
CREATE INDEX idx_ai_recommendations_priority ON ai_recommendations(user_id, priority);
CREATE INDEX idx_ai_recommendations_source ON ai_recommendations(source);
CREATE INDEX idx_training_logs_user_id ON training_logs(user_id);
CREATE INDEX idx_meals_user_id ON meals(user_id);
CREATE INDEX idx_finances_user_id ON finances(user_id);
CREATE INDEX idx_calendar_events_user_id ON calendar_events(user_id);
CREATE INDEX idx_twitter_trends_category ON twitter_trends(category);
CREATE INDEX idx_twitter_trends_relevance ON twitter_trends(relevance_score DESC);
CREATE INDEX idx_twitter_trends_updated ON twitter_trends(last_updated_at DESC);
CREATE INDEX idx_twitter_trends_aspects ON twitter_trends USING gin(related_aspects);
CREATE INDEX idx_trend_recommendations_trend ON trend_recommendations(trend_id);
CREATE INDEX idx_trend_recommendations_aspect ON trend_recommendations(aspect);
CREATE INDEX idx_user_interest_signals_user ON user_interest_signals(user_id);
CREATE INDEX idx_user_interest_signals_aspect ON user_interest_signals(aspect);
CREATE INDEX idx_user_interest_signals_keywords ON user_interest_signals USING gin(keywords);

-- =====================================================
-- ROW LEVEL SECURITY
-- =====================================================

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE meals ENABLE ROW LEVEL SECURITY;
ALTER TABLE sports_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE watchlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE finances ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE friends ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE twitter_trends ENABLE ROW LEVEL SECURITY;
ALTER TABLE trend_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_interest_signals ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- RLS POLICIES
-- =====================================================

-- Core tables - users can only access their own data
CREATE POLICY "Users can manage own profile" ON user_profiles FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own preferences" ON user_preferences FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own conversations" ON conversations FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own recommendations" ON ai_recommendations FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own training logs" ON training_logs FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own meals" ON meals FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own sports activities" ON sports_activities FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own watchlist" ON watchlist FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own finances" ON finances FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own business projects" ON business_projects FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own trips" ON trips FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own family members" ON family_members FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own friends" ON friends FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own calendar events" ON calendar_events FOR ALL USING (auth.uid() = user_id);

-- Twitter trends - readable by all authenticated users
CREATE POLICY "Users can read twitter trends" ON twitter_trends FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can read trend recommendations" ON trend_recommendations FOR SELECT TO authenticated USING (true);

-- User interest signals - users can only see their own
CREATE POLICY "Users can read own interest signals" ON user_interest_signals FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own interest signals" ON user_interest_signals FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own interest signals" ON user_interest_signals FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own interest signals" ON user_interest_signals FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- =====================================================
-- HELPER FUNCTIONS
-- =====================================================

-- Cleanup expired recommendations
CREATE OR REPLACE FUNCTION cleanup_expired_recommendations()
RETURNS void AS $$
BEGIN
  DELETE FROM ai_recommendations
  WHERE (dismissed = true OR acted_on = true)
    AND created_at < now() - interval '7 days';
  DELETE FROM ai_recommendations
  WHERE expires_at IS NOT NULL AND expires_at < now();
  DELETE FROM twitter_trends
  WHERE last_updated_at < now() - interval '30 days';
END;
$$ LANGUAGE plpgsql;

-- Update user interests
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

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO user_profiles (user_id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email));
  
  INSERT INTO user_preferences (user_id)
  VALUES (NEW.id);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-create profile
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- =====================================================
-- SERVICE ROLE GRANTS (for Edge Functions)
-- =====================================================

GRANT INSERT, UPDATE ON twitter_trends TO service_role;
GRANT INSERT, UPDATE ON trend_recommendations TO service_role;
GRANT INSERT ON ai_recommendations TO service_role;











