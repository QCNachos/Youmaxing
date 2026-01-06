-- =====================================================
-- YOUMAXING 4-LEVEL CALENDAR SYSTEM
-- Migration for hierarchical calendar system
-- =====================================================

-- =====================================================
-- LIFE ASPECTS LOOKUP TABLE
-- =====================================================

CREATE TABLE life_aspects (
  id text PRIMARY KEY,
  name text NOT NULL,
  description text,
  icon text,
  color text,
  display_order integer NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Insert the 10 life aspects
INSERT INTO life_aspects (id, name, description, icon, color, display_order) VALUES
  ('health', 'Health & Fitness', 'Physical health, training, and wellness', '🏃', '#FF6B6B', 1),
  ('nutrition', 'Nutrition', 'Diet, meals, and eating habits', '🥗', '#4ECDC4', 2),
  ('finance', 'Finance', 'Money management, budgeting, and investments', '💰', '#45B7D1', 3),
  ('career', 'Career & Business', 'Professional growth and business ventures', '💼', '#96CEB4', 4),
  ('relationships', 'Relationships', 'Friends, social connections, and networking', '👥', '#FFEAA7', 5),
  ('family', 'Family', 'Family relationships and home life', '🏠', '#DDA0DD', 6),
  ('learning', 'Learning & Growth', 'Personal development, education, and skills', '📚', '#98D8C8', 7),
  ('entertainment', 'Entertainment', 'Movies, shows, hobbies, and leisure activities', '🎬', '#F7DC6F', 8),
  ('travel', 'Travel & Adventure', 'Trips, exploration, and new experiences', '✈️', '#BB8FCE', 9),
  ('lifestyle', 'Lifestyle', 'Daily routines, habits, and general well-being', '🌱', '#85C1E9', 10);

-- =====================================================
-- MONTHLY OBJECTIVES
-- =====================================================

CREATE TABLE monthly_objectives (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  description text,
  aspect_id text REFERENCES life_aspects(id) NOT NULL,
  type text NOT NULL CHECK (type IN ('personal', 'job')),
  target_month date NOT NULL, -- YYYY-MM-01 format
  status text DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
  priority text DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  progress_percentage numeric DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
  completed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),

  UNIQUE(user_id, target_month, aspect_id, type)
);

-- =====================================================
-- WEEKLY OBJECTIVES
-- =====================================================

CREATE TABLE weekly_objectives (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  monthly_objective_id uuid REFERENCES monthly_objectives(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  aspect_id text REFERENCES life_aspects(id) NOT NULL,
  type text NOT NULL CHECK (type IN ('personal', 'job')),
  target_week_start date NOT NULL, -- Monday of the week (YYYY-MM-DD)
  status text DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
  priority text DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  progress_percentage numeric DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
  completed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),

  UNIQUE(user_id, target_week_start, aspect_id, type)
);

-- =====================================================
-- DAILY TASKS
-- =====================================================

CREATE TABLE daily_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  weekly_objective_id uuid REFERENCES weekly_objectives(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  aspect_id text REFERENCES life_aspects(id) NOT NULL,
  type text NOT NULL CHECK (type IN ('personal', 'job')),
  target_date date NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
  priority text DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  estimated_duration_minutes integer,
  actual_duration_minutes integer,
  completed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(id, user_id)
);

-- =====================================================
-- UPDATE CALENDAR EVENTS
-- =====================================================

-- Add new columns to existing calendar_events table
ALTER TABLE calendar_events
ADD COLUMN aspect_id text REFERENCES life_aspects(id),
ADD COLUMN type text CHECK (type IN ('personal', 'job')),
ADD COLUMN priority text DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
ADD COLUMN status text DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled')),
ADD COLUMN monthly_objective_id uuid REFERENCES monthly_objectives(id),
ADD COLUMN weekly_objective_id uuid REFERENCES weekly_objectives(id),
ADD COLUMN daily_task_id uuid REFERENCES daily_tasks(id),
ADD COLUMN estimated_duration_minutes integer,
ADD COLUMN actual_duration_minutes integer,
ADD COLUMN completed_at timestamptz,
ADD COLUMN recurrence_rule text, -- iCal RRULE format for recurring events
ADD COLUMN updated_at timestamptz DEFAULT now();

-- Set default values for existing events (assume personal type and infer aspect from title/content if possible)
UPDATE calendar_events SET
  type = 'personal',
  priority = 'medium',
  status = 'scheduled',
  updated_at = now()
WHERE type IS NULL;

-- Make the new columns NOT NULL after setting defaults
ALTER TABLE calendar_events
ALTER COLUMN type SET NOT NULL,
ALTER COLUMN priority SET NOT NULL,
ALTER COLUMN status SET NOT NULL;

