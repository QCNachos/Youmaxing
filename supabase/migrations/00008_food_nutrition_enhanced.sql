-- =====================================================
-- ENHANCED FOOD & NUTRITION TRACKING
-- AI-powered calorie/nutrient estimation, supplements, food scanning
-- =====================================================

-- =====================================================
-- ENHANCED MEALS TABLE (add nutrition columns)
-- =====================================================

ALTER TABLE meals ADD COLUMN IF NOT EXISTS protein numeric;
ALTER TABLE meals ADD COLUMN IF NOT EXISTS carbs numeric;
ALTER TABLE meals ADD COLUMN IF NOT EXISTS fat numeric;
ALTER TABLE meals ADD COLUMN IF NOT EXISTS fiber numeric;
ALTER TABLE meals ADD COLUMN IF NOT EXISTS sugar numeric;
ALTER TABLE meals ADD COLUMN IF NOT EXISTS sodium numeric;
ALTER TABLE meals ADD COLUMN IF NOT EXISTS serving_size text;
ALTER TABLE meals ADD COLUMN IF NOT EXISTS image_url text;
ALTER TABLE meals ADD COLUMN IF NOT EXISTS ai_analyzed boolean DEFAULT false;
ALTER TABLE meals ADD COLUMN IF NOT EXISTS ai_confidence numeric CHECK (ai_confidence >= 0 AND ai_confidence <= 1);
ALTER TABLE meals ADD COLUMN IF NOT EXISTS ingredients jsonb DEFAULT '[]';
ALTER TABLE meals ADD COLUMN IF NOT EXISTS source text DEFAULT 'manual' CHECK (source IN ('manual', 'voice', 'image', 'barcode', 'quick_add'));

-- =====================================================
-- MEAL ITEMS (individual foods within a meal)
-- =====================================================

CREATE TABLE IF NOT EXISTS meal_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  meal_id uuid REFERENCES meals(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  quantity numeric DEFAULT 1,
  unit text DEFAULT 'serving',
  calories integer,
  protein numeric,
  carbs numeric,
  fat numeric,
  fiber numeric,
  sugar numeric,
  sodium numeric,
  barcode text,
  image_url text,
  ai_analyzed boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- =====================================================
-- SUPPLEMENTS TRACKING
-- =====================================================

CREATE TABLE IF NOT EXISTS supplements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  brand text,
  type text NOT NULL CHECK (type IN (
    'protein', 'creatine', 'vitamin', 'mineral', 'omega', 
    'pre_workout', 'amino_acids', 'herbal', 'other'
  )),
  serving_size text,
  servings_per_container integer,
  nutrition_per_serving jsonb DEFAULT '{}',
  notes text,
  image_url text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- =====================================================
-- SUPPLEMENT LOGS (daily intake tracking)
-- =====================================================

CREATE TABLE IF NOT EXISTS supplement_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  supplement_id uuid REFERENCES supplements(id) ON DELETE CASCADE NOT NULL,
  servings numeric DEFAULT 1,
  taken_at timestamptz DEFAULT now(),
  notes text,
  created_at timestamptz DEFAULT now()
);

-- =====================================================
-- FOOD DATABASE (custom foods for quick access)
-- =====================================================

