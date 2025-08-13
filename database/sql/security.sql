-- Traveller RPG Database Security Policies
-- 
-- This file contains security configurations, RLS policies, and
-- access control rules for the Traveller RPG database.

-- ============================================================================
-- ROW-LEVEL SECURITY SETUP
-- ============================================================================

-- Enable RLS on sensitive tables
ALTER TABLE "users" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "campaigns" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "campaign_members" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "characters" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "characteristics" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "character_skills" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "character_equipment" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "life_events" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "sessions" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "session_notes" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "dice_rolls" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "encounters" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "combat_sessions" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "combat_actions" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "custom_content" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "house_rules" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "handouts" ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- APPLICATION ROLES
-- ============================================================================

-- Application service role (for backend API)
DROP ROLE IF EXISTS traveller_app;
CREATE ROLE traveller_app WITH LOGIN PASSWORD 'secure_app_password_change_this';

-- Read-only analytics role
DROP ROLE IF EXISTS traveller_analytics;
CREATE ROLE traveller_analytics WITH LOGIN PASSWORD 'secure_analytics_password_change_this';

-- Backup role
DROP ROLE IF EXISTS traveller_backup;
CREATE ROLE traveller_backup WITH LOGIN PASSWORD 'secure_backup_password_change_this';

-- ============================================================================
-- GRANT PERMISSIONS
-- ============================================================================

-- Grant schema usage
GRANT USAGE ON SCHEMA public TO traveller_app, traveller_analytics, traveller_backup;

-- Grant table permissions to application role
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO traveller_app;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO traveller_app;

-- Grant read-only permissions to analytics role
GRANT SELECT ON ALL TABLES IN SCHEMA public TO traveller_analytics;

-- Grant backup permissions
GRANT SELECT ON ALL TABLES IN SCHEMA public TO traveller_backup;

-- ============================================================================
-- ROW-LEVEL SECURITY POLICIES
-- ============================================================================

-- Users can only see their own profile
CREATE POLICY user_self_access ON "users"
    FOR ALL
    USING (id = current_setting('app.user_id', true));

-- Campaign access: members and gamemaster
CREATE POLICY campaign_member_access ON "campaigns"
    FOR ALL
    USING (
        id IN (
            SELECT campaign_id FROM "campaign_members" 
            WHERE user_id = current_setting('app.user_id', true)
        )
        OR gamemaster_id = current_setting('app.user_id', true)
    );

-- Campaign members: only campaign members can see other members
CREATE POLICY campaign_members_access ON "campaign_members"
    FOR ALL
    USING (
        campaign_id IN (
            SELECT campaign_id FROM "campaign_members" 
            WHERE user_id = current_setting('app.user_id', true)
        )
    );

-- Characters: only owner and campaign members can access
CREATE POLICY character_access ON "characters"
    FOR ALL
    USING (
        player_id = current_setting('app.user_id', true)
        OR campaign_id IN (
            SELECT campaign_id FROM "campaign_members" 
            WHERE user_id = current_setting('app.user_id', true)
        )
    );

-- Character-related tables follow character access
CREATE POLICY characteristics_access ON "characteristics"
    FOR ALL
    USING (
        character_id IN (
            SELECT id FROM "characters"
            WHERE player_id = current_setting('app.user_id', true)
            OR campaign_id IN (
                SELECT campaign_id FROM "campaign_members" 
                WHERE user_id = current_setting('app.user_id', true)
            )
        )
    );

CREATE POLICY character_skills_access ON "character_skills"
    FOR ALL
    USING (
        character_id IN (
            SELECT id FROM "characters"
            WHERE player_id = current_setting('app.user_id', true)
            OR campaign_id IN (
                SELECT campaign_id FROM "campaign_members" 
                WHERE user_id = current_setting('app.user_id', true)
            )
        )
    );

CREATE POLICY character_equipment_access ON "character_equipment"
    FOR ALL
    USING (
        character_id IN (
            SELECT id FROM "characters"
            WHERE player_id = current_setting('app.user_id', true)
            OR campaign_id IN (
                SELECT campaign_id FROM "campaign_members" 
                WHERE user_id = current_setting('app.user_id', true)
            )
        )
    );

CREATE POLICY life_events_access ON "life_events"
    FOR ALL
    USING (
        character_id IN (
            SELECT id FROM "characters"
            WHERE player_id = current_setting('app.user_id', true)
            OR campaign_id IN (
                SELECT campaign_id FROM "campaign_members" 
                WHERE user_id = current_setting('app.user_id', true)
            )
        )
    );

-- Sessions: campaign members only
CREATE POLICY sessions_access ON "sessions"
    FOR ALL
    USING (
        campaign_id IN (
            SELECT campaign_id FROM "campaign_members" 
            WHERE user_id = current_setting('app.user_id', true)
        )
    );

