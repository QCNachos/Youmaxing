-- =====================================================
-- FIX LIFE ASPECTS TO MATCH FRONTEND
-- Updates life_aspects table to use frontend aspect IDs
-- THIS IS THE CRITICAL MIGRATION TO FIX 409 ERRORS
-- =====================================================

-- Step 1: Clear all tables that reference life_aspects
-- This is necessary because the old aspect IDs don't match frontend
TRUNCATE TABLE daily_tasks CASCADE;
TRUNCATE TABLE weekly_objectives CASCADE;
TRUNCATE TABLE monthly_objectives CASCADE;

-- Step 2: Delete data from tables that have foreign key to life_aspects
-- Check if template_events table exists and clear it
DO $$ 
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'template_events') THEN
        TRUNCATE TABLE template_events CASCADE;
    END IF;
END $$;

-- Check if template_objectives table exists and clear it
DO $$ 
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'template_objectives') THEN
        TRUNCATE TABLE template_objectives CASCADE;
    END IF;
END $$;

-- Check if objective_templates table exists and clear it
DO $$ 
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'objective_templates') THEN
        TRUNCATE TABLE objective_templates CASCADE;
    END IF;
END $$;

-- Step 3: Now we can safely delete old life aspects
DELETE FROM life_aspects;

-- Step 4: Insert the correct life aspects matching frontend (NO emojis in icon field)
INSERT INTO life_aspects (id, name, description, icon, color, display_order) VALUES
  ('training', 'Training', 'Track workouts and fitness progress', 'dumbbell', '#FF6B6B', 1),
  ('food', 'Food', 'Log meals and nutrition', 'utensils', '#4ECDC4', 2),
  ('sports', 'Sports', 'Activities and team sports', 'trophy', '#FFE66D', 3),
  ('films', 'Film & Series', 'Watchlist and recommendations', 'film', '#A855F7', 4),
  ('finance', 'Finance', 'Budget, investments and savings', 'dollar-sign', '#22C55E', 5),
  ('business', 'Business', 'Projects and ideas', 'briefcase', '#3B82F6', 6),
  ('travel', 'Travel', 'Trip planning and bucket list', 'plane', '#06B6D4', 7),
  ('family', 'Family', 'Family events and memories', 'heart', '#EC4899', 8),
  ('friends', 'Friends', 'Stay connected with friends', 'users', '#F97316', 9),
  ('events', 'Events', 'Personal calendar and social events (concerts, cinema, going out)', 'party-popper', '#8B5CF6', 10);

-- Note: 'settings' is not included as it's not a life aspect, just a UI section
-- Icon names match Lucide icon names used in frontend

