-- =====================================================
-- FILMS ENHANCED: Tier System & Streaming Availability
-- =====================================================

-- Extend watchlist with TMDB integration and tier system
ALTER TABLE watchlist ADD COLUMN IF NOT EXISTS tmdb_id integer;
ALTER TABLE watchlist ADD COLUMN IF NOT EXISTS tier text CHECK (tier IN (
  'legendary', 'amazing', 'very_good', 'good', 'okay', 
  'not_good', 'not_interested'
));
ALTER TABLE watchlist ADD COLUMN IF NOT EXISTS franchise text;
ALTER TABLE watchlist ADD COLUMN IF NOT EXISTS poster_url text;
ALTER TABLE watchlist ADD COLUMN IF NOT EXISTS streaming_providers jsonb;
ALTER TABLE watchlist ADD COLUMN IF NOT EXISTS genres text[];
ALTER TABLE watchlist ADD COLUMN IF NOT EXISTS release_year integer;
ALTER TABLE watchlist ADD COLUMN IF NOT EXISTS last_provider_check timestamptz;

-- User's country for streaming lookup
ALTER TABLE user_preferences ADD COLUMN IF NOT EXISTS country_code text DEFAULT 'US';

-- Indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_watchlist_franchise ON watchlist(user_id, franchise);
CREATE INDEX IF NOT EXISTS idx_watchlist_tier ON watchlist(user_id, tier);
CREATE INDEX IF NOT EXISTS idx_watchlist_tmdb ON watchlist(tmdb_id);

-- =====================================================
-- TIER DISPLAY HELPER
-- =====================================================

-- Function to get tier display info
CREATE OR REPLACE FUNCTION get_tier_info(tier_name text)
RETURNS jsonb AS $$
BEGIN
  RETURN CASE tier_name
    WHEN 'legendary' THEN '{"label": "LEGENDARY", "color": "#FFD700", "order": 1}'::jsonb
    WHEN 'amazing' THEN '{"label": "AMAZING", "color": "#C0C0C0", "order": 2}'::jsonb
    WHEN 'very_good' THEN '{"label": "VERY GOOD", "color": "#CD7F32", "order": 3}'::jsonb
    WHEN 'good' THEN '{"label": "GOOD", "color": "#22C55E", "order": 4}'::jsonb
    WHEN 'okay' THEN '{"label": "OKAY", "color": "#3B82F6", "order": 5}'::jsonb
    WHEN 'not_good' THEN '{"label": "NOT GOOD", "color": "#F97316", "order": 6}'::jsonb
    WHEN 'not_interested' THEN '{"label": "NOT INTERESTED", "color": "#6B7280", "order": 7}'::jsonb
    ELSE '{"label": "UNRATED", "color": "#9CA3AF", "order": 8}'::jsonb
  END;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- =====================================================
-- FRANCHISE MAPPING
-- =====================================================

-- Common franchise identifiers
COMMENT ON COLUMN watchlist.franchise IS 'Franchise identifiers: star_wars, got, lotr, mcu, dceu, harry_potter, matrix, etc.';

