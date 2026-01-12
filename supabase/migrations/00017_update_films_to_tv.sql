-- =====================================================
-- UPDATE FILMS ASPECT NAME TO TV
-- Updates the display name from "Film & Series" to "TV"
-- =====================================================

-- Update the life_aspects table to change the name from "Film & Series" to "TV"
UPDATE life_aspects 
SET name = 'TV'
WHERE id = 'films';

