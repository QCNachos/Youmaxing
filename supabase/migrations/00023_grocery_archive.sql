-- Grocery List Archive System
-- Archives completed shopping lists to enable AI suggestions based on purchase history

-- Archive table for completed grocery lists
CREATE TABLE IF NOT EXISTS grocery_list_archive (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  original_list_id uuid,
  name text DEFAULT 'Shopping List',
  items jsonb NOT NULL DEFAULT '[]',
  completed_at timestamptz DEFAULT now(),
  shopping_duration_minutes integer, -- time from first check to archive
  total_items integer,
  checked_items integer,
  created_at timestamptz DEFAULT now()
);

-- Indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_grocery_archive_user ON grocery_list_archive(user_id);
CREATE INDEX IF NOT EXISTS idx_grocery_archive_completed ON grocery_list_archive(user_id, completed_at DESC);

-- GIN index for querying items - enables AI to find frequently purchased items
CREATE INDEX IF NOT EXISTS idx_grocery_archive_items ON grocery_list_archive USING GIN(items);

-- Row Level Security
ALTER TABLE grocery_list_archive ENABLE ROW LEVEL SECURITY;

-- Users can only access their own archives
CREATE POLICY "Users can manage own grocery archives" ON grocery_list_archive 
  FOR ALL USING (auth.uid() = user_id);

-- Enable realtime for archive table
ALTER PUBLICATION supabase_realtime ADD TABLE grocery_list_archive;

-- Common grocery items table for quick-add suggestions
CREATE TABLE IF NOT EXISTS common_grocery_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  category text NOT NULL,
  emoji text,
  default_unit text DEFAULT 'item',
  is_default boolean DEFAULT false, -- system default items
  created_at timestamptz DEFAULT now()
);

-- Seed with default common items
INSERT INTO common_grocery_items (name, category, emoji, default_unit, is_default) VALUES
  ('Milk', 'dairy', '🥛', 'gallon', true),
  ('Bread', 'pantry', '🍞', 'loaf', true),
  ('Eggs', 'dairy', '🥚', 'dozen', true),
  ('Butter', 'dairy', '🧈', 'stick', true),
  ('Cheese', 'dairy', '🧀', 'block', true),
  ('Bananas', 'produce', '🍌', 'bunch', true),
  ('Chicken', 'meat', '🍗', 'lb', true),
  ('Rice', 'pantry', '🍚', 'lb', true),
  ('Apples', 'produce', '🍎', 'lb', true),
  ('Onions', 'produce', '🧅', 'lb', true),
  ('Garlic', 'produce', '🧄', 'head', true),
  ('Tomatoes', 'produce', '🍅', 'lb', true),
  ('Potatoes', 'produce', '🥔', 'lb', true),
  ('Pasta', 'pantry', '🍝', 'box', true),
  ('Olive Oil', 'pantry', '🫒', 'bottle', true),
  ('Coffee', 'beverages', '☕', 'bag', true),
  ('Yogurt', 'dairy', '🥛', 'container', true),
  ('Ground Beef', 'meat', '🍖', 'lb', true),
  ('Salmon', 'meat', '🐟', 'lb', true),
  ('Spinach', 'produce', '🥬', 'bag', true)
ON CONFLICT DO NOTHING;

-- Index for common items
CREATE INDEX IF NOT EXISTS idx_common_grocery_items_category ON common_grocery_items(category);

-- User's frequently purchased items (derived from archives)
-- This view helps AI make suggestions
CREATE OR REPLACE VIEW user_frequent_items AS
SELECT 
  user_id,
  item->>'name' as item_name,
  item->>'category' as category,
  COUNT(*) as purchase_count,
  MAX(completed_at) as last_purchased
FROM grocery_list_archive,
  jsonb_array_elements(items) as item
GROUP BY user_id, item->>'name', item->>'category'
ORDER BY purchase_count DESC;
