-- =====================================================
-- YOUMAXING CALENDAR EXPANSION
-- Additional features for comprehensive calendar system
-- =====================================================

-- =====================================================
-- RECURRING PATTERNS
-- =====================================================

CREATE TABLE recurring_patterns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  pattern_type text NOT NULL CHECK (pattern_type IN ('daily', 'weekly', 'monthly', 'yearly', 'custom')),
  frequency integer DEFAULT 1, -- every N days/weeks/months/years
  days_of_week integer[], -- 0=Sunday, 1=Monday, etc. (for weekly)
  days_of_month integer[], -- 1-31 (for monthly)
  months_of_year integer[], -- 1-12 (for yearly)
  start_date date NOT NULL,
  end_date date, -- null for indefinite
  max_occurrences integer, -- null for indefinite
  created_at timestamptz DEFAULT now()
);

-- =====================================================
-- CALENDAR TEMPLATES
-- =====================================================

CREATE TABLE calendar_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  category text NOT NULL CHECK (category IN ('personal', 'work', 'health', 'social', 'productivity')),
  is_public boolean DEFAULT false,
  created_by uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),

  UNIQUE(name, created_by)
);

CREATE TABLE template_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id uuid REFERENCES calendar_templates(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  aspect_id text REFERENCES life_aspects(id),
  type text NOT NULL CHECK (type IN ('personal', 'job')),
  duration_minutes integer,
  relative_days integer NOT NULL, -- days from template start (0 = same day, 1 = next day, etc.)
  start_time time, -- specific time of day
  is_all_day boolean DEFAULT false,
  priority text DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  tags text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- =====================================================
-- CALENDAR SHARING & COLLABORATION
-- =====================================================

CREATE TABLE calendar_shares (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  calendar_owner_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  shared_with_user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  permission_level text NOT NULL CHECK (permission_level IN ('view', 'edit', 'admin')),
  shared_at timestamptz DEFAULT now(),

  UNIQUE(calendar_owner_id, shared_with_user_id)
);

CREATE TABLE calendar_groups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  created_by uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE calendar_group_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id uuid REFERENCES calendar_groups(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('member', 'admin')),
  joined_at timestamptz DEFAULT now(),

  UNIQUE(group_id, user_id)
);

-- =====================================================
-- ENHANCED CALENDAR EVENTS (with recurring support)
-- =====================================================

ALTER TABLE calendar_events
ADD COLUMN recurring_pattern_id uuid REFERENCES recurring_patterns(id) ON DELETE SET NULL,
ADD COLUMN parent_event_id uuid REFERENCES calendar_events(id) ON DELETE CASCADE, -- for recurring instances
ADD COLUMN is_recurring boolean DEFAULT false,
ADD COLUMN recurrence_exception_dates date[] DEFAULT '{}', -- dates when this recurrence is skipped
ADD COLUMN tags text[] DEFAULT '{}',
ADD COLUMN location text,
ADD COLUMN virtual_meeting_url text,
ADD COLUMN attendees text[] DEFAULT '{}', -- email addresses or user IDs
ADD COLUMN reminder_minutes_before integer[] DEFAULT '{}', -- e.g., [15, 60] for 15min and 1hr reminders
ADD COLUMN color_override text, -- custom color for this event
ADD COLUMN calendar_group_id uuid REFERENCES calendar_groups(id) ON DELETE SET NULL;

-- =====================================================
-- CALENDAR VIEWS & PREFERENCES
-- =====================================================

CREATE TABLE calendar_views (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  view_type text NOT NULL CHECK (view_type IN ('month', 'week', 'day', 'agenda', 'timeline')),
  is_default boolean DEFAULT false,
  filters jsonb DEFAULT '{}', -- aspect filters, type filters, etc.
  created_at timestamptz DEFAULT now(),

  UNIQUE(user_id, name)
);

