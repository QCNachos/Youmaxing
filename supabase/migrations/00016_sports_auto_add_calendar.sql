-- =====================================================
-- SPORTS AUTO-ADD TO CALENDAR PREFERENCE
-- Adds preference to automatically add favorite team games to calendar
-- =====================================================

-- Add auto_add_sports_games_to_calendar field to user_preferences
ALTER TABLE user_preferences 
  ADD COLUMN IF NOT EXISTS auto_add_sports_games_to_calendar boolean DEFAULT false;

-- Add comment to explain the field
COMMENT ON COLUMN user_preferences.auto_add_sports_games_to_calendar IS 'When enabled, automatically adds favorite team games to calendar';

