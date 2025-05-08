-- Fix schema issues and insert initial data

-- Fix schema issues
-- Add any missing columns to the sectors table
ALTER TABLE sectors ADD COLUMN IF NOT EXISTS description VARCHAR(2000);

-- Add any missing columns to the subsectors table
ALTER TABLE subsectors ADD COLUMN IF NOT EXISTS sector_position VARCHAR(255);
ALTER TABLE subsectors ADD COLUMN IF NOT EXISTS description VARCHAR(2000);

-- Add any missing columns to the political_entities table
ALTER TABLE political_entities ADD COLUMN IF NOT EXISTS tech_level INT;
ALTER TABLE political_entities ADD COLUMN IF NOT EXISTS founding_date VARCHAR(255);
ALTER TABLE political_entities ALTER COLUMN government_type TYPE INT USING (government_type::INT);

-- Insert sectors
INSERT INTO sectors (name, coordinates, description) VALUES
('Spinward Marches', '1120', 'A frontier sector of the Third Imperium, bordering the Zhodani Consulate and other interstellar powers. Known for its strategic importance and frequent border conflicts.'),
('Solomani Rim', '1827', 'The birthplace of humanity and the heart of the Solomani Confederation. Contains Terra (Earth) and many of the oldest human colonies.'),
('Zhodani Core', '-320', 'The heart of the Zhodani Consulate, containing the Zhodani homeworld and the central institutions of their psionic society.');