CREATE TABLE calendar_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  default_view text DEFAULT 'month' CHECK (default_view IN ('month', 'week', 'day', 'agenda', 'timeline')),
  week_starts_on integer DEFAULT 1, -- 0=Sunday, 1=Monday
  time_format text DEFAULT '12h' CHECK (time_format IN ('12h', '24h')),
  show_weekends boolean DEFAULT true,
  working_hours_start time DEFAULT '09:00',
  working_hours_end time DEFAULT '17:00',
  timezone text DEFAULT 'UTC',
  calendar_theme text DEFAULT 'default',
  show_completed_tasks boolean DEFAULT true,
  auto_expand_recurring boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- =====================================================
-- CALENDAR ANALYTICS & INSIGHTS
-- =====================================================

CREATE TABLE calendar_analytics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  date_recorded date NOT NULL,
  total_events integer DEFAULT 0,
  completed_tasks integer DEFAULT 0,
  total_tasks integer DEFAULT 0,
  time_blocked_hours numeric DEFAULT 0,
  most_productive_aspect text,
  busiest_day_of_week integer, -- 0-6
  average_daily_events numeric DEFAULT 0,
  goal_completion_rate numeric DEFAULT 0,
  created_at timestamptz DEFAULT now(),

  UNIQUE(user_id, date_recorded)
);

CREATE TABLE calendar_insights (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  insight_type text NOT NULL CHECK (insight_type IN ('productivity', 'balance', 'overbooking', 'goal_progress', 'habit')),
  title text NOT NULL,
  description text NOT NULL,
  priority text DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  actionable boolean DEFAULT true,
  related_aspects text[] DEFAULT '{}',
  suggested_actions text[] DEFAULT '{}',
  expires_at timestamptz,
  dismissed boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- =====================================================
-- QUICK ACTIONS & SHORTCUTS
-- =====================================================

CREATE TABLE calendar_quick_actions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  action_type text NOT NULL CHECK (action_type IN ('create_event', 'create_task', 'apply_template', 'quick_note')),
  template jsonb, -- pre-filled data for quick creation
  shortcut_key text, -- keyboard shortcut
  usage_count integer DEFAULT 0,
  last_used_at timestamptz,
  created_at timestamptz DEFAULT now(),

  UNIQUE(user_id, shortcut_key)
);

-- =====================================================
-- CALENDAR EXPORT/IMPORT
-- =====================================================

CREATE TABLE calendar_exports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  export_type text NOT NULL CHECK (export_type IN ('ical', 'google_calendar', 'outlook', 'json')),
  date_range_start date,
  date_range_end date,
  include_private_events boolean DEFAULT false,
  export_url text, -- temporary URL for download
  expires_at timestamptz NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- =====================================================
-- OBJECTIVE TEMPLATES
-- =====================================================

CREATE TABLE objective_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  category text NOT NULL CHECK (category IN ('health', 'career', 'personal', 'relationships', 'finance', 'learning')),
  level text NOT NULL CHECK (level IN ('monthly', 'weekly', 'daily')),
  is_public boolean DEFAULT false,
  created_by uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),

  UNIQUE(name, created_by)
);

