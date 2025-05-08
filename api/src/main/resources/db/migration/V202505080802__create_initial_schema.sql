-- Create tables for all entities in the Traveller RPG system

-- Races table
CREATE TABLE races (
    id BIGSERIAL PRIMARY KEY,
    type VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description VARCHAR(2000),
    lifespan VARCHAR(255),
    appearance VARCHAR(1000)
);

-- Race characteristic modifiers table
CREATE TABLE race_characteristic_modifiers (
    race_id BIGINT NOT NULL,
    modifier INT NOT NULL,
    characteristic_type VARCHAR(255) NOT NULL,
    PRIMARY KEY (race_id, characteristic_type),
    FOREIGN KEY (race_id) REFERENCES races(id)
);

-- Race special abilities table
CREATE TABLE race_special_abilities (
    race_id BIGINT NOT NULL,
    ability VARCHAR(255) NOT NULL,
    PRIMARY KEY (race_id, ability),
    FOREIGN KEY (race_id) REFERENCES races(id)
);

-- Race typical homeworlds table
CREATE TABLE race_typical_homeworlds (
    race_id BIGINT NOT NULL,
    homeworld VARCHAR(255) NOT NULL,
    PRIMARY KEY (race_id, homeworld),
    FOREIGN KEY (race_id) REFERENCES races(id)
);

-- Characteristics table
CREATE TABLE characteristics (
    id BIGSERIAL PRIMARY KEY,
    type VARCHAR(255) NOT NULL,
    value INT NOT NULL,
    original_value INT NOT NULL
);

-- Skills table
CREATE TABLE skills (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    level INT NOT NULL,
    category VARCHAR(255) NOT NULL,
    primary_characteristic VARCHAR(255) NOT NULL
);

-- Homeworlds table
CREATE TABLE homeworlds (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    uwp VARCHAR(255) NOT NULL,
    type VARCHAR(255) NOT NULL,
    background VARCHAR(2000)
);

-- Homeworld trade codes table
CREATE TABLE homeworld_trade_codes (
    homeworld_id BIGINT NOT NULL,
    trade_code VARCHAR(255) NOT NULL,
    PRIMARY KEY (homeworld_id, trade_code),
    FOREIGN KEY (homeworld_id) REFERENCES homeworlds(id)
);

-- Homeworld common skills table
CREATE TABLE homeworld_common_skills (
    homeworld_id BIGINT NOT NULL,
    skill_id BIGINT NOT NULL,
    PRIMARY KEY (homeworld_id, skill_id),
    FOREIGN KEY (homeworld_id) REFERENCES homeworlds(id),
    FOREIGN KEY (skill_id) REFERENCES skills(id)
);

-- Careers table
CREATE TABLE careers (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description VARCHAR(2000),
    qualification_dm INT NOT NULL
);

-- Career qualification requirements table
CREATE TABLE career_qualification_requirements (
    career_id BIGINT NOT NULL,
    minimum_value INT NOT NULL,
    characteristic_type VARCHAR(255) NOT NULL,
    PRIMARY KEY (career_id, characteristic_type),
    FOREIGN KEY (career_id) REFERENCES careers(id)
);

-- Career basic training skills table
CREATE TABLE career_basic_training_skills (
    career_id BIGINT NOT NULL,
    skill_id BIGINT NOT NULL,
    PRIMARY KEY (career_id, skill_id),
    FOREIGN KEY (career_id) REFERENCES careers(id),
    FOREIGN KEY (skill_id) REFERENCES skills(id)
);

-- Skill tables for careers
CREATE TABLE skill_tables (
    id BIGSERIAL PRIMARY KEY,
    career_id BIGINT,
    dice_roll INT NOT NULL,
    FOREIGN KEY (career_id) REFERENCES careers(id)
);