CREATE TABLE IF NOT EXISTS custom_foods (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  brand text,
  serving_size text NOT NULL,
  calories integer,
  protein numeric,
  carbs numeric,
  fat numeric,
  fiber numeric,
  sugar numeric,
  sodium numeric,
  barcode text,
  is_favorite boolean DEFAULT false,
  times_used integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- =====================================================
-- PANTRY / FRIDGE INVENTORY
-- =====================================================

CREATE TABLE IF NOT EXISTS pantry_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  category text CHECK (category IN (
    'produce', 'dairy', 'meat', 'seafood', 'grains', 'canned',
    'frozen', 'snacks', 'beverages', 'condiments', 'spices', 'other'
  )),
  quantity numeric DEFAULT 1,
  unit text,
  expiration_date date,
  location text DEFAULT 'pantry' CHECK (location IN ('pantry', 'fridge', 'freezer')),
  image_url text,
  barcode text,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- =====================================================
-- NUTRITION GOALS
-- =====================================================

CREATE TABLE IF NOT EXISTS nutrition_goals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  daily_calories integer DEFAULT 2000,
  daily_protein numeric DEFAULT 120,
  daily_carbs numeric DEFAULT 250,
  daily_fat numeric DEFAULT 65,
  daily_fiber numeric DEFAULT 30,
  daily_sugar numeric DEFAULT 50,
  daily_sodium numeric DEFAULT 2300,
  daily_water_glasses integer DEFAULT 8,
  goal_type text DEFAULT 'maintain' CHECK (goal_type IN ('lose', 'maintain', 'gain', 'performance')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- =====================================================
-- WATER TRACKING
-- =====================================================

CREATE TABLE IF NOT EXISTS water_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  amount_ml integer NOT NULL,
  logged_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- =====================================================
-- FOOD ANALYSIS LOGS (for AI improvement)
-- =====================================================

CREATE TABLE IF NOT EXISTS food_analysis_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  input_type text NOT NULL CHECK (input_type IN ('image', 'voice', 'text', 'barcode')),
  input_data text,
  image_url text,
  ai_response jsonb NOT NULL,
  confidence numeric CHECK (confidence >= 0 AND confidence <= 1),
  user_corrected boolean DEFAULT false,
  corrected_data jsonb,
  processing_time_ms integer,
  created_at timestamptz DEFAULT now()
);

-- =====================================================
-- INDEXES
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_meal_items_meal ON meal_items(meal_id);
CREATE INDEX IF NOT EXISTS idx_supplements_user ON supplements(user_id);
CREATE INDEX IF NOT EXISTS idx_supplements_type ON supplements(user_id, type);
CREATE INDEX IF NOT EXISTS idx_supplement_logs_user ON supplement_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_supplement_logs_date ON supplement_logs(user_id, taken_at);
CREATE INDEX IF NOT EXISTS idx_custom_foods_user ON custom_foods(user_id);
CREATE INDEX IF NOT EXISTS idx_custom_foods_barcode ON custom_foods(barcode);
CREATE INDEX IF NOT EXISTS idx_pantry_items_user ON pantry_items(user_id);
CREATE INDEX IF NOT EXISTS idx_pantry_items_expiry ON pantry_items(user_id, expiration_date);
CREATE INDEX IF NOT EXISTS idx_water_logs_user ON water_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_water_logs_date ON water_logs(user_id, logged_at);
CREATE INDEX IF NOT EXISTS idx_food_analysis_logs_user ON food_analysis_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_meals_source ON meals(user_id, source);

-- =====================================================
-- ROW LEVEL SECURITY
-- =====================================================

ALTER TABLE meal_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE supplements ENABLE ROW LEVEL SECURITY;
ALTER TABLE supplement_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_foods ENABLE ROW LEVEL SECURITY;
ALTER TABLE pantry_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE nutrition_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE water_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE food_analysis_logs ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- RLS POLICIES
-- =====================================================

-- Meal items (access via meal ownership)
CREATE POLICY "Users can manage meal items" ON meal_items FOR ALL 
  USING (EXISTS (SELECT 1 FROM meals WHERE meals.id = meal_items.meal_id AND meals.user_id = auth.uid()));

CREATE POLICY "Users can manage own supplements" ON supplements FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own supplement logs" ON supplement_logs FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own custom foods" ON custom_foods FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own pantry items" ON pantry_items FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own nutrition goals" ON nutrition_goals FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own water logs" ON water_logs FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own food analysis logs" ON food_analysis_logs FOR ALL USING (auth.uid() = user_id);

-- =====================================================
-- HELPER FUNCTIONS
-- =====================================================

-- Get daily nutrition totals
CREATE OR REPLACE FUNCTION get_daily_nutrition(p_user_id uuid, p_date date DEFAULT CURRENT_DATE)
RETURNS TABLE (
  total_calories numeric,
  total_protein numeric,
  total_carbs numeric,
  total_fat numeric,
  total_fiber numeric,
  total_sugar numeric,
  total_sodium numeric,
  meal_count integer,
  water_ml integer
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COALESCE(SUM(m.calories), 0) as total_calories,
    COALESCE(SUM(m.protein), 0) as total_protein,
    COALESCE(SUM(m.carbs), 0) as total_carbs,
    COALESCE(SUM(m.fat), 0) as total_fat,
    COALESCE(SUM(m.fiber), 0) as total_fiber,
    COALESCE(SUM(m.sugar), 0) as total_sugar,
    COALESCE(SUM(m.sodium), 0) as total_sodium,
    COUNT(DISTINCT m.id)::integer as meal_count,
    (SELECT COALESCE(SUM(amount_ml), 0)::integer FROM water_logs 
     WHERE user_id = p_user_id AND DATE(logged_at) = p_date) as water_ml
  FROM meals m
  WHERE m.user_id = p_user_id
    AND DATE(m.logged_at) = p_date;
END;
$$ LANGUAGE plpgsql;

-- Get supplement schedule for today
CREATE OR REPLACE FUNCTION get_todays_supplements(p_user_id uuid)
RETURNS TABLE (
  supplement_id uuid,
  supplement_name text,
  supplement_type text,
  times_taken integer,
  last_taken timestamptz
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    s.id,
    s.name,
    s.type,
    (SELECT COUNT(*)::integer FROM supplement_logs sl 
     WHERE sl.supplement_id = s.id AND DATE(sl.taken_at) = CURRENT_DATE) as times_taken,
    (SELECT MAX(sl.taken_at) FROM supplement_logs sl 
     WHERE sl.supplement_id = s.id AND DATE(sl.taken_at) = CURRENT_DATE) as last_taken
  FROM supplements s
  WHERE s.user_id = p_user_id AND s.is_active = true
  ORDER BY s.type, s.name;
END;
$$ LANGUAGE plpgsql;

-- Check expiring pantry items
CREATE OR REPLACE FUNCTION get_expiring_items(p_user_id uuid, p_days integer DEFAULT 7)
RETURNS TABLE (
  item_id uuid,
  item_name text,
  category text,
  expiration_date date,
  days_until_expiry integer
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    pi.id,
    pi.name,
    pi.category,
    pi.expiration_date,
    (pi.expiration_date - CURRENT_DATE)::integer as days_until_expiry
  FROM pantry_items pi
  WHERE pi.user_id = p_user_id
    AND pi.expiration_date IS NOT NULL
    AND pi.expiration_date <= CURRENT_DATE + p_days
  ORDER BY pi.expiration_date;
END;
$$ LANGUAGE plpgsql;




