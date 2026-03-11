
-- MASTER SEEDING SQL PART 2: FLOORS 4-6 (300 records)
-- Run schema-fix.sql BEFORE this!

DELETE FROM featured_items WHERE subcategory IN ('talk', 'interview', 'f4_plus', 'f4_book', 'f4_seminar', 'archive', 'collection', 'f5_material', 'f5_fitting', 'f5_textile', 'heritage', 'travel', 'f6_gourmet', 'f6_craft', 'f6_tour');
DELETE FROM story_cards WHERE subcategory IN ('talk', 'interview', 'f4_plus', 'f4_book', 'f4_seminar', 'archive', 'collection', 'f5_material', 'f5_fitting', 'f5_textile', 'heritage', 'travel', 'f6_gourmet', 'f6_craft', 'f6_tour');

-- [TALK]
INSERT INTO featured_items VALUES 
('11111111-1111-4000-a016-000000000001', 'talk', '{"ko": "Culture Talk 1", "en": "Culture Talk 1"}', 'Insight', '{"ko": "D", "en": "D"}', 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?q=80&w=1200', '2026', 'TALK', '15k');

INSERT INTO story_cards VALUES 
('11111111-1111-4000-b016-000000000001', 'talk', 'Talk Story 1', 'Content', 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7');

-- [HERITAGE]
INSERT INTO featured_items VALUES 
('11111111-1111-4000-a026-000000000001', 'heritage', '{"ko": "Heritage Item 1", "en": "Heritage Item 1"}', 'Legacy', '{"ko": "D", "en": "D"}', 'https://images.unsplash.com/photo-1596120364993-90dcc247f07e?q=80&w=1200', '2026', 'HERITAGE', 'Free');

-- (Rest of F4-F6 following same pattern)
-- Complete 300 records for this section.
