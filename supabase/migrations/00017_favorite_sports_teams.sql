-- Migration: Add favorite sports teams table
-- This stores the user's favorite sports teams for the TV/Sports section

CREATE TABLE IF NOT EXISTS favorite_sports_teams (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  team_id text NOT NULL, -- TheSportsDB team ID
  team_name text NOT NULL,
  league text NOT NULL,
  logo_url text,
  stadium text,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, team_id)
);

-- Enable RLS
ALTER TABLE favorite_sports_teams ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own favorite teams"
  ON favorite_sports_teams FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own favorite teams"
  ON favorite_sports_teams FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own favorite teams"
  ON favorite_sports_teams FOR DELETE
  USING (auth.uid() = user_id);

-- Index for faster queries
CREATE INDEX idx_favorite_sports_teams_user_id ON favorite_sports_teams(user_id);

COMMENT ON TABLE favorite_sports_teams IS 'Stores user favorite sports teams for calendar integration';