CREATE TABLE template_objectives (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id uuid REFERENCES objective_templates(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  aspect_id text REFERENCES life_aspects(id) NOT NULL,
  type text NOT NULL CHECK (type IN ('personal', 'job')),
  estimated_duration_days integer DEFAULT 1,
  priority text DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  success_criteria text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- =====================================================
-- ENHANCED OBJECTIVES WITH TEMPLATES
-- =====================================================

ALTER TABLE monthly_objectives
ADD COLUMN template_id uuid REFERENCES objective_templates(id) ON DELETE SET NULL,
ADD COLUMN estimated_duration_days integer DEFAULT 30,
ADD COLUMN success_criteria text[] DEFAULT '{}',
ADD COLUMN dependencies text[] DEFAULT '{}', -- related objectives or prerequisites
ADD COLUMN review_notes text,
ADD COLUMN review_date timestamptz;

ALTER TABLE weekly_objectives
ADD COLUMN template_id uuid REFERENCES objective_templates(id) ON DELETE SET NULL,
ADD COLUMN estimated_duration_days integer DEFAULT 7,
ADD COLUMN success_criteria text[] DEFAULT '{}',
ADD COLUMN dependencies text[] DEFAULT '{}',
ADD COLUMN review_notes text,
ADD COLUMN review_date timestamptz;

ALTER TABLE daily_tasks
ADD COLUMN template_id uuid REFERENCES objective_templates(id) ON DELETE SET NULL,
ADD COLUMN dependencies text[] DEFAULT '{}',
ADD COLUMN review_notes text,
ADD COLUMN review_date timestamptz;

-- =====================================================
-- INDEXES
-- =====================================================

-- Recurring patterns
CREATE INDEX idx_recurring_patterns_type ON recurring_patterns(pattern_type);
CREATE INDEX idx_recurring_patterns_start_date ON recurring_patterns(start_date);

-- Calendar templates
CREATE INDEX idx_calendar_templates_category ON calendar_templates(category);
CREATE INDEX idx_calendar_templates_public ON calendar_templates(created_by, is_public);
CREATE INDEX idx_template_events_template ON template_events(template_id);
CREATE INDEX idx_template_events_aspect ON template_events(aspect_id);

-- Calendar sharing
CREATE INDEX idx_calendar_shares_owner ON calendar_shares(calendar_owner_id);
CREATE INDEX idx_calendar_shares_shared_with ON calendar_shares(shared_with_user_id);
CREATE INDEX idx_calendar_groups_created_by ON calendar_groups(created_by);
CREATE INDEX idx_calendar_group_members_group ON calendar_group_members(group_id);
CREATE INDEX idx_calendar_group_members_user ON calendar_group_members(user_id);

-- Enhanced calendar events
CREATE INDEX idx_calendar_events_recurring ON calendar_events(recurring_pattern_id);
CREATE INDEX idx_calendar_events_parent ON calendar_events(parent_event_id);
CREATE INDEX idx_calendar_events_group ON calendar_events(calendar_group_id);
CREATE INDEX idx_calendar_events_tags ON calendar_events USING gin(tags);
CREATE INDEX idx_calendar_events_attendees ON calendar_events USING gin(attendees);

-- Calendar views and preferences
CREATE INDEX idx_calendar_views_user ON calendar_views(user_id, is_default);
CREATE INDEX idx_calendar_preferences_user ON calendar_preferences(user_id);

-- Analytics and insights
CREATE INDEX idx_calendar_analytics_user_date ON calendar_analytics(user_id, date_recorded DESC);
CREATE INDEX idx_calendar_insights_user ON calendar_insights(user_id, dismissed, priority);
CREATE INDEX idx_calendar_insights_type ON calendar_insights(insight_type);

-- Quick actions
CREATE INDEX idx_calendar_quick_actions_user ON calendar_quick_actions(user_id);
CREATE INDEX idx_calendar_quick_actions_shortcut ON calendar_quick_actions(user_id, shortcut_key);

-- Export/Import
CREATE INDEX idx_calendar_exports_user ON calendar_exports(user_id, expires_at);

-- Objective templates
CREATE INDEX idx_objective_templates_category ON objective_templates(category, level);
CREATE INDEX idx_objective_templates_public ON objective_templates(created_by, is_public);
CREATE INDEX idx_template_objectives_template ON template_objectives(template_id);

-- =====================================================
-- ROW LEVEL SECURITY
-- =====================================================

ALTER TABLE recurring_patterns ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE template_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_quick_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_exports ENABLE ROW LEVEL SECURITY;
ALTER TABLE objective_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE template_objectives ENABLE ROW LEVEL SECURITY;

-- Recurring patterns - accessible by authenticated users
CREATE POLICY "Recurring patterns are accessible by authenticated users" ON recurring_patterns FOR ALL TO authenticated USING (true);

-- Calendar templates - users can see public templates and their own
CREATE POLICY "Users can view public templates and their own" ON calendar_templates FOR SELECT TO authenticated USING (is_public = true OR created_by = auth.uid());
CREATE POLICY "Users can manage their own templates" ON calendar_templates FOR ALL TO authenticated USING (created_by = auth.uid()) WITH CHECK (created_by = auth.uid());

-- Template events - follow template permissions
CREATE POLICY "Template events follow template permissions" ON template_events FOR ALL TO authenticated USING (
  EXISTS (
    SELECT 1 FROM calendar_templates ct
    WHERE ct.id = template_events.template_id
    AND (ct.is_public = true OR ct.created_by = auth.uid())
  )
);

-- Calendar sharing - users can see shares they're involved in
CREATE POLICY "Users can view shares they're involved in" ON calendar_shares FOR SELECT TO authenticated USING (calendar_owner_id = auth.uid() OR shared_with_user_id = auth.uid());
CREATE POLICY "Users can manage shares they own" ON calendar_shares FOR ALL TO authenticated USING (calendar_owner_id = auth.uid());

-- Calendar groups - users can see groups they created or are members of
CREATE POLICY "Users can view groups they created or are members of" ON calendar_groups FOR SELECT TO authenticated USING (
  created_by = auth.uid() OR
  EXISTS (SELECT 1 FROM calendar_group_members cgm WHERE cgm.group_id = calendar_groups.id AND cgm.user_id = auth.uid())
);
CREATE POLICY "Users can manage groups they created" ON calendar_groups FOR ALL TO authenticated USING (created_by = auth.uid());

-- Calendar group members - users can see members of groups they're in
CREATE POLICY "Users can view members of groups they're in" ON calendar_group_members FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM calendar_groups cg WHERE cg.id = calendar_group_members.group_id AND cg.created_by = auth.uid()) OR
  user_id = auth.uid()
);
CREATE POLICY "Group admins can manage members" ON calendar_group_members FOR ALL TO authenticated USING (
  EXISTS (
    SELECT 1 FROM calendar_groups cg
    WHERE cg.id = calendar_group_members.group_id AND cg.created_by = auth.uid()
  ) OR
  EXISTS (
    SELECT 1 FROM calendar_group_members cgm
    WHERE cgm.group_id = calendar_group_members.group_id AND cgm.user_id = auth.uid() AND cgm.role = 'admin'
  )
);

