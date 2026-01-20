-- Enable Supabase Realtime for all key tables
-- This allows real-time updates in the UI when data changes

-- Training/Fitness tables
ALTER PUBLICATION supabase_realtime ADD TABLE training_logs;

-- Food/Nutrition tables
ALTER PUBLICATION supabase_realtime ADD TABLE meals;

-- Sports activities
ALTER PUBLICATION supabase_realtime ADD TABLE sports_activities;

-- Business projects
ALTER PUBLICATION supabase_realtime ADD TABLE business_projects;

-- Calendar events
ALTER PUBLICATION supabase_realtime ADD TABLE calendar_events;

-- Watchlist (TV/Films)
ALTER PUBLICATION supabase_realtime ADD TABLE watchlist;

-- Travel tables (already should have realtime if used)
-- These are safe to run even if already added
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'trips'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE trips;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'bucket_list'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE bucket_list;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'visited_places'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE visited_places;
  END IF;
END $$;
