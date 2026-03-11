
-- SCHEMA FIX: Increase column lengths to TEXT
-- Run this in Supabase SQL Editor BEFORE seeding

ALTER TABLE featured_items 
  ALTER COLUMN image_url TYPE TEXT,
  ALTER COLUMN title TYPE TEXT,
  ALTER COLUMN description TYPE TEXT,
  ALTER COLUMN location TYPE TEXT,
  ALTER COLUMN price TYPE TEXT,
  ALTER COLUMN category TYPE TEXT,
  ALTER COLUMN subcategory TYPE TEXT;

ALTER TABLE story_cards 
  ALTER COLUMN image_url TYPE TEXT,
  ALTER COLUMN title TYPE TEXT,
  ALTER COLUMN content TYPE TEXT,
  ALTER COLUMN subcategory TYPE TEXT;

-- Verify types (Optional)
-- SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'featured_items';