-- Calendar views and preferences - users only see their own
CREATE POLICY "Users can manage their own calendar views" ON calendar_views FOR ALL USING (user_id = auth.uid());
CREATE POLICY "Users can manage their own calendar preferences" ON calendar_preferences FOR ALL USING (user_id = auth.uid());

-- Analytics and insights - users only see their own
CREATE POLICY "Users can manage their own analytics" ON calendar_analytics FOR ALL USING (user_id = auth.uid());
CREATE POLICY "Users can manage their own insights" ON calendar_insights FOR ALL USING (user_id = auth.uid());

-- Quick actions - users only see their own
CREATE POLICY "Users can manage their own quick actions" ON calendar_quick_actions FOR ALL USING (user_id = auth.uid());

-- Exports - users only see their own
CREATE POLICY "Users can manage their own exports" ON calendar_exports FOR ALL USING (user_id = auth.uid());

-- Objective templates - users can see public templates and their own
CREATE POLICY "Users can view public objective templates and their own" ON objective_templates FOR SELECT TO authenticated USING (is_public = true OR created_by = auth.uid());
CREATE POLICY "Users can manage their own objective templates" ON objective_templates FOR ALL TO authenticated USING (created_by = auth.uid()) WITH CHECK (created_by = auth.uid());

-- Template objectives - follow template permissions
CREATE POLICY "Template objectives follow template permissions" ON template_objectives FOR ALL TO authenticated USING (
  EXISTS (
    SELECT 1 FROM objective_templates ot
    WHERE ot.id = template_objectives.template_id
    AND (ot.is_public = true OR ot.created_by = auth.uid())
  )
);

-- =====================================================
-- HELPER FUNCTIONS
-- =====================================================

-- Function to generate recurring event instances
CREATE OR REPLACE FUNCTION generate_recurring_events(
  p_pattern_id uuid,
  p_start_date date,
  p_end_date date
)
RETURNS TABLE (
  event_date date,
  instance_number integer
) AS $$
DECLARE
  pattern_record record;
  v_current_date date;
  instance_count integer := 0;
  max_instances integer;
