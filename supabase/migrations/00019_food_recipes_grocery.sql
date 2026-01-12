-- =====================================================
-- FOOD RECIPES, GROCERY LISTS, AND WEEKLY MEAL PLANS
-- Enhanced food tracking with recipes, smart grocery, and meal planning
-- =====================================================

-- =====================================================
-- RECIPES TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS recipes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  description text,
  servings integer DEFAULT 2,
  prep_time_minutes integer,
  cook_time_minutes integer,
  ingredients jsonb NOT NULL DEFAULT '[]',
  instructions jsonb DEFAULT '[]',
  nutrition_per_serving jsonb,
  image_url text,
  tags text[] DEFAULT '{}',
  cuisine text,
  difficulty text CHECK (difficulty IN ('easy', 'medium', 'hard')),
  is_favorite boolean DEFAULT false,
  source_url text,
  times_cooked integer DEFAULT 0,
  last_cooked_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- =====================================================
-- GROCERY LISTS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS grocery_lists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name text DEFAULT 'Shopping List',
  items jsonb NOT NULL DEFAULT '[]',
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- =====================================================
-- WEEKLY MEAL PLANS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS weekly_meal_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  week_start date NOT NULL,
  meals jsonb NOT NULL DEFAULT '{}',
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, week_start)
);

-- =====================================================
-- UPDATE NUTRITION_GOALS FOR HYDRATION UNIT
-- =====================================================

ALTER TABLE nutrition_goals ADD COLUMN IF NOT EXISTS hydration_unit text DEFAULT 'ml' 
  CHECK (hydration_unit IN ('ml', 'glasses'));
ALTER TABLE nutrition_goals ADD COLUMN IF NOT EXISTS hydration_target_ml integer DEFAULT 2000;

-- =====================================================
-- INDEXES
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_recipes_user ON recipes(user_id);
CREATE INDEX IF NOT EXISTS idx_recipes_favorite ON recipes(user_id, is_favorite);
CREATE INDEX IF NOT EXISTS idx_recipes_tags ON recipes USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_grocery_lists_user ON grocery_lists(user_id);
CREATE INDEX IF NOT EXISTS idx_grocery_lists_active ON grocery_lists(user_id, is_active);
CREATE INDEX IF NOT EXISTS idx_weekly_meal_plans_user ON weekly_meal_plans(user_id);
CREATE INDEX IF NOT EXISTS idx_weekly_meal_plans_week ON weekly_meal_plans(user_id, week_start);

-- =====================================================
-- ROW LEVEL SECURITY
-- =====================================================

ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE grocery_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE weekly_meal_plans ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- RLS POLICIES
-- =====================================================

CREATE POLICY "Users can manage own recipes" ON recipes FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own grocery lists" ON grocery_lists FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own meal plans" ON weekly_meal_plans FOR ALL USING (auth.uid() = user_id);

-- =====================================================
-- HELPER FUNCTIONS
-- =====================================================

-- Get recipe ingredients for grocery list generation
CREATE OR REPLACE FUNCTION get_recipe_ingredients(p_recipe_ids uuid[])
RETURNS TABLE (
  ingredient_name text,
  total_quantity numeric,
  unit text
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    (item->>'name')::text as ingredient_name,
    SUM((item->>'quantity')::numeric) as total_quantity,
    (item->>'unit')::text as unit
  FROM recipes r,
    jsonb_array_elements(r.ingredients) as item
  WHERE r.id = ANY(p_recipe_ids)
  GROUP BY item->>'name', item->>'unit';
END;
$$ LANGUAGE plpgsql;

-- Get weekly nutrition summary
CREATE OR REPLACE FUNCTION get_weekly_nutrition_summary(p_user_id uuid, p_week_start date)
RETURNS TABLE (
  day_of_week integer,
  total_calories numeric,
  total_protein numeric,
  total_carbs numeric,
  total_fat numeric,
  meal_count integer
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    EXTRACT(DOW FROM m.logged_at)::integer as day_of_week,
    COALESCE(SUM(m.calories), 0) as total_calories,
    COALESCE(SUM(m.protein), 0) as total_protein,
    COALESCE(SUM(m.carbs), 0) as total_carbs,
    COALESCE(SUM(m.fat), 0) as total_fat,
    COUNT(*)::integer as meal_count
  FROM meals m
  WHERE m.user_id = p_user_id
    AND DATE(m.logged_at) >= p_week_start
    AND DATE(m.logged_at) < p_week_start + INTERVAL '7 days'
  GROUP BY EXTRACT(DOW FROM m.logged_at)
  ORDER BY day_of_week;
END;
$$ LANGUAGE plpgsql;

