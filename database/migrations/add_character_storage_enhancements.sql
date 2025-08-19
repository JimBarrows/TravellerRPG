-- Migration: Add Character Storage Enhancements
-- Description: Adds character draft storage, enhanced character fields, and status tracking
-- Date: 2025-01-09

-- Add character status enum
CREATE TYPE character_status AS ENUM (
    'DRAFT',
    'COMPLETE', 
    'ACTIVE',
    'RETIRED',
    'DECEASED'
);

-- Add new columns to characters table
ALTER TABLE characters 
ADD COLUMN status character_status DEFAULT 'DRAFT',
ADD COLUMN background_data JSONB,
ADD COLUMN career_data JSONB,
ADD COLUMN avatar_seed VARCHAR(255);

-- Add index for character status
CREATE INDEX idx_characters_status ON characters(status);

-- Create character_drafts table
CREATE TABLE character_drafts (
    id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    draft_name VARCHAR(255),
    step INTEGER DEFAULT 0,
    character_data JSONB NOT NULL,
    is_auto_save BOOLEAN DEFAULT false,
    character_id VARCHAR(36) REFERENCES characters(id) ON DELETE CASCADE,
    player_id VARCHAR(36) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    campaign_id VARCHAR(36) NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for character_drafts
CREATE INDEX idx_character_drafts_player_id ON character_drafts(player_id);
CREATE INDEX idx_character_drafts_campaign_id ON character_drafts(campaign_id);
CREATE INDEX idx_character_drafts_character_id ON character_drafts(character_id);
CREATE INDEX idx_character_drafts_is_auto_save ON character_drafts(is_auto_save);
CREATE INDEX idx_character_drafts_updated_at ON character_drafts(updated_at);

-- Add trigger to update updated_at timestamp on character_drafts
CREATE OR REPLACE FUNCTION update_character_drafts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_character_drafts_updated_at
    BEFORE UPDATE ON character_drafts
    FOR EACH ROW
    EXECUTE FUNCTION update_character_drafts_updated_at();

-- Add function to cleanup old auto-save drafts
CREATE OR REPLACE FUNCTION cleanup_old_auto_save_drafts()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    -- Delete auto-save drafts older than 30 days
    DELETE FROM character_drafts 
    WHERE is_auto_save = true 
    AND updated_at < NOW() - INTERVAL '30 days';
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Create a function to get user's latest draft for a campaign
CREATE OR REPLACE FUNCTION get_latest_character_draft(
    p_player_id VARCHAR(36),
    p_campaign_id VARCHAR(36)
)
RETURNS TABLE (
    id VARCHAR(36),
    draft_name VARCHAR(255),
    step INTEGER,
    character_data JSONB,
    is_auto_save BOOLEAN,
    character_id VARCHAR(36),
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        cd.id,
        cd.draft_name,
        cd.step,
        cd.character_data,
        cd.is_auto_save,
        cd.character_id,
        cd.created_at,
        cd.updated_at
    FROM character_drafts cd
    WHERE cd.player_id = p_player_id 
    AND cd.campaign_id = p_campaign_id
    ORDER BY cd.updated_at DESC
    LIMIT 1;
END;
$$ LANGUAGE plpgsql;

-- Add validation constraints
ALTER TABLE character_drafts 
ADD CONSTRAINT check_step_range CHECK (step >= 0 AND step <= 10),
ADD CONSTRAINT check_character_data_not_empty CHECK (character_data IS NOT NULL AND character_data != '{}'::jsonb);

-- Add comment documentation
COMMENT ON TABLE character_drafts IS 'Stores character creation drafts and auto-saves';
COMMENT ON COLUMN character_drafts.draft_name IS 'Optional name for the draft';
COMMENT ON COLUMN character_drafts.step IS 'Current step in character creation process (0-7)';
COMMENT ON COLUMN character_drafts.character_data IS 'Complete character data as JSON';
COMMENT ON COLUMN character_drafts.is_auto_save IS 'True if this is an auto-save, false for manual saves';
COMMENT ON COLUMN character_drafts.character_id IS 'Reference to character if draft is for existing character';

COMMENT ON COLUMN characters.status IS 'Current status of the character in creation/gameplay lifecycle';
COMMENT ON COLUMN characters.background_data IS 'JSON storage for background information, UWP data, etc.';
COMMENT ON COLUMN characters.career_data IS 'JSON storage for career progression, terms served, etc.';
COMMENT ON COLUMN characters.avatar_seed IS 'Seed for generated character avatars';

-- Create policy for row-level security (if RLS is enabled)
-- Note: Uncomment these if row-level security is enabled on the tables

-- ALTER TABLE character_drafts ENABLE ROW LEVEL SECURITY;

-- CREATE POLICY character_drafts_user_policy ON character_drafts
--     FOR ALL TO authenticated
--     USING (player_id = auth.uid());

-- Grant permissions (adjust based on your user roles)
-- GRANT SELECT, INSERT, UPDATE, DELETE ON character_drafts TO authenticated;
-- GRANT USAGE ON SEQUENCE character_drafts_id_seq TO authenticated;

-- Create indexes for better performance on common queries
CREATE INDEX idx_character_drafts_campaign_player ON character_drafts(campaign_id, player_id);
CREATE INDEX idx_character_drafts_auto_save_updated ON character_drafts(is_auto_save, updated_at) WHERE is_auto_save = true;

-- Sample query patterns that will benefit from these indexes:

-- 1. Get all drafts for a user in a campaign:
-- SELECT * FROM character_drafts WHERE campaign_id = ? AND player_id = ? ORDER BY updated_at DESC;

-- 2. Get latest auto-save for cleanup:
-- SELECT * FROM character_drafts WHERE is_auto_save = true AND updated_at < NOW() - INTERVAL '30 days';

-- 3. Get character by status:
-- SELECT * FROM characters WHERE campaign_id = ? AND status = 'ACTIVE';

-- End of migration