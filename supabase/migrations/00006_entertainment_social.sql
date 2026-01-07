-- =====================================================
-- ENTERTAINMENT SOCIAL HUB
-- App Store, Social Layer, Points Economy
-- =====================================================

-- =====================================================
-- APP STORE / EXTENDED ASPECTS
-- =====================================================

-- Available apps beyond core carousel
CREATE TABLE aspect_apps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL, -- 'music', 'kids', 'books'
  name text NOT NULL,
  description text,
  icon text NOT NULL, -- Lucide icon name
  color text NOT NULL,
  gradient text NOT NULL,
  category text NOT NULL CHECK (category IN ('entertainment', 'lifestyle', 'productivity', 'social')),
  is_active boolean DEFAULT true,
  requires_oauth text[] DEFAULT '{}', -- ['spotify', 'apple_music']
  created_at timestamptz DEFAULT now()
);

-- User's installed apps
CREATE TABLE user_installed_apps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  app_slug text NOT NULL REFERENCES aspect_apps(slug) ON DELETE CASCADE,
  settings jsonb DEFAULT '{}',
  oauth_tokens jsonb, -- encrypted tokens
  is_connected boolean DEFAULT false,
  installed_at timestamptz DEFAULT now(),
  UNIQUE(user_id, app_slug)
);

-- =====================================================
-- SOCIAL LAYER
-- =====================================================

-- Friend connections (in-app, not external)
CREATE TABLE friendships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  friend_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'blocked')),
  created_at timestamptz DEFAULT now(),
  accepted_at timestamptz,
  UNIQUE(user_id, friend_id),
  CHECK (user_id != friend_id)
);

-- Shareable lists (films, music, etc.)
CREATE TABLE shared_lists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  description text,
  list_type text NOT NULL CHECK (list_type IN ('films', 'music', 'custom')),
  visibility text DEFAULT 'friends' CHECK (visibility IN ('private', 'friends', 'public')),
  items jsonb NOT NULL DEFAULT '[]',
  likes_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- List shares to specific friends
CREATE TABLE list_shares (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  list_id uuid REFERENCES shared_lists(id) ON DELETE CASCADE NOT NULL,
  shared_with_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  message text,
  shared_at timestamptz DEFAULT now(),
  viewed_at timestamptz,
  UNIQUE(list_id, shared_with_id)
);

-- Social feed items
CREATE TABLE social_feed (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  feed_type text NOT NULL CHECK (feed_type IN (
    'list_shared', 'recommendation', 'achievement', 'tip_received', 'friend_added'
  )),
  content jsonb NOT NULL,
  source_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  related_id uuid, -- Reference to list, achievement, etc.
  is_read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- =====================================================
-- GAMIFIED POINTS ECONOMY
-- =====================================================

CREATE TABLE user_points (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  balance integer DEFAULT 100, -- Start with 100 points
  lifetime_earned integer DEFAULT 100,
  lifetime_spent integer DEFAULT 0,
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE point_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  amount integer NOT NULL, -- positive = earn, negative = spend
  transaction_type text NOT NULL CHECK (transaction_type IN (
    'daily_login', 'rate_item', 'share_list', 'receive_tip',
    'give_tip', 'unlock_feature', 'add_friend', 'complete_watchlist',
    'signup_bonus', 'referral'
  )),
  description text,
  related_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL, -- for tips
  related_item_id uuid, -- for context
  created_at timestamptz DEFAULT now()
);

-- Point earning rules
CREATE TABLE point_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  action text UNIQUE NOT NULL,
  points integer NOT NULL,
  daily_limit integer, -- null = unlimited
  description text,
  is_active boolean DEFAULT true
);

-- Insert default point rules
INSERT INTO point_rules (action, points, daily_limit, description) VALUES
  ('daily_login', 5, 1, 'Daily login bonus'),
  ('rate_item', 2, 20, 'Rate a movie/song'),
  ('share_list', 10, 5, 'Share a list with friends'),
  ('receive_tip', 0, null, 'Receive points from friend'),
  ('give_tip', 0, null, 'Tip a friend for good rec'),
  ('add_friend', 15, 10, 'Add a new friend'),
  ('complete_watchlist', 25, null, 'Finish a watchlist'),
  ('signup_bonus', 100, 1, 'Welcome bonus for new users');