-- Session notes: session attendees and GM
CREATE POLICY session_notes_access ON "session_notes"
    FOR ALL
    USING (
        session_id IN (
            SELECT id FROM "sessions"
            WHERE campaign_id IN (
                SELECT campaign_id FROM "campaign_members" 
                WHERE user_id = current_setting('app.user_id', true)
            )
        )
    );

-- Dice rolls: campaign members can see rolls from their campaigns
CREATE POLICY dice_rolls_access ON "dice_rolls"
    FOR ALL
    USING (
        campaign_id IN (
            SELECT campaign_id FROM "campaign_members" 
            WHERE user_id = current_setting('app.user_id', true)
        )
        OR character_id IN (
            SELECT id FROM "characters"
            WHERE player_id = current_setting('app.user_id', true)
        )
    );

-- Encounters: campaign members only
CREATE POLICY encounters_access ON "encounters"
    FOR ALL
    USING (
        campaign_id IN (
            SELECT campaign_id FROM "campaign_members" 
            WHERE user_id = current_setting('app.user_id', true)
        )
    );

-- Combat sessions: campaign members only
CREATE POLICY combat_sessions_access ON "combat_sessions"
    FOR ALL
    USING (
        campaign_id IN (
            SELECT campaign_id FROM "campaign_members" 
            WHERE user_id = current_setting('app.user_id', true)
        )
    );

-- Combat actions: combat participants
CREATE POLICY combat_actions_access ON "combat_actions"
    FOR ALL
    USING (
        combat_session_id IN (
            SELECT id FROM "combat_sessions"
            WHERE campaign_id IN (
                SELECT campaign_id FROM "campaign_members" 
                WHERE user_id = current_setting('app.user_id', true)
            )
        )
    );

-- Custom content: campaign members
CREATE POLICY custom_content_access ON "custom_content"
    FOR ALL
    USING (
        campaign_id IN (
            SELECT campaign_id FROM "campaign_members" 
            WHERE user_id = current_setting('app.user_id', true)
        )
    );

-- House rules: campaign members
CREATE POLICY house_rules_access ON "house_rules"
    FOR ALL
    USING (
        campaign_id IN (
            SELECT campaign_id FROM "campaign_members" 
            WHERE user_id = current_setting('app.user_id', true)
        )
    );

-- Handouts: campaign members
CREATE POLICY handouts_access ON "handouts"
    FOR ALL
    USING (
        campaign_id IN (
            SELECT campaign_id FROM "campaign_members" 
            WHERE user_id = current_setting('app.user_id', true)
        )
    );

-- ============================================================================
-- SECURITY FUNCTIONS
-- ============================================================================

-- Function to set current user context (called by application)
CREATE OR REPLACE FUNCTION set_current_user_id(user_id TEXT)
RETURNS void AS $$
BEGIN
    PERFORM set_config('app.user_id', user_id, false);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get current user context
