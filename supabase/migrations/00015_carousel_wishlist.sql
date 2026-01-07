-- =====================================================
-- CAROUSEL & WISHLIST MANAGEMENT
-- Adds fields for managing which apps show in carousel
-- and wishlist for "coming soon" apps
-- =====================================================

-- Add carousel and wishlist fields to user_preferences
ALTER TABLE user_preferences 
  ADD COLUMN IF NOT EXISTS carousel_apps text[] DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS wishlist_apps text[] DEFAULT NULL;

-- Add comment to explain the fields
COMMENT ON COLUMN user_preferences.carousel_apps IS 'Apps shown in home carousel (min 5, max 10). NULL means show all installed_apps.';
COMMENT ON COLUMN user_preferences.wishlist_apps IS 'Coming soon apps user wants to be notified about when released.';

-- Update existing users to have default carousel apps from their priorities
UPDATE user_preferences
SET carousel_apps = COALESCE(
  aspect_priorities,
  ARRAY['training', 'food', 'finance', 'business', 'friends']::text[]
)
WHERE carousel_apps IS NULL
  AND onboarding_completed = true;

