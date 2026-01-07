-- =====================================================
-- TRAVEL ENHANCEMENTS MIGRATION
-- Adds bucket list and visited places tables
-- =====================================================

-- Bucket List Destinations
CREATE TABLE bucket_list (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  destination text NOT NULL,
  country text,
  emoji text DEFAULT '🌍',
  reason text,
  priority text DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Visited Places (for world map)
CREATE TABLE visited_places (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  country text NOT NULL,
  city text,
  year integer NOT NULL CHECK (year >= 1900 AND year <= 2100),
  emoji text DEFAULT '🌍',
  coordinates_x numeric NOT NULL CHECK (coordinates_x >= 0 AND coordinates_x <= 100),
  coordinates_y numeric NOT NULL CHECK (coordinates_y >= 0 AND coordinates_y <= 100),
  notes text,
  photos text[], -- Array of photo URLs
  rating integer CHECK (rating >= 1 AND rating <= 5),
  visited_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add current_saved field to trips for fund tracking
ALTER TABLE trips ADD COLUMN IF NOT EXISTS current_saved numeric DEFAULT 0;

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

CREATE INDEX idx_bucket_list_user ON bucket_list(user_id);
CREATE INDEX idx_bucket_list_priority ON bucket_list(priority);
CREATE INDEX idx_visited_places_user ON visited_places(user_id);
CREATE INDEX idx_visited_places_year ON visited_places(year);
CREATE INDEX idx_trips_user_status ON trips(user_id, status);

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS
ALTER TABLE bucket_list ENABLE ROW LEVEL SECURITY;
ALTER TABLE visited_places ENABLE ROW LEVEL SECURITY;

-- Bucket List Policies
CREATE POLICY "Users can view their own bucket list"
  ON bucket_list FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own bucket list items"
  ON bucket_list FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own bucket list items"
  ON bucket_list FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own bucket list items"
  ON bucket_list FOR DELETE
  USING (auth.uid() = user_id);

-- Visited Places Policies
CREATE POLICY "Users can view their own visited places"
  ON visited_places FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own visited places"
  ON visited_places FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own visited places"
  ON visited_places FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own visited places"
  ON visited_places FOR DELETE
  USING (auth.uid() = user_id);

-- =====================================================
-- UPDATED_AT TRIGGERS
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_bucket_list_updated_at
  BEFORE UPDATE ON bucket_list
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_visited_places_updated_at
  BEFORE UPDATE ON visited_places
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- SAMPLE DATA (Optional - for development)
-- =====================================================

-- Note: This sample data will only insert if you have a user
-- You can remove this section or modify it as needed

-- Uncomment below to insert sample data for the first user
/*
DO $$
DECLARE
  first_user_id uuid;
BEGIN
  -- Get the first user (you may want to change this)
  SELECT id INTO first_user_id FROM auth.users LIMIT 1;
  
  IF first_user_id IS NOT NULL THEN
    -- Insert sample bucket list items
    INSERT INTO bucket_list (user_id, destination, country, emoji, reason, priority) VALUES
      (first_user_id, 'Iceland', 'Iceland', '🇮🇸', 'Northern Lights', 'high'),
      (first_user_id, 'New Zealand', 'New Zealand', '🇳🇿', 'Adventure sports', 'medium'),
      (first_user_id, 'Maldives', 'Maldives', '🇲🇻', 'Beach relaxation', 'high'),
      (first_user_id, 'Peru', 'Peru', '🇵🇪', 'Machu Picchu', 'high');
    
    -- Insert sample visited places
    INSERT INTO visited_places (user_id, country, city, year, emoji, coordinates_x, coordinates_y, notes, rating) VALUES
      (first_user_id, 'France', 'Paris', 2024, '🇫🇷', 48, 32, 'Amazing art and culture', 5),
      (first_user_id, 'Indonesia', 'Bali', 2023, '🇮🇩', 80, 54, 'Beautiful beaches and temples', 5),
      (first_user_id, 'USA', 'New York', 2023, '🇺🇸', 22, 30, 'The city that never sleeps', 4),
      (first_user_id, 'United Kingdom', 'London', 2022, '🇬🇧', 47, 28, 'History and modern culture blend', 4),
      (first_user_id, 'Spain', 'Barcelona', 2022, '🇪🇸', 48, 36, 'Gaudi architecture is stunning', 5),
      (first_user_id, 'Thailand', 'Bangkok', 2021, '🇹🇭', 76, 46, 'Incredible food and temples', 5);
  END IF;
END $$;
*/

