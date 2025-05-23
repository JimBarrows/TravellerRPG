-- Fix any schema issues that might be causing migration failures

-- Add any missing columns to the sectors table
ALTER TABLE sectors ADD COLUMN IF NOT EXISTS description VARCHAR(2000);

-- Add any missing columns to the subsectors table
ALTER TABLE subsectors ADD COLUMN IF NOT EXISTS sector_position VARCHAR(255);
ALTER TABLE subsectors ADD COLUMN IF NOT EXISTS description VARCHAR(2000);

-- Add any missing columns to the political_entities table
ALTER TABLE political_entities ADD COLUMN IF NOT EXISTS tech_level INT;
ALTER TABLE political_entities ADD COLUMN IF NOT EXISTS founding_date VARCHAR(255);
ALTER TABLE political_entities ALTER COLUMN government_type TYPE INT USING (government_type::INT);