-- =====================================================
-- MUSIC LIBRARY (SPOTIFY INTEGRATION)
-- =====================================================

CREATE TABLE music_library (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  spotify_id text,
  title text NOT NULL,
  artist text NOT NULL,
  album text,
  type text DEFAULT 'track' CHECK (type IN ('track', 'album', 'playlist', 'artist')),
  tier text CHECK (tier IN (
    'legendary', 'amazing', 'very_good', 'good', 'okay', 
    'not_good', 'not_interested'
  )),
  cover_url text,
  preview_url text,
  genres text[],
  release_year integer,
  added_at timestamptz DEFAULT now(),
  UNIQUE(user_id, spotify_id)
);

-- =====================================================
-- USER PREFERENCES EXTENSION
-- =====================================================

ALTER TABLE user_preferences ADD COLUMN IF NOT EXISTS installed_apps text[] DEFAULT '{}';

-- =====================================================
-- INDEXES
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_user_installed_apps_user ON user_installed_apps(user_id);
CREATE INDEX IF NOT EXISTS idx_user_installed_apps_slug ON user_installed_apps(app_slug);
CREATE INDEX IF NOT EXISTS idx_friendships_user ON friendships(user_id);
CREATE INDEX IF NOT EXISTS idx_friendships_friend ON friendships(friend_id);
CREATE INDEX IF NOT EXISTS idx_friendships_status ON friendships(status);
CREATE INDEX IF NOT EXISTS idx_shared_lists_owner ON shared_lists(owner_id);
CREATE INDEX IF NOT EXISTS idx_shared_lists_type ON shared_lists(list_type);
CREATE INDEX IF NOT EXISTS idx_shared_lists_visibility ON shared_lists(visibility);
CREATE INDEX IF NOT EXISTS idx_list_shares_list ON list_shares(list_id);
CREATE INDEX IF NOT EXISTS idx_list_shares_user ON list_shares(shared_with_id);
CREATE INDEX IF NOT EXISTS idx_social_feed_user ON social_feed(user_id);
CREATE INDEX IF NOT EXISTS idx_social_feed_type ON social_feed(feed_type);
CREATE INDEX IF NOT EXISTS idx_social_feed_unread ON social_feed(user_id, is_read) WHERE is_read = false;
CREATE INDEX IF NOT EXISTS idx_user_points_user ON user_points(user_id);
CREATE INDEX IF NOT EXISTS idx_point_transactions_user ON point_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_point_transactions_type ON point_transactions(transaction_type);
CREATE INDEX IF NOT EXISTS idx_point_transactions_date ON point_transactions(created_at);
CREATE INDEX IF NOT EXISTS idx_music_library_user ON music_library(user_id);
CREATE INDEX IF NOT EXISTS idx_music_library_tier ON music_library(user_id, tier);
CREATE INDEX IF NOT EXISTS idx_music_library_spotify ON music_library(spotify_id);

-- =====================================================
-- ROW LEVEL SECURITY
-- =====================================================

ALTER TABLE aspect_apps ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_installed_apps ENABLE ROW LEVEL SECURITY;
ALTER TABLE friendships ENABLE ROW LEVEL SECURITY;
ALTER TABLE shared_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE list_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_feed ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE point_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE point_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE music_library ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- RLS POLICIES
-- =====================================================

-- Apps readable by all authenticated users
CREATE POLICY "Anyone can read apps" ON aspect_apps 
  FOR SELECT TO authenticated USING (true);

-- Users manage own installed apps
CREATE POLICY "Users manage own installed apps" ON user_installed_apps 
  FOR ALL TO authenticated USING (auth.uid() = user_id);

-- Friendships - users can see their own
CREATE POLICY "Users see own friendships" ON friendships 
  FOR SELECT TO authenticated USING (auth.uid() = user_id OR auth.uid() = friend_id);

CREATE POLICY "Users create friendship requests" ON friendships 
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own friendships" ON friendships 
  FOR UPDATE TO authenticated USING (auth.uid() = user_id OR auth.uid() = friend_id);