-- =====================================================
-- TASK DEPENDENCIES (for complex task relationships)
-- =====================================================

CREATE TABLE task_dependencies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  dependent_task_id uuid NOT NULL, -- Task that depends on prerequisite
  prerequisite_task_id uuid NOT NULL, -- Task that must be completed first
  dependency_type text DEFAULT 'completion' CHECK (dependency_type IN ('completion', 'start_after')),
  created_at timestamptz DEFAULT now(),

  -- Ensure dependent and prerequisite are different tasks
  CHECK (dependent_task_id != prerequisite_task_id),

  -- Ensure both tasks belong to the same user
  FOREIGN KEY (dependent_task_id, user_id) REFERENCES daily_tasks(id, user_id),
  FOREIGN KEY (prerequisite_task_id, user_id) REFERENCES daily_tasks(id, user_id)
);

-- =====================================================
-- INDEXES
-- =====================================================

-- Life aspects
CREATE INDEX idx_life_aspects_display_order ON life_aspects(display_order);

-- Monthly objectives
CREATE INDEX idx_monthly_objectives_user_id ON monthly_objectives(user_id);
CREATE INDEX idx_monthly_objectives_target_month ON monthly_objectives(target_month);
CREATE INDEX idx_monthly_objectives_aspect ON monthly_objectives(aspect_id);
CREATE INDEX idx_monthly_objectives_status ON monthly_objectives(status);

-- Weekly objectives
CREATE INDEX idx_weekly_objectives_user_id ON weekly_objectives(user_id);
CREATE INDEX idx_weekly_objectives_target_week ON weekly_objectives(target_week_start);
CREATE INDEX idx_weekly_objectives_monthly ON weekly_objectives(monthly_objective_id);
CREATE INDEX idx_weekly_objectives_aspect ON weekly_objectives(aspect_id);
CREATE INDEX idx_weekly_objectives_status ON weekly_objectives(status);

-- Daily tasks
CREATE INDEX idx_daily_tasks_user_id ON daily_tasks(user_id);
CREATE INDEX idx_daily_tasks_target_date ON daily_tasks(target_date);
CREATE INDEX idx_daily_tasks_weekly ON daily_tasks(weekly_objective_id);
CREATE INDEX idx_daily_tasks_aspect ON daily_tasks(aspect_id);
CREATE INDEX idx_daily_tasks_status ON daily_tasks(status);

-- Updated calendar events
CREATE INDEX idx_calendar_events_aspect ON calendar_events(aspect_id);
CREATE INDEX idx_calendar_events_type ON calendar_events(type);
CREATE INDEX idx_calendar_events_status ON calendar_events(status);
CREATE INDEX idx_calendar_events_monthly_obj ON calendar_events(monthly_objective_id);
CREATE INDEX idx_calendar_events_weekly_obj ON calendar_events(weekly_objective_id);
CREATE INDEX idx_calendar_events_daily_task ON calendar_events(daily_task_id);

-- Task dependencies
CREATE INDEX idx_task_dependencies_user ON task_dependencies(user_id);
CREATE INDEX idx_task_dependencies_dependent ON task_dependencies(dependent_task_id);
CREATE INDEX idx_task_dependencies_prerequisite ON task_dependencies(prerequisite_task_id);

-- =====================================================
-- ROW LEVEL SECURITY
-- =====================================================

ALTER TABLE life_aspects ENABLE ROW LEVEL SECURITY;
ALTER TABLE monthly_objectives ENABLE ROW LEVEL SECURITY;
ALTER TABLE weekly_objectives ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_dependencies ENABLE ROW LEVEL SECURITY;

-- Life aspects are readable by all authenticated users
CREATE POLICY "Life aspects are readable by all users" ON life_aspects FOR SELECT TO authenticated USING (true);

-- Users can only manage their own objectives and tasks
CREATE POLICY "Users can manage own monthly objectives" ON monthly_objectives FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own weekly objectives" ON weekly_objectives FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own daily tasks" ON daily_tasks FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own task dependencies" ON task_dependencies FOR ALL USING (auth.uid() = user_id);

-- =====================================================
-- HELPER FUNCTIONS
-- =====================================================

-- Function to update progress when a daily task is completed
CREATE OR REPLACE FUNCTION update_weekly_objective_progress(p_weekly_objective_id uuid)
RETURNS void AS $$
DECLARE
  total_tasks integer;
  completed_tasks integer;
