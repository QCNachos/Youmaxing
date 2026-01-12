-- =====================================================
-- TRAINING APP ENHANCED SCHEMA
-- Migration: 00018_training_enhanced.sql
-- =====================================================

-- =====================================================
-- 1. ENHANCE TRAINING_LOGS TABLE
-- =====================================================

-- Add new columns to training_logs
ALTER TABLE training_logs ADD COLUMN IF NOT EXISTS body_parts text[] DEFAULT '{}';
ALTER TABLE training_logs ADD COLUMN IF NOT EXISTS distance_km numeric;
ALTER TABLE training_logs ADD COLUMN IF NOT EXISTS calories_burned integer;
ALTER TABLE training_logs ADD COLUMN IF NOT EXISTS heart_rate_avg integer;
ALTER TABLE training_logs ADD COLUMN IF NOT EXISTS heart_rate_max integer;
ALTER TABLE training_logs ADD COLUMN IF NOT EXISTS workout_date date DEFAULT CURRENT_DATE;

-- Update the type constraint to include new training types
ALTER TABLE training_logs DROP CONSTRAINT IF EXISTS training_logs_type_check;
ALTER TABLE training_logs ADD CONSTRAINT training_logs_type_check 
  CHECK (type IN ('strength', 'cardio', 'flexibility', 'hiit', 'sports', 'other'));

-- =====================================================
-- 2. WORKOUT EXERCISES TABLE (for strength training)
-- =====================================================

CREATE TABLE IF NOT EXISTS workout_exercises (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  training_log_id uuid REFERENCES training_logs(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  exercise_name text NOT NULL,
  sets integer,
  reps integer,
  weight_kg numeric,
  notes text,
  order_index integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_workout_exercises_training_log ON workout_exercises(training_log_id);
CREATE INDEX IF NOT EXISTS idx_workout_exercises_user ON workout_exercises(user_id);

-- RLS for workout_exercises
ALTER TABLE workout_exercises ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own workout exercises" ON workout_exercises 
  FOR ALL USING (auth.uid() = user_id);

-- =====================================================
-- 3. SLEEP LOGS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS sleep_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  sleep_date date NOT NULL,
  hours_slept numeric NOT NULL CHECK (hours_slept >= 0 AND hours_slept <= 24),
  quality_rating integer CHECK (quality_rating >= 1 AND quality_rating <= 5),
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, sleep_date)
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_sleep_logs_user ON sleep_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_sleep_logs_date ON sleep_logs(sleep_date DESC);

-- RLS for sleep_logs
ALTER TABLE sleep_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own sleep logs" ON sleep_logs 
  FOR ALL USING (auth.uid() = user_id);

-- =====================================================
-- 4. TRAINING RESOURCES TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS training_resources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  url text NOT NULL,
  resource_type text DEFAULT 'other' CHECK (resource_type IN ('youtube', 'instagram', 'tiktok', 'article', 'image', 'other')),
  training_type text,
  body_parts text[] DEFAULT '{}',
  thumbnail_url text,
  notes text,
  is_favorite boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Indexes for training_resources
CREATE INDEX IF NOT EXISTS idx_training_resources_user ON training_resources(user_id);
CREATE INDEX IF NOT EXISTS idx_training_resources_type ON training_resources(resource_type);
CREATE INDEX IF NOT EXISTS idx_training_resources_favorite ON training_resources(user_id, is_favorite);
CREATE INDEX IF NOT EXISTS idx_training_resources_body_parts ON training_resources USING gin(body_parts);

-- RLS for training_resources
ALTER TABLE training_resources ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own training resources" ON training_resources 
  FOR ALL USING (auth.uid() = user_id);

-- =====================================================
-- 5. WORKOUT TEMPLATES TABLE (for AI-generated and saved templates)
-- =====================================================

CREATE TABLE IF NOT EXISTS workout_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  training_type text NOT NULL,
  body_parts text[] DEFAULT '{}',
  duration_minutes integer,
  intensity text DEFAULT 'medium' CHECK (intensity IN ('low', 'medium', 'high')),
  exercises jsonb DEFAULT '[]',
  is_ai_generated boolean DEFAULT false,
  is_public boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Indexes for workout_templates
CREATE INDEX IF NOT EXISTS idx_workout_templates_user ON workout_templates(user_id);
CREATE INDEX IF NOT EXISTS idx_workout_templates_type ON workout_templates(training_type);
CREATE INDEX IF NOT EXISTS idx_workout_templates_public ON workout_templates(is_public) WHERE is_public = true;

-- RLS for workout_templates
ALTER TABLE workout_templates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own workout templates" ON workout_templates 
  FOR ALL USING (auth.uid() = user_id OR is_public = true);
CREATE POLICY "Users can insert own workout templates" ON workout_templates 
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- =====================================================
-- 6. ADD DISTANCE UNIT PREFERENCE TO USER PREFERENCES
-- =====================================================

ALTER TABLE user_preferences ADD COLUMN IF NOT EXISTS distance_unit text DEFAULT 'km' 
  CHECK (distance_unit IN ('km', 'miles'));

-- =====================================================
-- 7. HELPER FUNCTIONS
-- =====================================================

-- Function to calculate pace (min/km) from distance and duration
CREATE OR REPLACE FUNCTION calculate_pace(distance_km numeric, duration_minutes numeric)
RETURNS numeric AS $$
BEGIN
  IF distance_km IS NULL OR distance_km = 0 OR duration_minutes IS NULL THEN
    RETURN NULL;
  END IF;
  RETURN ROUND(duration_minutes / distance_km, 2);
END;
$$ LANGUAGE plpgsql;

-- Function to get weekly workout summary
CREATE OR REPLACE FUNCTION get_weekly_workout_summary(p_user_id uuid, p_week_start date)
RETURNS TABLE (
  day_of_week integer,
  workout_count bigint,
  total_duration integer,
  total_calories integer
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    EXTRACT(DOW FROM tl.workout_date)::integer as day_of_week,
    COUNT(*)::bigint as workout_count,
    COALESCE(SUM(tl.duration_minutes), 0)::integer as total_duration,
    COALESCE(SUM(tl.calories_burned), 0)::integer as total_calories
  FROM training_logs tl
  WHERE tl.user_id = p_user_id
    AND tl.workout_date >= p_week_start
    AND tl.workout_date < p_week_start + interval '7 days'
  GROUP BY EXTRACT(DOW FROM tl.workout_date);
END;
$$ LANGUAGE plpgsql;

-- Function to get weekly sleep summary
CREATE OR REPLACE FUNCTION get_weekly_sleep_summary(p_user_id uuid, p_week_start date)
RETURNS TABLE (
  avg_hours numeric,
  avg_quality numeric,
  days_logged bigint
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ROUND(AVG(sl.hours_slept), 1) as avg_hours,
    ROUND(AVG(sl.quality_rating), 1) as avg_quality,
    COUNT(*)::bigint as days_logged
  FROM sleep_logs sl
  WHERE sl.user_id = p_user_id
    AND sl.sleep_date >= p_week_start
    AND sl.sleep_date < p_week_start + interval '7 days';
END;
$$ LANGUAGE plpgsql;