CREATE POLICY "Users delete own friendships" ON friendships 
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Shared lists - visibility based
CREATE POLICY "Users see allowed lists" ON shared_lists 
  FOR SELECT TO authenticated USING (
    owner_id = auth.uid() OR 
    visibility = 'public' OR
    (visibility = 'friends' AND EXISTS (
      SELECT 1 FROM friendships 
      WHERE status = 'accepted' 
      AND ((user_id = auth.uid() AND friend_id = shared_lists.owner_id)
        OR (friend_id = auth.uid() AND user_id = shared_lists.owner_id))
    ))
  );

CREATE POLICY "Users manage own lists" ON shared_lists 
  FOR ALL TO authenticated USING (auth.uid() = owner_id);

-- List shares
CREATE POLICY "Users see shares involving them" ON list_shares 
  FOR SELECT TO authenticated USING (
    shared_with_id = auth.uid() OR
    EXISTS (SELECT 1 FROM shared_lists WHERE id = list_id AND owner_id = auth.uid())
  );

CREATE POLICY "List owners can share" ON list_shares 
  FOR INSERT TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM shared_lists WHERE id = list_id AND owner_id = auth.uid())
  );

-- Social feed
CREATE POLICY "Users see own feed" ON social_feed 
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users update own feed" ON social_feed 
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- Points
CREATE POLICY "Users see own points" ON user_points 
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users see own transactions" ON point_transactions 
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- Point rules readable by all
CREATE POLICY "Anyone can read point rules" ON point_rules 
  FOR SELECT TO authenticated USING (true);

-- Music library
CREATE POLICY "Users manage own music" ON music_library 
  FOR ALL TO authenticated USING (auth.uid() = user_id);

-- =====================================================
-- HELPER FUNCTIONS
-- =====================================================

-- Initialize points for new user
CREATE OR REPLACE FUNCTION initialize_user_points()
RETURNS trigger AS $$
BEGIN
  INSERT INTO user_points (user_id, balance, lifetime_earned)
  VALUES (NEW.id, 100, 100)
  ON CONFLICT (user_id) DO NOTHING;
  
  INSERT INTO point_transactions (user_id, amount, transaction_type, description)
  VALUES (NEW.id, 100, 'signup_bonus', 'Welcome to Youmaxing!')
  ON CONFLICT DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to initialize points on user creation
DROP TRIGGER IF EXISTS on_auth_user_created_points ON auth.users;
CREATE TRIGGER on_auth_user_created_points
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION initialize_user_points();

-- Award points with daily limit check
CREATE OR REPLACE FUNCTION award_points(
  p_user_id uuid,
  p_action text,
  p_amount integer DEFAULT NULL,
  p_description text DEFAULT NULL,
  p_related_user_id uuid DEFAULT NULL,
  p_related_item_id uuid DEFAULT NULL
)
RETURNS jsonb AS $$
DECLARE
  v_rule point_rules%ROWTYPE;
  v_daily_count integer;
  v_points integer;
  v_new_balance integer;