-- Ranks table
CREATE TABLE ranks (
    id BIGSERIAL PRIMARY KEY,
    career_id BIGINT,
    rank_level INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    ability VARCHAR(1000),
    FOREIGN KEY (career_id) REFERENCES careers(id)
);

-- Benefit tables
CREATE TABLE benefit_tables (
    id BIGSERIAL PRIMARY KEY,
    career_id BIGINT,
    dice_roll INT NOT NULL,
    benefit VARCHAR(255) NOT NULL,
    cash_benefit BOOLEAN NOT NULL,
    FOREIGN KEY (career_id) REFERENCES careers(id)
);

-- Career terms table
CREATE TABLE career_terms (
    id BIGSERIAL PRIMARY KEY,
    career_id BIGINT NOT NULL,
    term_number INT NOT NULL,
    rank INT NOT NULL,
    commissioned BOOLEAN NOT NULL,
    advanced BOOLEAN NOT NULL,
    survived BOOLEAN NOT NULL,
    FOREIGN KEY (career_id) REFERENCES careers(id)
);

-- Career term skills table
CREATE TABLE career_term_skills (
    career_term_id BIGINT NOT NULL,
    skill_id BIGINT NOT NULL,
    PRIMARY KEY (career_term_id, skill_id),
    FOREIGN KEY (career_term_id) REFERENCES career_terms(id),
    FOREIGN KEY (skill_id) REFERENCES skills(id)
);

-- Career term benefits table
CREATE TABLE career_term_benefits (
    career_term_id BIGINT NOT NULL,
    benefit VARCHAR(255) NOT NULL,
    PRIMARY KEY (career_term_id, benefit),
    FOREIGN KEY (career_term_id) REFERENCES career_terms(id)
);

-- Weapons table
CREATE TABLE weapons (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(255) NOT NULL,
    tech_level INT NOT NULL,
    damage_formula VARCHAR(255) NOT NULL,
    range INT NOT NULL,
    automatic BOOLEAN NOT NULL,
    magazine INT NOT NULL,
    cost INT NOT NULL,
    weight DECIMAL(10,2) NOT NULL,
    skill_id BIGINT,
    FOREIGN KEY (skill_id) REFERENCES skills(id)
);

-- Armor table
CREATE TABLE armor (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    tech_level INT NOT NULL,
    protection INT NOT NULL,
    energy_protection INT NOT NULL,
    radiation_protection INT NOT NULL,
    cost INT NOT NULL,
    weight DECIMAL(10,2) NOT NULL,
    powered BOOLEAN NOT NULL,
    type VARCHAR(255) NOT NULL
);

-- Characters table
CREATE TABLE characters (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    age INT NOT NULL,
    gender VARCHAR(255),
    race_id BIGINT NOT NULL,
    homeworld_id BIGINT,
    credits INT NOT NULL,
    background VARCHAR(2000),
    status VARCHAR(255) NOT NULL,
    equipped_armor_id BIGINT,
    equipped_weapon_id BIGINT,
    FOREIGN KEY (race_id) REFERENCES races(id),
    FOREIGN KEY (homeworld_id) REFERENCES homeworlds(id),
    FOREIGN KEY (equipped_armor_id) REFERENCES armor(id),
    FOREIGN KEY (equipped_weapon_id) REFERENCES weapons(id)
);

-- Character-Characteristic relationship table
ALTER TABLE characteristics ADD COLUMN character_id BIGINT;
ALTER TABLE characteristics ADD FOREIGN KEY (character_id) REFERENCES characters(id);

-- Character-Skill relationship table
CREATE TABLE character_skills (
    character_id BIGINT NOT NULL,
    skill_id BIGINT NOT NULL,
    PRIMARY KEY (character_id, skill_id),
    FOREIGN KEY (character_id) REFERENCES characters(id),
    FOREIGN KEY (skill_id) REFERENCES skills(id)
);