CREATE OR REPLACE FUNCTION get_current_user_id()
RETURNS TEXT AS $$
BEGIN
    RETURN current_setting('app.user_id', true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user is campaign member
CREATE OR REPLACE FUNCTION is_campaign_member(p_user_id TEXT, p_campaign_id TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM "campaign_members"
        WHERE user_id = p_user_id AND campaign_id = p_campaign_id
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user is campaign gamemaster
CREATE OR REPLACE FUNCTION is_campaign_gamemaster(p_user_id TEXT, p_campaign_id TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM "campaigns"
        WHERE id = p_campaign_id AND gamemaster_id = p_user_id
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- AUDIT LOGGING
-- ============================================================================

-- Create audit log table
CREATE TABLE IF NOT EXISTS audit_log (
    id SERIAL PRIMARY KEY,
    table_name TEXT NOT NULL,
    operation TEXT NOT NULL, -- INSERT, UPDATE, DELETE
    old_data JSONB,
    new_data JSONB,
    user_id TEXT,
    campaign_id TEXT,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ip_address INET,
    user_agent TEXT
);

-- Create audit trigger function
CREATE OR REPLACE FUNCTION audit_trigger()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'DELETE' THEN
        INSERT INTO audit_log (table_name, operation, old_data, user_id, campaign_id)
        VALUES (TG_TABLE_NAME, TG_OP, row_to_json(OLD), 
                current_setting('app.user_id', true),
                COALESCE(OLD.campaign_id, current_setting('app.campaign_id', true)));
        RETURN OLD;
    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO audit_log (table_name, operation, old_data, new_data, user_id, campaign_id)
        VALUES (TG_TABLE_NAME, TG_OP, row_to_json(OLD), row_to_json(NEW),
                current_setting('app.user_id', true),
                COALESCE(NEW.campaign_id, current_setting('app.campaign_id', true)));
        RETURN NEW;
    ELSIF TG_OP = 'INSERT' THEN
        INSERT INTO audit_log (table_name, operation, new_data, user_id, campaign_id)
        VALUES (TG_TABLE_NAME, TG_OP, row_to_json(NEW),
                current_setting('app.user_id', true),
                COALESCE(NEW.campaign_id, current_setting('app.campaign_id', true)));
        RETURN NEW;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Apply audit triggers to sensitive tables
DROP TRIGGER IF EXISTS audit_users ON "users";
CREATE TRIGGER audit_users AFTER INSERT OR UPDATE OR DELETE ON "users"
    FOR EACH ROW EXECUTE FUNCTION audit_trigger();

DROP TRIGGER IF EXISTS audit_campaigns ON "campaigns";
CREATE TRIGGER audit_campaigns AFTER INSERT OR UPDATE OR DELETE ON "campaigns"
    FOR EACH ROW EXECUTE FUNCTION audit_trigger();

DROP TRIGGER IF EXISTS audit_characters ON "characters";
CREATE TRIGGER audit_characters AFTER INSERT OR UPDATE OR DELETE ON "characters"
    FOR EACH ROW EXECUTE FUNCTION audit_trigger();

DROP TRIGGER IF EXISTS audit_characteristics ON "characteristics";
CREATE TRIGGER audit_characteristics AFTER INSERT OR UPDATE OR DELETE ON "characteristics"
    FOR EACH ROW EXECUTE FUNCTION audit_trigger();

-- ============================================================================
-- DATA VALIDATION CONSTRAINTS
-- ============================================================================

-- Additional check constraints for data integrity
ALTER TABLE "users" 
ADD CONSTRAINT valid_email_format 
CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');

ALTER TABLE "users"
ADD CONSTRAINT valid_subscription_tier
CHECK (subscription_tier IN ('FREE', 'STANDARD', 'PREMIUM'));

ALTER TABLE "characteristics"
ADD CONSTRAINT valid_characteristic_range
CHECK (
    strength BETWEEN 1 AND 15 AND
    dexterity BETWEEN 1 AND 15 AND
    endurance BETWEEN 1 AND 15 AND
    intelligence BETWEEN 1 AND 15 AND
    education BETWEEN 1 AND 15 AND
    social_standing BETWEEN 1 AND 15
);

ALTER TABLE "character_skills"
ADD CONSTRAINT valid_skill_level
CHECK (level BETWEEN 0 AND 15);

ALTER TABLE "planets"
ADD CONSTRAINT valid_uwp_format
CHECK (uwp ~* '^[A-EX][0-9A-F]{6}-[0-9A-F]+$');

-- ============================================================================
-- PERFORMANCE MONITORING
-- ============================================================================

-- Create performance monitoring view
CREATE OR REPLACE VIEW slow_queries AS
SELECT 
    query,
    calls,
    total_time,
    mean_time,
    rows,
    100.0 * shared_blks_hit / nullif(shared_blks_hit + shared_blks_read, 0) AS hit_percent
FROM pg_stat_statements
WHERE mean_time > 100 -- Queries taking more than 100ms on average
ORDER BY mean_time DESC;

-- Create index usage monitoring view
CREATE OR REPLACE VIEW index_usage AS
SELECT 
    schemaname,
    tablename,
    indexname,
    idx_tup_read,
    idx_tup_fetch,
    idx_blks_read,
    idx_blks_hit
FROM pg_stat_user_indexes
ORDER BY idx_tup_read DESC;

-- Create table size monitoring view
CREATE OR REPLACE VIEW table_sizes AS
SELECT 
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- ============================================================================
-- SECURITY NOTES
-- ============================================================================

-- IMPORTANT: Change all default passwords before production deployment
-- IMPORTANT: Set up SSL/TLS connections in production
-- IMPORTANT: Enable connection logging and monitoring
-- IMPORTANT: Regularly rotate passwords and review access
-- IMPORTANT: Use AWS Secrets Manager for credential management in production
-- IMPORTANT: Set up database parameter groups with security best practices
-- IMPORTANT: Enable VPC flow logs and CloudTrail for RDS

COMMENT ON TABLE audit_log IS 'Comprehensive audit trail for all database changes';
COMMENT ON FUNCTION set_current_user_id IS 'Sets user context for row-level security - call before each request';
COMMENT ON VIEW slow_queries IS 'Monitor slow queries for performance optimization';
COMMENT ON VIEW index_usage IS 'Monitor index usage patterns';
COMMENT ON VIEW table_sizes IS 'Monitor table growth patterns';