BEGIN
  -- Get rule
  SELECT * INTO v_rule FROM point_rules WHERE action = p_action AND is_active = true;
  
  IF v_rule IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Unknown action');
  END IF;
  
  -- Use provided amount or rule default
  v_points := COALESCE(p_amount, v_rule.points);
  
  -- Check daily limit
  IF v_rule.daily_limit IS NOT NULL THEN
    SELECT COUNT(*) INTO v_daily_count
    FROM point_transactions
    WHERE user_id = p_user_id
      AND transaction_type = p_action
      AND created_at >= CURRENT_DATE;
    
    IF v_daily_count >= v_rule.daily_limit THEN
      RETURN jsonb_build_object('success', false, 'error', 'Daily limit reached');
    END IF;
  END IF;
  
  -- Update balance
  UPDATE user_points
  SET balance = balance + v_points,
      lifetime_earned = lifetime_earned + GREATEST(0, v_points),
      lifetime_spent = lifetime_spent + GREATEST(0, -v_points),
      updated_at = now()
  WHERE user_id = p_user_id
  RETURNING balance INTO v_new_balance;
  
  -- Create if not exists
  IF v_new_balance IS NULL THEN
    INSERT INTO user_points (user_id, balance, lifetime_earned)
    VALUES (p_user_id, 100 + v_points, 100 + GREATEST(0, v_points))
    RETURNING balance INTO v_new_balance;
  END IF;
  
  -- Log transaction
  INSERT INTO point_transactions (
    user_id, amount, transaction_type, description, 
    related_user_id, related_item_id
  ) VALUES (
    p_user_id, v_points, p_action, 
    COALESCE(p_description, v_rule.description),
    p_related_user_id, p_related_item_id
  );
  
  RETURN jsonb_build_object(
    'success', true, 
    'points_awarded', v_points, 
    'new_balance', v_new_balance
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Tip a friend
CREATE OR REPLACE FUNCTION tip_friend(
  p_from_user_id uuid,
  p_to_user_id uuid,
  p_amount integer,
  p_message text DEFAULT NULL
)
RETURNS jsonb AS $$
DECLARE
  v_from_balance integer;
  v_to_balance integer;
BEGIN
  -- Validate amount
  IF p_amount < 5 THEN
    RETURN jsonb_build_object('success', false, 'error', 'Minimum tip is 5 points');
  END IF;
  
  -- Check balance
  SELECT balance INTO v_from_balance FROM user_points WHERE user_id = p_from_user_id;
  
  IF v_from_balance IS NULL OR v_from_balance < p_amount THEN
    RETURN jsonb_build_object('success', false, 'error', 'Insufficient balance');
  END IF;
  
  -- Check friendship
  IF NOT EXISTS (
    SELECT 1 FROM friendships 
    WHERE status = 'accepted'
    AND ((user_id = p_from_user_id AND friend_id = p_to_user_id)
      OR (friend_id = p_from_user_id AND user_id = p_to_user_id))
  ) THEN
    RETURN jsonb_build_object('success', false, 'error', 'Must be friends to tip');
  END IF;
  
  -- Deduct from sender
  UPDATE user_points
  SET balance = balance - p_amount,
      lifetime_spent = lifetime_spent + p_amount,
      updated_at = now()
  WHERE user_id = p_from_user_id;
  
  -- Add to receiver
  UPDATE user_points
  SET balance = balance + p_amount,
      lifetime_earned = lifetime_earned + p_amount,
      updated_at = now()
  WHERE user_id = p_to_user_id
  RETURNING balance INTO v_to_balance;
  
  -- Log transactions
  INSERT INTO point_transactions (user_id, amount, transaction_type, description, related_user_id)
  VALUES 
    (p_from_user_id, -p_amount, 'give_tip', COALESCE(p_message, 'Tip sent'), p_to_user_id),
    (p_to_user_id, p_amount, 'receive_tip', COALESCE(p_message, 'Tip received'), p_from_user_id);
  
  -- Add to receiver's feed
  INSERT INTO social_feed (user_id, feed_type, content, source_user_id)
  VALUES (
    p_to_user_id, 
    'tip_received',
    jsonb_build_object('amount', p_amount, 'message', p_message),
    p_from_user_id
  );
  
  RETURN jsonb_build_object(
    'success', true,
    'amount', p_amount,
    'sender_new_balance', v_from_balance - p_amount
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- SEED DEFAULT APPS
-- =====================================================

INSERT INTO aspect_apps (slug, name, description, icon, color, gradient, category, requires_oauth) VALUES
  ('music', 'Music', 'Track your favorite music with Spotify integration', 'Music', '#1DB954', 'from-green-500 to-emerald-500', 'entertainment', ARRAY['spotify']),
  ('books', 'Books', 'Your reading list and book recommendations', 'BookOpen', '#8B5CF6', 'from-violet-500 to-purple-500', 'entertainment', ARRAY[]::text[]),
  ('games', 'Games', 'Track games you play and want to play', 'Gamepad2', '#EF4444', 'from-red-500 to-orange-500', 'entertainment', ARRAY[]::text[]),
  ('kids', 'Kids', 'Activities and content for your children', 'Baby', '#F59E0B', 'from-amber-500 to-yellow-500', 'lifestyle', ARRAY[]::text[]),
  ('pets', 'Pets', 'Care tracking for your furry friends', 'PawPrint', '#10B981', 'from-emerald-500 to-teal-500', 'lifestyle', ARRAY[]::text[])
ON CONFLICT (slug) DO NOTHING;

-- =====================================================
-- GRANTS FOR SERVICE ROLE
-- =====================================================

GRANT INSERT, UPDATE ON user_points TO service_role;
GRANT INSERT ON point_transactions TO service_role;
GRANT INSERT ON social_feed TO service_role;



