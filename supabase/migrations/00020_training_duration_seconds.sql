-- =====================================================
-- TRAINING DURATION IN SECONDS
-- Migration: 00020_training_duration_seconds.sql
-- =====================================================

-- Change duration_minutes to duration_seconds for more precision
-- First add the new column
ALTER TABLE training_logs ADD COLUMN IF NOT EXISTS duration_seconds integer;

-- Migrate existing data (convert minutes to seconds)
UPDATE training_logs 
SET duration_seconds = duration_minutes * 60 
WHERE duration_seconds IS NULL AND duration_minutes IS NOT NULL;

-- Update workout_templates too
ALTER TABLE workout_templates ADD COLUMN IF NOT EXISTS duration_seconds integer;

UPDATE workout_templates 
SET duration_seconds = duration_minutes * 60 
WHERE duration_seconds IS NULL AND duration_minutes IS NOT NULL;

-- Update the helper function to work with seconds
CREATE OR REPLACE FUNCTION calculate_pace_from_seconds(distance_km numeric, duration_seconds integer)
RETURNS text AS $$
DECLARE
  pace_seconds integer;
  pace_mins integer;
  pace_secs integer;
BEGIN
  IF distance_km IS NULL OR distance_km = 0 OR duration_seconds IS NULL OR duration_seconds = 0 THEN
    RETURN NULL;
  END IF;
  
  pace_seconds := (duration_seconds / distance_km)::integer;
  pace_mins := pace_seconds / 60;
  pace_secs := pace_seconds % 60;
  
  RETURN pace_mins || ':' || LPAD(pace_secs::text, 2, '0');
END;
$$ LANGUAGE plpgsql;

-- Drop the existing function first (return type is changing)
DROP FUNCTION IF EXISTS get_weekly_workout_summary(uuid, date);

-- Recreate the weekly summary function to use seconds
CREATE FUNCTION get_weekly_workout_summary(p_user_id uuid, p_week_start date)
RETURNS TABLE (
  day_of_week integer,
  workout_count bigint,
  total_duration_seconds integer,
  total_calories integer
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    EXTRACT(DOW FROM tl.workout_date)::integer as day_of_week,
    COUNT(*)::bigint as workout_count,
    COALESCE(SUM(COALESCE(tl.duration_seconds, tl.duration_minutes * 60)), 0)::integer as total_duration_seconds,
    COALESCE(SUM(tl.calories_burned), 0)::integer as total_calories
  FROM training_logs tl
  WHERE tl.user_id = p_user_id
    AND tl.workout_date >= p_week_start
    AND tl.workout_date < p_week_start + interval '7 days'
  GROUP BY EXTRACT(DOW FROM tl.workout_date);
END;
$$ LANGUAGE plpgsql;