BEGIN
  -- Get the pattern details
  SELECT * INTO pattern_record FROM recurring_patterns WHERE id = p_pattern_id;

  IF NOT FOUND THEN
    RETURN;
  END IF;

  v_current_date := pattern_record.start_date;
  max_instances := pattern_record.max_occurrences;

  -- Generate instances based on pattern type
  CASE pattern_record.pattern_type
    WHEN 'daily' THEN
      WHILE v_current_date <= p_end_date AND (max_instances IS NULL OR instance_count < max_instances) LOOP
        IF v_current_date >= p_start_date THEN
          instance_count := instance_count + 1;
          RETURN QUERY SELECT v_current_date, instance_count;
        END IF;
        v_current_date := v_current_date + (pattern_record.frequency || ' days')::interval;
      END LOOP;

    WHEN 'weekly' THEN
      WHILE v_current_date <= p_end_date AND (max_instances IS NULL OR instance_count < max_instances) LOOP
        IF v_current_date >= p_start_date AND
           (pattern_record.days_of_week IS NULL OR
            EXTRACT(DOW FROM v_current_date) = ANY(pattern_record.days_of_week)) THEN
          instance_count := instance_count + 1;
          RETURN QUERY SELECT v_current_date, instance_count;
        END IF;
        v_current_date := v_current_date + (pattern_record.frequency || ' weeks')::interval;
      END LOOP;

    WHEN 'monthly' THEN
      WHILE v_current_date <= p_end_date AND (max_instances IS NULL OR instance_count < max_instances) LOOP
        IF v_current_date >= p_start_date AND
           (pattern_record.days_of_month IS NULL OR
            EXTRACT(DAY FROM v_current_date) = ANY(pattern_record.days_of_month)) THEN
          instance_count := instance_count + 1;
          RETURN QUERY SELECT v_current_date, instance_count;
        END IF;
        v_current_date := v_current_date + (pattern_record.frequency || ' months')::interval;
      END LOOP;

    WHEN 'yearly' THEN
      WHILE v_current_date <= p_end_date AND (max_instances IS NULL OR instance_count < max_instances) LOOP
        IF v_current_date >= p_start_date AND
           (pattern_record.months_of_year IS NULL OR
            EXTRACT(MONTH FROM v_current_date) = ANY(pattern_record.months_of_year)) THEN
          instance_count := instance_count + 1;
          RETURN QUERY SELECT v_current_date, instance_count;
        END IF;
        v_current_date := v_current_date + (pattern_record.frequency || ' years')::interval;
      END LOOP;
  END CASE;

  RETURN;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate calendar analytics
CREATE OR REPLACE FUNCTION calculate_calendar_analytics(
  p_user_id uuid,
  p_date date
)
RETURNS void AS $$
DECLARE
  total_events_count integer;
  completed_tasks_count integer;
  total_tasks_count integer;
  time_blocked numeric;
  productive_aspect text;
  busiest_day integer;
  avg_daily_events numeric;
  goal_completion numeric;
BEGIN
  -- Calculate metrics for the given date
  SELECT
    COUNT(*) FILTER (WHERE NOT (aspect = 'events' AND type = 'personal')) INTO total_events_count
  FROM calendar_events
  WHERE user_id = p_user_id
    AND DATE(start_date) = p_date;

  SELECT
    COUNT(*) FILTER (WHERE status = 'completed') INTO completed_tasks_count
  FROM daily_tasks
  WHERE user_id = p_user_id
    AND target_date = p_date;

  SELECT COUNT(*) INTO total_tasks_count
  FROM daily_tasks
  WHERE user_id = p_user_id
    AND target_date = p_date;

  SELECT COALESCE(SUM(EXTRACT(EPOCH FROM (end_date - start_date))/3600), 0) INTO time_blocked
  FROM calendar_events
  WHERE user_id = p_user_id
    AND DATE(start_date) = p_date
    AND end_date IS NOT NULL;

  -- Most productive aspect (most events)
  SELECT aspect INTO productive_aspect
  FROM calendar_events
  WHERE user_id = p_user_id
    AND DATE(start_date) = p_date
  GROUP BY aspect
  ORDER BY COUNT(*) DESC
  LIMIT 1;

  -- Calculate goal completion rate (simplified)
  SELECT COALESCE(
    (COUNT(*) FILTER (WHERE status = 'completed')::numeric /
     NULLIF(COUNT(*), 0)::numeric) * 100, 0
  ) INTO goal_completion
  FROM weekly_objectives wo
  JOIN monthly_objectives mo ON mo.id = wo.monthly_objective_id
  WHERE wo.user_id = p_user_id
    AND wo.target_week_start <= p_date
    AND wo.target_week_start + INTERVAL '6 days' >= p_date;

  -- Insert or update analytics record
  INSERT INTO calendar_analytics (
    user_id, date_recorded, total_events, completed_tasks, total_tasks,
    time_blocked_hours, most_productive_aspect, goal_completion_rate
  ) VALUES (
    p_user_id, p_date, total_events_count, completed_tasks_count, total_tasks_count,
    time_blocked, productive_aspect, goal_completion
  )
  ON CONFLICT (user_id, date_recorded)
  DO UPDATE SET
    total_events = EXCLUDED.total_events,
    completed_tasks = EXCLUDED.completed_tasks,
    total_tasks = EXCLUDED.total_tasks,
    time_blocked_hours = EXCLUDED.time_blocked_hours,
    most_productive_aspect = EXCLUDED.most_productive_aspect,
    goal_completion_rate = EXCLUDED.goal_completion_rate;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- SERVICE ROLE GRANTS