BEGIN
  -- Count total and completed daily tasks for this weekly objective
  SELECT COUNT(*), COUNT(*) FILTER (WHERE status = 'completed')
  INTO total_tasks, completed_tasks
  FROM daily_tasks
  WHERE weekly_objective_id = p_weekly_objective_id;

  -- Update weekly objective progress
  UPDATE weekly_objectives
  SET progress_percentage = CASE
      WHEN total_tasks > 0 THEN (completed_tasks::numeric / total_tasks::numeric) * 100
      ELSE 0
    END,
    status = CASE
      WHEN total_tasks > 0 AND completed_tasks = total_tasks THEN 'completed'
      ELSE 'active'
    END,
    completed_at = CASE
      WHEN total_tasks > 0 AND completed_tasks = total_tasks AND completed_at IS NULL THEN now()
      ELSE completed_at
    END,
    updated_at = now()
  WHERE id = p_weekly_objective_id;
END;
$$ LANGUAGE plpgsql;

-- Function to update progress when a weekly objective is completed
CREATE OR REPLACE FUNCTION update_monthly_objective_progress(p_monthly_objective_id uuid)
RETURNS void AS $$
DECLARE
  total_weeks integer;
  completed_weeks integer;
BEGIN
  -- Count total and completed weekly objectives for this monthly objective
  SELECT COUNT(*), COUNT(*) FILTER (WHERE status = 'completed')
  INTO total_weeks, completed_weeks
  FROM weekly_objectives
  WHERE monthly_objective_id = p_monthly_objective_id;

  -- Update monthly objective progress
  UPDATE monthly_objectives
  SET progress_percentage = CASE
      WHEN total_weeks > 0 THEN (completed_weeks::numeric / total_weeks::numeric) * 100
      ELSE 0
    END,
    status = CASE
      WHEN total_weeks > 0 AND completed_weeks = total_weeks THEN 'completed'
      ELSE 'active'
    END,
    completed_at = CASE
      WHEN total_weeks > 0 AND completed_weeks = total_weeks AND completed_at IS NULL THEN now()
      ELSE completed_at
    END,
    updated_at = now()
  WHERE id = p_monthly_objective_id;
END;
$$ LANGUAGE plpgsql;

-- Function to handle daily task completion cascade
CREATE OR REPLACE FUNCTION handle_daily_task_completion()
RETURNS trigger AS $$
BEGIN
  -- Only trigger on status change to completed
  IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN
    -- Update the weekly objective progress
    IF NEW.weekly_objective_id IS NOT NULL THEN
      PERFORM update_weekly_objective_progress(NEW.weekly_objective_id);

      -- Get the monthly objective from the weekly objective and update it
      UPDATE monthly_objectives
      SET updated_at = now()
      WHERE id IN (
        SELECT monthly_objective_id
        FROM weekly_objectives
        WHERE id = NEW.weekly_objective_id
          AND monthly_objective_id IS NOT NULL
      );
    END IF;

    -- Mark the task as completed with timestamp
    NEW.completed_at = COALESCE(NEW.completed_at, now());
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to handle weekly objective completion cascade
CREATE OR REPLACE FUNCTION handle_weekly_objective_completion()
RETURNS trigger AS $$
BEGIN
  -- Only trigger on status change to completed
  IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN
    -- Update the monthly objective progress
    IF NEW.monthly_objective_id IS NOT NULL THEN
      PERFORM update_monthly_objective_progress(NEW.monthly_objective_id);
    END IF;

    -- Mark as completed with timestamp
    NEW.completed_at = COALESCE(NEW.completed_at, now());
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to handle monthly objective completion
CREATE OR REPLACE FUNCTION handle_monthly_objective_completion()
RETURNS trigger AS $$
BEGIN
  -- Only trigger on status change to completed
  IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN
    -- Mark as completed with timestamp
    NEW.completed_at = COALESCE(NEW.completed_at, now());
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Trigger for daily task completion
CREATE TRIGGER trigger_daily_task_completion
  BEFORE UPDATE ON daily_tasks
  FOR EACH ROW
  EXECUTE FUNCTION handle_daily_task_completion();

-- Trigger for weekly objective completion
CREATE TRIGGER trigger_weekly_objective_completion
  BEFORE UPDATE ON weekly_objectives
  FOR EACH ROW
  EXECUTE FUNCTION handle_weekly_objective_completion();

-- Trigger for monthly objective completion
CREATE TRIGGER trigger_monthly_objective_completion
  BEFORE UPDATE ON monthly_objectives
  FOR EACH ROW
  EXECUTE FUNCTION handle_monthly_objective_completion();

-- =====================================================
-- SERVICE ROLE GRANTS
-- =====================================================

GRANT SELECT ON life_aspects TO service_role;
GRANT INSERT, UPDATE ON monthly_objectives TO service_role;
GRANT INSERT, UPDATE ON weekly_objectives TO service_role;
GRANT INSERT, UPDATE ON daily_tasks TO service_role;
GRANT INSERT, UPDATE ON calendar_events TO service_role;









