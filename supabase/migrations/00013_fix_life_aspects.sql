-- =====================================================
-- FIX LIFE ASPECTS TO MATCH FRONTEND
-- Updates life_aspects table to use frontend aspect IDs
-- =====================================================

-- First, clear existing data (if any migrations created objectives with old IDs)
TRUNCATE TABLE daily_tasks CASCADE;
TRUNCATE TABLE weekly_objectives CASCADE;
TRUNCATE TABLE monthly_objectives CASCADE;

-- Delete old life aspects
DELETE FROM life_aspects;

-- Insert the correct life aspects matching frontend
INSERT INTO life_aspects (id, name, description, icon, color, display_order) VALUES
  ('training', 'Training', 'Track workouts and fitness progress', '🏋️', '#FF6B6B', 1),
  ('food', 'Food', 'Log meals and nutrition', '🍽️', '#4ECDC4', 2),
  ('sports', 'Sports', 'Activities and team sports', '🏆', '#FFE66D', 3),
  ('films', 'Film & Series', 'Watchlist and recommendations', '🎬', '#A855F7', 4),
  ('finance', 'Finance', 'Budget, investments and savings', '💰', '#22C55E', 5),
  ('business', 'Business', 'Projects and ideas', '💼', '#3B82F6', 6),
  ('travel', 'Travel', 'Trip planning and bucket list', '✈️', '#06B6D4', 7),
  ('family', 'Family', 'Family events and memories', '❤️', '#EC4899', 8),
  ('friends', 'Friends', 'Stay connected with friends', '👥', '#F97316', 9),
  ('events', 'Events', 'Personal calendar and social events (concerts, cinema, going out)', '🎉', '#8B5CF6', 10);

-- Note: 'settings' is not included as it's not a life aspect, just a UI section

-- Update calendar_events table to allow aspect_id to be from the new life_aspects
-- The aspect_id foreign key constraint should automatically use the new IDs

-- Optionally migrate any existing calendar events that used old aspect field
-- UPDATE calendar_events 
-- SET aspect_id = aspect 
-- WHERE aspect_id IS NULL AND aspect IN ('training', 'food', 'sports', 'films', 'finance', 'business', 'travel', 'family', 'friends', 'events');