-- Character-Weapon relationship table
CREATE TABLE character_weapons (
    character_id BIGINT NOT NULL,
    weapon_id BIGINT NOT NULL,
    PRIMARY KEY (character_id, weapon_id),
    FOREIGN KEY (character_id) REFERENCES characters(id),
    FOREIGN KEY (weapon_id) REFERENCES weapons(id)
);

-- Character-Armor relationship table
CREATE TABLE character_armor (
    character_id BIGINT NOT NULL,
    armor_id BIGINT NOT NULL,
    PRIMARY KEY (character_id, armor_id),
    FOREIGN KEY (character_id) REFERENCES characters(id),
    FOREIGN KEY (armor_id) REFERENCES armor(id)
);

-- Equipment table
CREATE TABLE equipment (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(255) NOT NULL,
    description VARCHAR(1000),
    tech_level INT,
    cost INT,
    weight DECIMAL(10,2),
    availability VARCHAR(255),
    requires_permit BOOLEAN,
    restricted_law_level INT,
    required_skill VARCHAR(255),
    skill_bonus INT,
    power_requirements VARCHAR(255),
    maintenance_requirements VARCHAR(255),
    durability INT,
    condition INT
);

-- Equipment features table
CREATE TABLE equipment_features (
    equipment_id BIGINT NOT NULL,
    feature VARCHAR(255) NOT NULL,
    PRIMARY KEY (equipment_id, feature),
    FOREIGN KEY (equipment_id) REFERENCES equipment(id)
);

-- Political entities table
CREATE TABLE political_entities (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(255) NOT NULL,
    description VARCHAR(2000),
    government_type INT,
    tech_level INT,
    territory_size INT,
    capital_world_id BIGINT,
    founding_date VARCHAR(255)
);

-- Subsectors table
CREATE TABLE subsectors (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    coordinates VARCHAR(255),
    sector_position VARCHAR(255),
    description VARCHAR(2000),
    sector_id BIGINT
);

-- Sectors table
CREATE TABLE sectors (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    coordinates VARCHAR(255),
    description VARCHAR(2000)
);

-- Add foreign key from subsectors to sectors
ALTER TABLE subsectors ADD FOREIGN KEY (sector_id) REFERENCES sectors(id);

-- Worlds table
CREATE TABLE worlds (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    uwp VARCHAR(255) NOT NULL,
    type VARCHAR(255) NOT NULL,
    travel_zone VARCHAR(255),
    starport_class CHAR(1),
    size INT,
    atmosphere INT,
    hydrographics INT,
    population INT,
    government INT,
    law_level INT,
    tech_level INT,
    gas_giants INT,
    system_position INT,
    satellites INT,
    cultural_details VARCHAR(1000),
    hex_coordinates VARCHAR(255),
    subsector_id BIGINT,
    political_entity_id BIGINT,
    FOREIGN KEY (subsector_id) REFERENCES subsectors(id),
    FOREIGN KEY (political_entity_id) REFERENCES political_entities(id)
);

-- Add foreign key from political entities to worlds (capital world)
ALTER TABLE political_entities ADD FOREIGN KEY (capital_world_id) REFERENCES worlds(id);

-- World trade codes table
CREATE TABLE world_trade_codes (
    world_id BIGINT NOT NULL,
    trade_code VARCHAR(255) NOT NULL,
    PRIMARY KEY (world_id, trade_code),
    FOREIGN KEY (world_id) REFERENCES worlds(id)
);

-- World bases table
CREATE TABLE world_bases (
    world_id BIGINT NOT NULL,
    base VARCHAR(255) NOT NULL,
    PRIMARY KEY (world_id, base),
    FOREIGN KEY (world_id) REFERENCES worlds(id)
);

-- World points of interest table
CREATE TABLE world_points_of_interest (
    world_id BIGINT NOT NULL,
    point_of_interest VARCHAR(500) NOT NULL,
    PRIMARY KEY (world_id, point_of_interest),
    FOREIGN KEY (world_id) REFERENCES worlds(id)
);