-- =====================================================

GRANT INSERT, UPDATE ON recurring_patterns TO service_role;
GRANT INSERT, UPDATE ON calendar_templates TO service_role;
GRANT INSERT, UPDATE ON template_events TO service_role;
GRANT INSERT, UPDATE ON calendar_shares TO service_role;
GRANT INSERT, UPDATE ON calendar_groups TO service_role;
GRANT INSERT, UPDATE ON calendar_group_members TO service_role;
GRANT INSERT, UPDATE ON calendar_views TO service_role;
GRANT INSERT, UPDATE ON calendar_preferences TO service_role;
GRANT INSERT, UPDATE ON calendar_analytics TO service_role;
GRANT INSERT, UPDATE ON calendar_insights TO service_role;
GRANT INSERT, UPDATE ON calendar_quick_actions TO service_role;
GRANT INSERT, UPDATE ON calendar_exports TO service_role;
GRANT INSERT, UPDATE ON objective_templates TO service_role;
GRANT INSERT, UPDATE ON template_objectives TO service_role;

-- =====================================================
-- SAMPLE DATA INSERTS
-- =====================================================

-- Insert some sample calendar templates
INSERT INTO calendar_templates (name, description, category, is_public) VALUES
  ('Morning Routine', 'Start your day right with health and productivity focus', 'productivity', true),
  ('Weekly Review', 'Reflect on the past week and plan ahead', 'productivity', true),
  ('Client Meeting Preparation', 'Prepare thoroughly for important client discussions', 'work', true),
  ('Date Night', 'Romantic evening with your partner', 'social', true),
  ('Workout Session', 'Complete gym or home workout routine', 'health', true);

-- Insert sample template events
INSERT INTO template_events (template_id, title, description, aspect_id, type, duration_minutes, relative_days, start_time, priority) VALUES
  ((SELECT id FROM calendar_templates WHERE name = 'Morning Routine'), 'Morning Meditation', '10 minutes of mindfulness', 'health', 'personal', 10, 0, '07:00', 'high'),
  ((SELECT id FROM calendar_templates WHERE name = 'Morning Routine'), 'Exercise', 'Daily workout session', 'health', 'personal', 45, 0, '07:15', 'high'),
  ((SELECT id FROM calendar_templates WHERE name = 'Morning Routine'), 'Healthy Breakfast', 'Nutritious morning meal', 'nutrition', 'personal', 20, 0, '08:15', 'medium'),
  ((SELECT id FROM calendar_templates WHERE name = 'Weekly Review'), 'Weekly Goals Review', 'Assess progress on weekly objectives', 'learning', 'personal', 30, 0, '19:00', 'high'),
  ((SELECT id FROM calendar_templates WHERE name = 'Weekly Review'), 'Next Week Planning', 'Plan objectives for the coming week', 'career', 'personal', 45, 0, '19:45', 'high');









