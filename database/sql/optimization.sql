-- Traveller RPG Database Performance Optimization
-- 
-- This file contains performance optimizations, indexes, and
-- database tuning for the Traveller RPG database.

-- ============================================================================
-- PERFORMANCE INDEXES
-- ============================================================================

-- User table indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_email ON "users"(email);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_cognito_user_id ON "users"(cognito_user_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_subscription_tier ON "users"(subscription_tier);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_created_at ON "users"(created_at);

-- Campaign table indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_campaigns_gamemaster_id ON "campaigns"(gamemaster_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_campaigns_is_public ON "campaigns"(is_public);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_campaigns_created_at ON "campaigns"(created_at);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_campaigns_name_gin ON "campaigns" USING GIN(to_tsvector('english', name));

-- Campaign members table indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_campaign_members_user_id ON "campaign_members"(user_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_campaign_members_campaign_id ON "campaign_members"(campaign_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_campaign_members_role ON "campaign_members"(role);

-- Character table indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_characters_player_id ON "characters"(player_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_characters_campaign_id ON "characters"(campaign_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_characters_name_gin ON "characters" USING GIN(to_tsvector('english', name));
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_characters_species ON "characters"(species);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_characters_homeworld ON "characters"(homeworld);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_characters_age ON "characters"(age);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_characters_created_at ON "characters"(created_at);

-- Characteristics table indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_characteristics_character_id ON "characteristics"(character_id);

-- Character skills table indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_character_skills_character_id ON "character_skills"(character_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_character_skills_name ON "character_skills"(name);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_character_skills_level ON "character_skills"(level);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_character_skills_specialization ON "character_skills"(specialization);

-- Character equipment table indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_character_equipment_character_id ON "character_equipment"(character_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_character_equipment_category ON "character_equipment"(category);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_character_equipment_equipped ON "character_equipment"(equipped);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_character_equipment_name_gin ON "character_equipment" USING GIN(to_tsvector('english', name));

-- Star system table indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_star_systems_campaign_id ON "star_systems"(campaign_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_star_systems_hex_location ON "star_systems"(hex_location);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_star_systems_sector ON "star_systems"(sector);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_star_systems_subsector ON "star_systems"(subsector);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_star_systems_allegiance ON "star_systems"(allegiance);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_star_systems_name_gin ON "star_systems" USING GIN(to_tsvector('english', name));

-- Planet table indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_planets_star_system_id ON "planets"(star_system_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_planets_uwp ON "planets"(uwp);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_planets_starport ON "planets"(starport);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_planets_size ON "planets"(size);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_planets_atmosphere ON "planets"(atmosphere);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_planets_population ON "planets"(population);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_planets_tech_level ON "planets"(tech_level);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_planets_trade_codes_gin ON "planets" USING GIN(trade_codes);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_planets_name_gin ON "planets" USING GIN(to_tsvector('english', name));

-- Starship table indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_starships_campaign_id ON "starships"(campaign_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_starships_owner_id ON "starships"(owner_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_starships_current_location ON "starships"(current_location);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_starships_ship_class ON "starships"(ship_class);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_starships_name_gin ON "starships" USING GIN(to_tsvector('english', name));

-- Session table indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_sessions_campaign_id ON "sessions"(campaign_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_sessions_date ON "sessions"(date);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_sessions_gamemaster_id ON "sessions"(gamemaster_id);

-- Dice roll table indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_dice_rolls_character_id ON "dice_rolls"(character_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_dice_rolls_campaign_id ON "dice_rolls"(campaign_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_dice_rolls_session_id ON "dice_rolls"(session_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_dice_rolls_timestamp ON "dice_rolls"(timestamp);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_dice_rolls_dice_notation ON "dice_rolls"(dice_notation);

-- Trade goods table indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_trade_goods_category ON "trade_goods"(category);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_trade_goods_availability ON "trade_goods"(availability);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_trade_goods_base_price ON "trade_goods"(base_price);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_trade_goods_name_gin ON "trade_goods" USING GIN(to_tsvector('english', name));

-- Trade route table indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_trade_routes_origin_system_id ON "trade_routes"(origin_system_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_trade_routes_destination_system_id ON "trade_routes"(destination_system_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_trade_routes_campaign_id ON "trade_routes"(campaign_id);

-- Encounter table indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_encounters_campaign_id ON "encounters"(campaign_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_encounters_session_id ON "encounters"(session_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_encounters_encounter_type ON "encounters"(encounter_type);

-- Combat session table indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_combat_sessions_campaign_id ON "combat_sessions"(campaign_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_combat_sessions_encounter_id ON "combat_sessions"(encounter_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_combat_sessions_start_time ON "combat_sessions"(start_time);

-- Combat action table indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_combat_actions_combat_session_id ON "combat_actions"(combat_session_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_combat_actions_character_id ON "combat_actions"(character_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_combat_actions_round_number ON "combat_actions"(round_number);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_combat_actions_initiative ON "combat_actions"(initiative);

-- Life event table indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_life_events_character_id ON "life_events"(character_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_life_events_age ON "life_events"(age);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_life_events_event_type ON "life_events"(event_type);

-- Custom content table indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_custom_content_campaign_id ON "custom_content"(campaign_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_custom_content_content_type ON "custom_content"(content_type);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_custom_content_name_gin ON "custom_content" USING GIN(to_tsvector('english', name));

-- House rule table indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_house_rules_campaign_id ON "house_rules"(campaign_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_house_rules_rule_category ON "house_rules"(rule_category);

-- Handout table indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_handouts_campaign_id ON "handouts"(campaign_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_handouts_session_id ON "handouts"(session_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_handouts_is_public ON "handouts"(is_public);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_handouts_title_gin ON "handouts" USING GIN(to_tsvector('english', title));

-- Session note table indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_session_notes_session_id ON "session_notes"(session_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_session_notes_author_id ON "session_notes"(author_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_session_notes_is_public ON "session_notes"(is_public);

-- Audit log table indexes (for performance monitoring)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_audit_log_table_name ON audit_log(table_name);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_audit_log_user_id ON audit_log(user_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_audit_log_campaign_id ON audit_log(campaign_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_audit_log_timestamp ON audit_log(timestamp);

-- ============================================================================
-- COMPOSITE INDEXES FOR COMMON QUERIES
-- ============================================================================

-- Campaign member lookups (user + campaign)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_campaign_members_user_campaign ON "campaign_members"(user_id, campaign_id);

-- Character lookups (player + campaign)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_characters_player_campaign ON "characters"(player_id, campaign_id);

-- Skill lookups (character + skill name)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_character_skills_char_name ON "character_skills"(character_id, name);

-- Equipment lookups (character + category)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_character_equipment_char_category ON "character_equipment"(character_id, category);

-- System coordinate lookups
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_star_systems_campaign_hex ON "star_systems"(campaign_id, hex_location);

-- Planet lookups by system
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_planets_system_name ON "planets"(star_system_id, name);

-- Trade route lookups
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_trade_routes_origin_dest ON "trade_routes"(origin_system_id, destination_system_id);

-- Session date ranges
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_sessions_campaign_date ON "sessions"(campaign_id, date);

-- Combat round lookups
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_combat_actions_session_round ON "combat_actions"(combat_session_id, round_number);

-- Dice roll lookups by session
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_dice_rolls_session_timestamp ON "dice_rolls"(session_id, timestamp);

-- ============================================================================
-- PARTIAL INDEXES FOR FILTERED QUERIES
-- ============================================================================

-- Active campaigns only
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_campaigns_active ON "campaigns"(gamemaster_id) 
WHERE is_active = true;

-- Public campaigns only
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_campaigns_public ON "campaigns"(name, created_at) 
WHERE is_public = true;

-- Equipped items only
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_character_equipment_equipped ON "character_equipment"(character_id, category) 
WHERE equipped = true;

-- Living characters only (not retired/dead)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_characters_active ON "characters"(campaign_id, name) 
WHERE status = 'ACTIVE';

-- High-level skills only (for quick talent identification)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_character_skills_high_level ON "character_skills"(character_id, name) 
WHERE level >= 3;

-- Recent sessions (last 6 months)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_sessions_recent ON "sessions"(campaign_id, date) 
WHERE date > (CURRENT_DATE - INTERVAL '6 months');

-- Starports A and B only (for major port queries)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_planets_major_ports ON "planets"(star_system_id, starport, population) 
WHERE starport IN ('A', 'B');

-- High-tech worlds only
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_planets_high_tech ON "planets"(star_system_id, tech_level) 
WHERE tech_level >= 12;

-- ============================================================================
-- MATERIALIZED VIEWS FOR COMPLEX QUERIES
-- ============================================================================

-- Campaign statistics materialized view
CREATE MATERIALIZED VIEW IF NOT EXISTS campaign_stats AS
SELECT 
    c.id as campaign_id,
    c.name as campaign_name,
    COUNT(DISTINCT cm.user_id) as member_count,
    COUNT(DISTINCT ch.id) as character_count,
    COUNT(DISTINCT s.id) as session_count,
    MAX(s.date) as last_session_date,
    c.created_at,
    c.is_public,
    c.is_active
FROM "campaigns" c
LEFT JOIN "campaign_members" cm ON c.id = cm.campaign_id
LEFT JOIN "characters" ch ON c.id = ch.campaign_id
LEFT JOIN "sessions" s ON c.id = s.campaign_id
GROUP BY c.id, c.name, c.created_at, c.is_public, c.is_active;

CREATE UNIQUE INDEX idx_campaign_stats_id ON campaign_stats(campaign_id);

-- Character summary materialized view
CREATE MATERIALIZED VIEW IF NOT EXISTS character_summary AS
SELECT 
    ch.id as character_id,
    ch.name,
    ch.campaign_id,
    ch.player_id,
    ch.species,
    ch.homeworld,
    ch.age,
    ch.credits,
    char.strength,
    char.dexterity,
    char.endurance,
    char.intelligence,
    char.education,
    char.social_standing,
    COUNT(DISTINCT cs.id) as skill_count,
    COUNT(DISTINCT ce.id) as equipment_count,
    MAX(cs.level) as highest_skill_level,
    ch.created_at,
    ch.updated_at
FROM "characters" ch
LEFT JOIN "characteristics" char ON ch.id = char.character_id
LEFT JOIN "character_skills" cs ON ch.id = cs.character_id
LEFT JOIN "character_equipment" ce ON ch.id = ce.character_id
GROUP BY ch.id, ch.name, ch.campaign_id, ch.player_id, ch.species, ch.homeworld, 
         ch.age, ch.credits, char.strength, char.dexterity, char.endurance,
         char.intelligence, char.education, char.social_standing, ch.created_at, ch.updated_at;

CREATE UNIQUE INDEX idx_character_summary_id ON character_summary(character_id);
CREATE INDEX idx_character_summary_campaign ON character_summary(campaign_id);
CREATE INDEX idx_character_summary_player ON character_summary(player_id);

-- System summary materialized view
CREATE MATERIALIZED VIEW IF NOT EXISTS system_summary AS
SELECT 
    ss.id as system_id,
    ss.name as system_name,
    ss.campaign_id,
    ss.hex_location,
    ss.sector,
    ss.subsector,
    ss.allegiance,
    COUNT(DISTINCT p.id) as planet_count,
    COUNT(DISTINCT p.id) FILTER (WHERE p.starport IN ('A', 'B')) as major_port_count,
    MAX(p.tech_level) as max_tech_level,
    MAX(p.population) as max_population,
    array_agg(DISTINCT unnest(p.trade_codes)) as all_trade_codes
FROM "star_systems" ss
LEFT JOIN "planets" p ON ss.id = p.star_system_id
GROUP BY ss.id, ss.name, ss.campaign_id, ss.hex_location, ss.sector, ss.subsector, ss.allegiance;

CREATE UNIQUE INDEX idx_system_summary_id ON system_summary(system_id);
CREATE INDEX idx_system_summary_campaign ON system_summary(campaign_id);
CREATE INDEX idx_system_summary_hex ON system_summary(hex_location);

-- ============================================================================
-- REFRESH FUNCTIONS FOR MATERIALIZED VIEWS
-- ============================================================================

-- Function to refresh all materialized views
CREATE OR REPLACE FUNCTION refresh_all_materialized_views()
RETURNS void AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY campaign_stats;
    REFRESH MATERIALIZED VIEW CONCURRENTLY character_summary;
    REFRESH MATERIALIZED VIEW CONCURRENTLY system_summary;
END;
$$ LANGUAGE plpgsql;

-- Function to refresh views incrementally (for large databases)
CREATE OR REPLACE FUNCTION refresh_materialized_views_incremental()
RETURNS void AS $$
BEGIN
    -- Only refresh if significant changes have occurred
    IF (SELECT COUNT(*) FROM audit_log WHERE timestamp > (CURRENT_TIMESTAMP - INTERVAL '1 hour')) > 100 THEN
        PERFORM refresh_all_materialized_views();
    END IF;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- DATABASE MAINTENANCE FUNCTIONS
-- ============================================================================

-- Function to analyze table statistics
CREATE OR REPLACE FUNCTION update_table_statistics()
RETURNS void AS $$
DECLARE
    table_record RECORD;
BEGIN
    FOR table_record IN 
        SELECT tablename FROM pg_tables WHERE schemaname = 'public'
    LOOP
        EXECUTE 'ANALYZE ' || quote_ident(table_record.tablename);
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Function to reindex all tables
CREATE OR REPLACE FUNCTION reindex_all_tables()
RETURNS void AS $$
DECLARE
    table_record RECORD;
BEGIN
    FOR table_record IN 
        SELECT tablename FROM pg_tables WHERE schemaname = 'public'
    LOOP
        EXECUTE 'REINDEX TABLE ' || quote_ident(table_record.tablename);
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Function to vacuum and analyze all tables
CREATE OR REPLACE FUNCTION vacuum_analyze_all()
RETURNS void AS $$
DECLARE
    table_record RECORD;
BEGIN
    FOR table_record IN 
        SELECT tablename FROM pg_tables WHERE schemaname = 'public'
    LOOP
        EXECUTE 'VACUUM ANALYZE ' || quote_ident(table_record.tablename);
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- PERFORMANCE MONITORING QUERIES
-- ============================================================================

-- Query to find unused indexes
CREATE OR REPLACE VIEW unused_indexes AS
SELECT 
    schemaname,
    tablename,
    indexname,
    idx_tup_read,
    idx_tup_fetch
FROM pg_stat_user_indexes
WHERE idx_tup_read = 0 AND idx_tup_fetch = 0
ORDER BY schemaname, tablename, indexname;

-- Query to find tables needing indexes
CREATE OR REPLACE VIEW tables_needing_indexes AS
SELECT 
    schemaname,
    tablename,
    seq_tup_read,
    idx_tup_fetch,
    seq_tup_read / GREATEST(idx_tup_fetch, 1) as seq_to_idx_ratio
FROM pg_stat_user_tables
WHERE seq_tup_read > 1000 AND seq_tup_read > idx_tup_fetch * 2
ORDER BY seq_to_idx_ratio DESC;

-- Query to monitor index usage efficiency
CREATE OR REPLACE VIEW index_efficiency AS
SELECT 
    schemaname,
    tablename,
    indexname,
    idx_tup_read,
    idx_tup_fetch,
    CASE 
        WHEN idx_tup_read = 0 THEN 0
        ELSE ROUND(100.0 * idx_tup_fetch / idx_tup_read, 2)
    END as efficiency_percent
FROM pg_stat_user_indexes
WHERE idx_tup_read > 0
ORDER BY efficiency_percent DESC;

-- ============================================================================
-- COMMENTS FOR DOCUMENTATION
-- ============================================================================

COMMENT ON MATERIALIZED VIEW campaign_stats IS 'Aggregated statistics for each campaign - refresh hourly';
COMMENT ON MATERIALIZED VIEW character_summary IS 'Denormalized character data for fast lookups - refresh after character changes';
COMMENT ON MATERIALIZED VIEW system_summary IS 'Star system overview data - refresh after world changes';

COMMENT ON FUNCTION refresh_all_materialized_views IS 'Refresh all materialized views - run during maintenance windows';
COMMENT ON FUNCTION update_table_statistics IS 'Update PostgreSQL table statistics for query optimization';
COMMENT ON FUNCTION vacuum_analyze_all IS 'Full maintenance routine - vacuum and analyze all tables';

COMMENT ON VIEW unused_indexes IS 'Monitor for indexes that may be candidates for removal';
COMMENT ON VIEW tables_needing_indexes IS 'Monitor for tables with high sequential scan ratios';
COMMENT ON VIEW index_efficiency IS 'Monitor index fetch vs read efficiency';