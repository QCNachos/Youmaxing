-- =====================================================
-- FILMS & SERIES ENHANCED TRACKING
-- TMDB integration, tier system, detailed metadata
-- =====================================================

-- Enhance existing watchlist table
ALTER TABLE watchlist ADD COLUMN IF NOT EXISTS tier text CHECK (tier IN (
  'legendary', 'amazing', 'very_good', 'good', 'okay', 
  'not_good', 'not_interested'
));
ALTER TABLE watchlist ADD COLUMN IF NOT EXISTS franchise text;
ALTER TABLE watchlist ADD COLUMN IF NOT EXISTS tmdb_id integer;
ALTER TABLE watchlist ADD COLUMN IF NOT EXISTS poster_url text;
ALTER TABLE watchlist ADD COLUMN IF NOT EXISTS backdrop_url text;
ALTER TABLE watchlist ADD COLUMN IF NOT EXISTS streaming_providers jsonb DEFAULT '[]';
ALTER TABLE watchlist ADD COLUMN IF NOT EXISTS genres text[];
ALTER TABLE watchlist ADD COLUMN IF NOT EXISTS release_year integer;
ALTER TABLE watchlist ADD COLUMN IF NOT EXISTS runtime_minutes integer;
ALTER TABLE watchlist ADD COLUMN IF NOT EXISTS director text;
ALTER TABLE watchlist ADD COLUMN IF NOT EXISTS cast text[];
ALTER TABLE watchlist ADD COLUMN IF NOT EXISTS imdb_id text;
ALTER TABLE watchlist ADD COLUMN IF NOT EXISTS watched_date date;
ALTER TABLE watchlist ADD COLUMN IF NOT EXISTS user_review text;

-- Create indexes for efficient lookups
CREATE INDEX IF NOT EXISTS idx_watchlist_tmdb ON watchlist(tmdb_id);
CREATE INDEX IF NOT EXISTS idx_watchlist_tier ON watchlist(user_id, tier);
CREATE INDEX IF NOT EXISTS idx_watchlist_franchise ON watchlist(user_id, franchise);