-- Vehicles table
CREATE TABLE vehicles (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(255) NOT NULL,
    description VARCHAR(1000),
    tech_level INT,
    cost INT,
    weight DECIMAL(10,2),
    availability VARCHAR(255),
    requires_permit BOOLEAN,
    restricted_law_level INT,
    required_skill VARCHAR(255),
    crew_required INT,
    passenger_capacity INT,
    cargo_capacity DECIMAL(10,2),
    max_speed INT,
    cruising_speed INT,
    range INT,
    armor_rating INT,
    hull_points INT,
    max_hull_points INT,
    fuel_type VARCHAR(255),
    fuel_consumption VARCHAR(255),
    maintenance_requirements VARCHAR(255),
    condition INT
);

-- Vehicle features table
CREATE TABLE vehicle_features (
    vehicle_id BIGINT NOT NULL,
    feature VARCHAR(255) NOT NULL,
    PRIMARY KEY (vehicle_id, feature),
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(id)
);

-- Vehicle weapons table
CREATE TABLE vehicle_weapons (
    vehicle_id BIGINT NOT NULL,
    weapon VARCHAR(255) NOT NULL,
    PRIMARY KEY (vehicle_id, weapon),
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(id)
);

-- Animals table
CREATE TABLE animals (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(255) NOT NULL,
    description VARCHAR(1000),
    weight DECIMAL(10,2),
    habitat VARCHAR(255),
    movement_speed INT,
    armor_rating INT,
    strength INT,
    dexterity INT,
    endurance INT,
    intelligence INT,
    cost INT,
    tech_level INT,
    domesticated BOOLEAN,
    trainable BOOLEAN
);

-- Animal attacks table
CREATE TABLE animal_attacks (
    animal_id BIGINT NOT NULL,
    attack VARCHAR(255) NOT NULL,
    PRIMARY KEY (animal_id, attack),
    FOREIGN KEY (animal_id) REFERENCES animals(id)
);

-- Animal special traits table
CREATE TABLE animal_special_traits (
    animal_id BIGINT NOT NULL,
    trait VARCHAR(255) NOT NULL,
    PRIMARY KEY (animal_id, trait),
    FOREIGN KEY (animal_id) REFERENCES animals(id)
);

-- Spaceships table
CREATE TABLE spaceships (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(255) NOT NULL,
    description VARCHAR(1000),
    tech_level INT,
    cost_mcr DECIMAL(10,2),
    displacement_tons INT,
    availability VARCHAR(255),
    requires_permit BOOLEAN,
    restricted_law_level INT,
    required_skill VARCHAR(255),
    crew_required INT,
    passenger_capacity INT,
    cargo_capacity DECIMAL(10,2),
    jump_drive_rating INT,
    maneuver_drive_rating INT,
    power_plant_rating INT,
    armor_rating INT,
    hull_points INT,
    max_hull_points INT,
    structure_points INT,
    max_structure_points INT,
    fuel_capacity DECIMAL(10,2),
    has_fuel_scoop BOOLEAN,
    fuel_consumption_per_jump DECIMAL(10,2),
    maintenance_requirements VARCHAR(255),
    annual_maintenance_cost DECIMAL(10,2),
    condition INT
);

-- Spaceship features table
CREATE TABLE spaceship_features (
    spaceship_id BIGINT NOT NULL,
    feature VARCHAR(255) NOT NULL,
    PRIMARY KEY (spaceship_id, feature),
    FOREIGN KEY (spaceship_id) REFERENCES spaceships(id)
);

-- Spaceship weapons table
CREATE TABLE spaceship_weapons (
    spaceship_id BIGINT NOT NULL,
    weapon VARCHAR(255) NOT NULL,
    PRIMARY KEY (spaceship_id, weapon),
    FOREIGN KEY (spaceship_id) REFERENCES spaceships(id)
);
