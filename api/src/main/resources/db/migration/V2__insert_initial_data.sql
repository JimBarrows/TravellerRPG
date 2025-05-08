-- Insert statements for data created by factory classes

-- Insert sectors
INSERT INTO sectors (name, coordinates, description) VALUES
('Spinward Marches', '1120', 'A frontier sector of the Third Imperium, bordering the Zhodani Consulate and other interstellar powers. Known for its strategic importance and frequent border conflicts.'),
('Solomani Rim', '1827', 'The birthplace of humanity and the heart of the Solomani Confederation. Contains Terra (Earth) and many of the oldest human colonies.'),
('Zhodani Core', '-320', 'The heart of the Zhodani Consulate, containing the Zhodani homeworld and the central institutions of their psionic society.');

-- Insert subsectors
-- Regina subsector (Spinward Marches)
INSERT INTO subsectors (name, sector_position, description, sector_id) VALUES
('Regina', 'A', 'A key subsector in the Spinward Marches, containing the sector capital Regina.', (SELECT id FROM sectors WHERE name = 'Spinward Marches'));

-- Sword Worlds subsector (Spinward Marches)
INSERT INTO subsectors (name, sector_position, description, sector_id) VALUES
('Sword Worlds', 'J', 'Home of the fiercely independent Sword Worlds Confederation, known for their martial culture and Norse-inspired traditions.', (SELECT id FROM sectors WHERE name = 'Spinward Marches'));

-- Jewell subsector (Spinward Marches)
INSERT INTO subsectors (name, sector_position, sector_id) VALUES
('Jewell', 'B', (SELECT id FROM sectors WHERE name = 'Spinward Marches'));

-- Terra subsector (Solomani Rim)
INSERT INTO subsectors (name, sector_position, sector_id) VALUES
('Terra', 'F', (SELECT id FROM sectors WHERE name = 'Solomani Rim'));

-- Alpha Centauri subsector (Solomani Rim)
INSERT INTO subsectors (name, sector_position, sector_id) VALUES
('Alpha Centauri', 'G', (SELECT id FROM sectors WHERE name = 'Solomani Rim'));

-- Cronor subsector (Zhodani Core)
INSERT INTO subsectors (name, sector_position, description, sector_id) VALUES
('Cronor', 'Q', 'A core subsector of the Zhodani Consulate, known for its psionic institutions and rigid social hierarchy.', (SELECT id FROM sectors WHERE name = 'Zhodani Core'));

-- Zhdant subsector (Zhodani Core)
INSERT INTO subsectors (name, sector_position, sector_id) VALUES
('Zhdant', 'P', (SELECT id FROM sectors WHERE name = 'Zhodani Core'));

-- Insert worlds
-- Regina subsector worlds
INSERT INTO worlds (name, uwp, type, travel_zone, starport_class, size, atmosphere, hydrographics, population, government, law_level, tech_level, hex_coordinates, subsector_id) VALUES
('Regina', 'A867A74-B', 'GARDEN', 'GREEN', 'A', 8, 6, 7, 10, 7, 4, 11, '1910', (SELECT id FROM subsectors WHERE name = 'Regina')),
('Efate', 'A646930-D', 'GARDEN', 'GREEN', 'A', 6, 4, 6, 9, 3, 0, 13, '1705', (SELECT id FROM subsectors WHERE name = 'Regina')),
('Yori', 'C560768-6', 'DESERT', 'GREEN', 'C', 5, 6, 0, 7, 6, 8, 6, '1803', (SELECT id FROM subsectors WHERE name = 'Regina')),
('Forboldn', 'C551000-7', 'VACUUM', 'AMBER', 'C', 5, 5, 1, 0, 0, 0, 7, '1902', (SELECT id FROM subsectors WHERE name = 'Regina'));

-- Sword Worlds subsector worlds
INSERT INTO worlds (name, uwp, type, travel_zone, starport_class, size, atmosphere, hydrographics, population, government, law_level, tech_level, hex_coordinates, gas_giants, cultural_details, subsector_id) VALUES
('Gram', 'A867A74-B', 'GARDEN', 'GREEN', 'A', 8, 6, 7, 10, 7, 4, 11, '0711', 2, 'The political and cultural center of the Sword Worlds Confederation. Strong martial tradition with Norse-inspired culture.', (SELECT id FROM subsectors WHERE name = 'Sword Worlds')),
('Sacnoth', 'B765979-8', 'GARDEN', 'GREEN', 'B', 7, 6, 5, 9, 7, 9, 8, '0812', 1, NULL, (SELECT id FROM subsectors WHERE name = 'Sword Worlds')),
('Durendal', 'A5548B7-9', 'GARDEN', 'GREEN', 'A', 5, 5, 4, 8, 11, 7, 9, '0912', NULL, NULL, (SELECT id FROM subsectors WHERE name = 'Sword Worlds'));

-- Jewell subsector worlds
INSERT INTO worlds (name, uwp, type, travel_zone, starport_class, size, atmosphere, hydrographics, population, government, law_level, tech_level, hex_coordinates, gas_giants, cultural_details, subsector_id) VALUES
('Jewell', 'A777999-C', 'GARDEN', 'GREEN', 'A', 7, 7, 7, 9, 9, 9, 12, '1106', 1, 'A wealthy Imperial world with significant naval presence.', (SELECT id FROM subsectors WHERE name = 'Jewell'));

-- Terra subsector worlds
INSERT INTO worlds (name, uwp, type, travel_zone, starport_class, size, atmosphere, hydrographics, population, government, law_level, tech_level, gas_giants, system_position, satellites, cultural_details, hex_coordinates, subsector_id) VALUES
('Terra', 'A7A78A9-F', 'GARDEN', 'GREEN', 'A', 7, 10, 7, 8, 10, 9, 15, 1, 3, 1, 'Birthplace of humanity, with diverse cultures and a long history of technological development.', '1827', (SELECT id FROM subsectors WHERE name = 'Terra'));

-- Alpha Centauri subsector worlds
INSERT INTO worlds (name, uwp, type, travel_zone, starport_class, size, atmosphere, hydrographics, population, government, law_level, tech_level, hex_coordinates, gas_giants, cultural_details, subsector_id) VALUES
('Prometheus', 'A867956-D', 'GARDEN', 'GREEN', 'A', 8, 6, 7, 9, 5, 6, 13, '1927', 2, 'One of the first extrasolar colonies of humanity, with a proud tradition of independence.', (SELECT id FROM subsectors WHERE name = 'Alpha Centauri'));

-- Cronor subsector worlds
INSERT INTO worlds (name, uwp, type, travel_zone, starport_class, size, atmosphere, hydrographics, population, government, law_level, tech_level, hex_coordinates, gas_giants, cultural_details, subsector_id) VALUES
('Cronor', 'A889977-E', 'GARDEN', 'GREEN', 'A', 8, 8, 9, 9, 7, 7, 14, '2416', 2, 'Major administrative center of the Zhodani Consulate, with strong psionic traditions and a rigid class structure.', (SELECT id FROM subsectors WHERE name = 'Cronor')),
('Atsa', 'B567756-A', 'GARDEN', 'GREEN', 'B', 5, 6, 7, 7, 5, 6, 10, '2516', 1, NULL, (SELECT id FROM subsectors WHERE name = 'Cronor')),
('Zamine', 'A6A0532-B', 'ASTEROID', 'GREEN', 'A', 6, 10, 0, 5, 3, 2, 11, '2617', NULL, NULL, (SELECT id FROM subsectors WHERE name = 'Cronor'));

-- Zhdant subsector worlds
INSERT INTO worlds (name, uwp, type, travel_zone, starport_class, size, atmosphere, hydrographics, population, government, law_level, tech_level, hex_coordinates, gas_giants, cultural_details, subsector_id) VALUES
('Zhodane', 'A9A7A87-F', 'GARDEN', 'GREEN', 'A', 9, 10, 7, 10, 8, 7, 15, '2318', 1, 'The homeworld of the Zhodani and capital of the Zhodani Consulate. Known for its advanced psionic institutions and rigid three-tiered social structure.', (SELECT id FROM subsectors WHERE name = 'Zhdant'));

-- Insert world trade codes
INSERT INTO world_trade_codes (world_id, trade_code) VALUES
((SELECT id FROM worlds WHERE name = 'Regina'), 'Hi'),
((SELECT id FROM worlds WHERE name = 'Regina'), 'Cp'),
((SELECT id FROM worlds WHERE name = 'Efate'), 'Hi'),
((SELECT id FROM worlds WHERE name = 'Efate'), 'Cp'),
((SELECT id FROM worlds WHERE name = 'Yori'), 'De'),
((SELECT id FROM worlds WHERE name = 'Forboldn'), 'Ba'),
((SELECT id FROM worlds WHERE name = 'Forboldn'), 'Va'),
((SELECT id FROM worlds WHERE name = 'Gram'), 'Hi'),
((SELECT id FROM worlds WHERE name = 'Gram'), 'Cp'),
((SELECT id FROM worlds WHERE name = 'Sacnoth'), 'Hi'),
((SELECT id FROM worlds WHERE name = 'Durendal'), 'Ag'),
((SELECT id FROM worlds WHERE name = 'Jewell'), 'Hi'),
((SELECT id FROM worlds WHERE name = 'Jewell'), 'Ri'),
((SELECT id FROM worlds WHERE name = 'Jewell'), 'Cp'),
((SELECT id FROM worlds WHERE name = 'Terra'), 'Ag'),
((SELECT id FROM worlds WHERE name = 'Terra'), 'Ri'),
((SELECT id FROM worlds WHERE name = 'Terra'), 'Hi'),
((SELECT id FROM worlds WHERE name = 'Terra'), 'Cp'),
((SELECT id FROM worlds WHERE name = 'Prometheus'), 'Hi'),
((SELECT id FROM worlds WHERE name = 'Prometheus'), 'Ri'),
((SELECT id FROM worlds WHERE name = 'Cronor'), 'Hi'),
((SELECT id FROM worlds WHERE name = 'Cronor'), 'Cp'),
((SELECT id FROM worlds WHERE name = 'Atsa'), 'Ag'),
((SELECT id FROM worlds WHERE name = 'Zamine'), 'As'),
((SELECT id FROM worlds WHERE name = 'Zamine'), 'Ni'),
((SELECT id FROM worlds WHERE name = 'Zhodane'), 'Hi'),
((SELECT id FROM worlds WHERE name = 'Zhodane'), 'Ri'),
((SELECT id FROM worlds WHERE name = 'Zhodane'), 'Cp');

-- Insert world bases
INSERT INTO world_bases (world_id, base) VALUES
((SELECT id FROM worlds WHERE name = 'Jewell'), 'Naval Base'),
((SELECT id FROM worlds WHERE name = 'Jewell'), 'Scout Base'),
((SELECT id FROM worlds WHERE name = 'Terra'), 'Naval Base'),
((SELECT id FROM worlds WHERE name = 'Terra'), 'Scout Base'),
((SELECT id FROM worlds WHERE name = 'Zhodane'), 'Naval Base'),
((SELECT id FROM worlds WHERE name = 'Zhodane'), 'Psionic Institute');

-- Insert world points of interest
INSERT INTO world_points_of_interest (world_id, point_of_interest) VALUES
((SELECT id FROM worlds WHERE name = 'Jewell'), 'Jewell Starport'),
((SELECT id FROM worlds WHERE name = 'Jewell'), 'Imperial Naval Academy'),
((SELECT id FROM worlds WHERE name = 'Terra'), 'United Nations Headquarters'),
((SELECT id FROM worlds WHERE name = 'Terra'), 'Ancient historical sites'),
((SELECT id FROM worlds WHERE name = 'Zhodane'), 'Consular Palace'),
((SELECT id FROM worlds WHERE name = 'Zhodane'), 'Grand Psionic Academy');

-- Insert animals
INSERT INTO animals (name, type, description, weight, habitat, movement_speed, armor_rating, strength, dexterity, endurance, intelligence, cost, tech_level, domesticated, trainable) VALUES
('Dog', 'DOMESTIC', 'A loyal canine companion', 25.0, 'Domestic environments, human settlements', 12, 0, 5, 8, 6, 4, 200, 1, true, true),
('Horse', 'MOUNT', 'A common riding and draft animal', 500.0, 'Plains, grasslands, human settlements', 24, 0, 12, 8, 10, 3, 1000, 1, true, true),
('Cow', 'LIVESTOCK', 'A common source of meat, milk, and leather', 700.0, 'Farms, grasslands', 8, 0, 10, 4, 8, 2, 500, 1, true, false),
('Wolf', 'WILD_CARNIVORE', 'A pack-hunting predator', 50.0, 'Forests, mountains, plains', 15, 0, 7, 9, 8, 4, 0, 0, false, true),
('Deer', 'WILD_HERBIVORE', 'A swift forest-dwelling herbivore', 150.0, 'Forests, woodlands', 20, 0, 6, 10, 7, 3, 0, 0, false, false),
('Bear', 'DANGEROUS', 'A large, powerful omnivorous predator', 400.0, 'Forests, mountains', 12, 1, 14, 6, 12, 3, 0, 0, false, false),
('Gcarth', 'EXOTIC', 'A six-legged reptilian mount native to high-gravity worlds', 800.0, 'Rocky terrain, mountains on high-gravity worlds', 18, 3, 16, 7, 14, 3, 5000, 9, true, true);

-- Insert animal attacks
INSERT INTO animal_attacks (animal_id, attack) VALUES
((SELECT id FROM animals WHERE name = 'Dog'), 'Bite: 1D-3 damage'),
((SELECT id FROM animals WHERE name = 'Horse'), 'Kick: 2D damage'),
((SELECT id FROM animals WHERE name = 'Cow'), 'Gore: 1D damage'),
((SELECT id FROM animals WHERE name = 'Wolf'), 'Bite: 2D-2 damage'),
((SELECT id FROM animals WHERE name = 'Deer'), 'Antlers: 1D damage (males only)'),
((SELECT id FROM animals WHERE name = 'Bear'), 'Claws: 3D damage'),
((SELECT id FROM animals WHERE name = 'Bear'), 'Bite: 2D damage'),
((SELECT id FROM animals WHERE name = 'Gcarth'), 'Tail Swipe: 2D damage');

-- Insert animal special traits
INSERT INTO animal_special_traits (animal_id, trait) VALUES
((SELECT id FROM animals WHERE name = 'Dog'), 'Keen Sense of Smell'),
((SELECT id FROM animals WHERE name = 'Dog'), 'Loyal Companion'),
((SELECT id FROM animals WHERE name = 'Horse'), 'Fast Runner'),
((SELECT id FROM animals WHERE name = 'Horse'), 'Beast of Burden'),
((SELECT id FROM animals WHERE name = 'Cow'), 'Food Source'),
((SELECT id FROM animals WHERE name = 'Wolf'), 'Pack Hunter'),
((SELECT id FROM animals WHERE name = 'Wolf'), 'Keen Senses'),
((SELECT id FROM animals WHERE name = 'Deer'), 'Fast Runner'),
((SELECT id FROM animals WHERE name = 'Deer'), 'Skittish'),
((SELECT id FROM animals WHERE name = 'Bear'), 'Powerful'),
((SELECT id FROM animals WHERE name = 'Bear'), 'Territorial'),
((SELECT id FROM animals WHERE name = 'Gcarth'), 'High-G Adapted'),
((SELECT id FROM animals WHERE name = 'Gcarth'), 'Sure-footed'),
((SELECT id FROM animals WHERE name = 'Gcarth'), 'Heat Resistant');

-- Insert equipment
INSERT INTO equipment (name, type, description, tech_level, cost, weight, required_skill, skill_bonus, power_requirements, maintenance_requirements, durability, condition) VALUES
('Comms Unit', 'COMMUNICATION', 'A portable communication device with a range of about 10km', 8, 250, 0.5, 'Electronics', 0, 'Battery (1 week duration)', 'Annual check-up', 10, 100),
('Medkit', 'MEDICAL', 'A comprehensive medical kit for field treatment', 7, 1000, 3.0, 'Medic', 1, NULL, 'Replace consumables after use', 10, 100),
('Environment Suit', 'SURVIVAL', 'A suit designed to protect against hostile environments', 9, 5000, 10.0, 'Zero-G', 0, 'Battery (12 hour duration)', 'Monthly check-up', 15, 100),
('Computer Terminal', 'COMPUTERS', 'A portable computing device with advanced capabilities', 10, 2000, 1.5, 'Computer', 1, 'Battery (24 hour duration)', 'Software updates', 10, 100),
('Toolkit', 'TOOLS', 'A comprehensive set of tools for mechanical and electronic repairs', 7, 500, 5.0, 'Mechanic', 1, NULL, 'Replace worn tools', 10, 100),
('Binoculars', 'OPTICS', 'High-powered optical magnification device', 5, 100, 1.0, NULL, 0, 'Battery (1 month duration)', NULL, 10, 100),
('Survival Kit', 'SURVIVAL', 'Essential supplies for wilderness survival', 4, 200, 2.0, 'Survival', 1, NULL, 'Replace consumables after use', 10, 100),
('Portable Power Generator', 'POWER', 'A compact generator for field power needs', 8, 1500, 15.0, 'Engineer', 0, NULL, 'Refuel as needed, maintenance every 100 hours', 20, 100);

-- Insert equipment features
INSERT INTO equipment_features (equipment_id, feature) VALUES
((SELECT id FROM equipment WHERE name = 'Comms Unit'), '10km Range'),
((SELECT id FROM equipment WHERE name = 'Comms Unit'), 'Encrypted Channels'),
((SELECT id FROM equipment WHERE name = 'Comms Unit'), 'Emergency Beacon'),
((SELECT id FROM equipment WHERE name = 'Medkit'), 'Trauma Treatment'),
((SELECT id FROM equipment WHERE name = 'Medkit'), 'Disease Diagnosis'),
((SELECT id FROM equipment WHERE name = 'Medkit'), 'Basic Surgery'),
((SELECT id FROM equipment WHERE name = 'Environment Suit'), 'Radiation Protection'),
((SELECT id FROM equipment WHERE name = 'Environment Suit'), 'Temperature Regulation'),
((SELECT id FROM equipment WHERE name = 'Environment Suit'), 'Oxygen Supply (6 hours)'),
((SELECT id FROM equipment WHERE name = 'Computer Terminal'), 'Data Analysis'),
((SELECT id FROM equipment WHERE name = 'Computer Terminal'), 'Network Access'),
((SELECT id FROM equipment WHERE name = 'Computer Terminal'), 'Programming Interface'),
((SELECT id FROM equipment WHERE name = 'Toolkit'), 'Mechanical Tools'),
((SELECT id FROM equipment WHERE name = 'Toolkit'), 'Electronic Tools'),
((SELECT id FROM equipment WHERE name = 'Toolkit'), 'Diagnostic Equipment'),
((SELECT id FROM equipment WHERE name = 'Binoculars'), '10x Magnification'),
((SELECT id FROM equipment WHERE name = 'Binoculars'), 'Night Vision'),
((SELECT id FROM equipment WHERE name = 'Binoculars'), 'Range Finder'),
((SELECT id FROM equipment WHERE name = 'Survival Kit'), 'Water Purification'),
((SELECT id FROM equipment WHERE name = 'Survival Kit'), 'Fire Starting'),
((SELECT id FROM equipment WHERE name = 'Survival Kit'), 'Emergency Shelter'),
((SELECT id FROM equipment WHERE name = 'Survival Kit'), 'First Aid Supplies'),
((SELECT id FROM equipment WHERE name = 'Portable Power Generator'), '1kW Output'),
((SELECT id FROM equipment WHERE name = 'Portable Power Generator'), 'Fuel Efficient'),
((SELECT id FROM equipment WHERE name = 'Portable Power Generator'), 'Multiple Outlets');

-- Insert vehicles
INSERT INTO vehicles (name, type, description, tech_level, cost, weight, required_skill, crew_required, passenger_capacity, cargo_capacity, max_speed, cruising_speed, range, armor_rating, hull_points, max_hull_points, fuel_type, fuel_consumption, maintenance_requirements, condition) VALUES
('Ground Car', 'GROUND_CAR', 'A standard wheeled vehicle for planetary travel', 5, 6000, 1.5, 'Drive', 1, 3, 0.2, 120, 80, 400, 2, 15, 15, 'Chemical', '10 liters per 100 km', 'Monthly check-up', 100),
('Air/Raft', 'AIR_RAFT', 'Anti-gravity vehicle for short-range aerial transport', 8, 50000, 0.5, 'Flyer', 1, 3, 0.1, 400, 150, 1000, 4, 12, 12, 'Power Cells', '1 power cell per 10 hours', 'Quarterly maintenance', 100),
('Grav Vehicle', 'GRAV_VEHICLE', 'Advanced anti-gravity vehicle for high-speed travel', 9, 120000, 2.0, 'Flyer', 1, 5, 0.5, 800, 400, 2000, 6, 20, 20, 'Power Cells', '1 power cell per 5 hours', 'Monthly maintenance', 100),
('Ground Truck', 'GROUND_TRUCK', 'Heavy wheeled vehicle for cargo transport', 5, 15000, 5.0, 'Drive', 1, 2, 10.0, 90, 60, 600, 3, 25, 25, 'Chemical', '20 liters per 100 km', 'Monthly check-up', 100),
('ATV', 'GROUND_MILITARY', 'Armored tactical vehicle for military operations', 7, 80000, 8.0, 'Drive', 2, 6, 1.0, 110, 70, 800, 12, 40, 40, 'Chemical', '25 liters per 100 km', 'Weekly maintenance', 100),
('Motorboat', 'WATERCRAFT_SMALL', 'Small motorized boat for water travel', 5, 8000, 0.8, 'Seafarer', 1, 4, 0.3, 60, 40, 200, 1, 10, 10, 'Chemical', '15 liters per hour', 'Seasonal maintenance', 100),
('Light Aircraft', 'AIRCRAFT', 'Small winged aircraft for atmospheric flight', 6, 100000, 1.5, 'Flyer', 1, 3, 0.2, 300, 200, 1500, 2, 15, 15, 'Aviation Fuel', '30 liters per hour', 'Pre-flight check, 50-hour maintenance', 100),
('Hovercraft', 'HOVER_VEHICLE', 'Vehicle that hovers above the surface on a cushion of air', 7, 40000, 2.0, 'Flyer', 1, 6, 1.0, 150, 100, 500, 3, 18, 18, 'Chemical', '20 liters per hour', 'Monthly maintenance', 100);

-- Insert vehicle features
INSERT INTO vehicle_features (vehicle_id, feature) VALUES
((SELECT id FROM vehicles WHERE name = 'Ground Car'), 'Basic Navigation'),
((SELECT id FROM vehicles WHERE name = 'Ground Car'), 'Climate Control'),
((SELECT id FROM vehicles WHERE name = 'Air/Raft'), 'Anti-Gravity'),
((SELECT id FROM vehicles WHERE name = 'Air/Raft'), 'Enclosed Cabin'),
((SELECT id FROM vehicles WHERE name = 'Air/Raft'), 'Navigation System'),
((SELECT id FROM vehicles WHERE name = 'Grav Vehicle'), 'Advanced Anti-Gravity'),
((SELECT id FROM vehicles WHERE name = 'Grav Vehicle'), 'Luxury Interior'),
((SELECT id FROM vehicles WHERE name = 'Grav Vehicle'), 'Advanced Navigation'),
((SELECT id FROM vehicles WHERE name = 'Grav Vehicle'), 'Autopilot'),
((SELECT id FROM vehicles WHERE name = 'Ground Truck'), 'Cargo Space'),
((SELECT id FROM vehicles WHERE name = 'Ground Truck'), 'Rugged Suspension'),
((SELECT id FROM vehicles WHERE name = 'ATV'), 'Heavy Armor'),
((SELECT id FROM vehicles WHERE name = 'ATV'), 'All-Terrain Capability'),
((SELECT id FROM vehicles WHERE name = 'ATV'), 'Military Comms'),
((SELECT id FROM vehicles WHERE name = 'Motorboat'), 'Waterproof Storage'),
((SELECT id FROM vehicles WHERE name = 'Motorboat'), 'Navigation Lights'),
((SELECT id FROM vehicles WHERE name = 'Light Aircraft'), 'Flight Instruments'),
((SELECT id FROM vehicles WHERE name = 'Light Aircraft'), 'Radio Communications'),
((SELECT id FROM vehicles WHERE name = 'Hovercraft'), 'Amphibious'),
((SELECT id FROM vehicles WHERE name = 'Hovercraft'), 'All-Terrain Capability');

-- Insert vehicle weapons
INSERT INTO vehicle_weapons (vehicle_id, weapon) VALUES
((SELECT id FROM vehicles WHERE name = 'ATV'), 'Heavy Machine Gun');

-- Insert spaceships
INSERT INTO spaceships (name, type, description, tech_level, cost_mcr, displacement_tons, required_skill, crew_required, passenger_capacity, cargo_capacity, jump_drive_rating, maneuver_drive_rating, power_plant_rating, armor_rating, hull_points, max_hull_points, structure_points, max_structure_points, fuel_capacity, has_fuel_scoop, fuel_consumption_per_jump, maintenance_requirements, annual_maintenance_cost, condition) VALUES
('Scout/Courier', 'SCOUT', 'A small, fast ship designed for exploration, reconnaissance, and courier duties', 9, 37.0, 100, 'Pilot', 1, 2, 3.0, 2, 2, 2, 4, 100, 100, 20, 20, 22.0, true, 20.0, 'Monthly maintenance', 0.37, 100),
('Free Trader', 'TRADER', 'A common merchant vessel designed for cargo transport between worlds', 9, 37.0, 200, 'Pilot', 4, 6, 82.0, 1, 1, 2, 2, 200, 200, 40, 40, 40.0, true, 20.0, 'Monthly maintenance', 0.37, 100),
('Far Trader', 'TRADER', 'An improved merchant vessel with better jump capability', 10, 45.0, 200, 'Pilot', 5, 10, 64.0, 2, 1, 2, 2, 200, 200, 40, 40, 50.0, true, 20.0, 'Monthly maintenance', 0.45, 100),
('Yacht', 'YACHT', 'A luxury vessel for private owners, often with high-quality accommodations', 10, 40.0, 100, 'Pilot', 3, 6, 2.0, 2, 2, 3, 3, 100, 100, 20, 20, 30.0, true, 20.0, 'Monthly maintenance', 0.4, 100),
('Patrol Cruiser', 'PATROL_SHIP', 'A military vessel used for system security and patrol duties', 12, 80.0, 400, 'Pilot', 10, 6, 10.0, 3, 3, 3, 8, 400, 400, 80, 80, 120.0, true, 40.0, 'Weekly maintenance', 0.8, 100),
('Subsidized Merchant', 'FREIGHTER', 'A government-subsidized merchant vessel for frontier trade routes', 9, 59.0, 400, 'Pilot', 9, 9, 168.0, 1, 1, 1, 2, 400, 400, 80, 80, 82.0, true, 40.0, 'Monthly maintenance', 0.59, 100);

-- Insert spaceship features
INSERT INTO spaceship_features (spaceship_id, feature) VALUES
((SELECT id FROM spaceships WHERE name = 'Scout/Courier'), 'Advanced Sensors'),
((SELECT id FROM spaceships WHERE name = 'Scout/Courier'), 'Laboratory'),
((SELECT id FROM spaceships WHERE name = 'Scout/Courier'), 'Computer/1'),
((SELECT id FROM spaceships WHERE name = 'Free Trader'), 'Cargo Handling Equipment'),
((SELECT id FROM spaceships WHERE name = 'Free Trader'), 'Computer/1'),
((SELECT id FROM spaceships WHERE name = 'Far Trader'), 'Cargo Handling Equipment'),
((SELECT id FROM spaceships WHERE name = 'Far Trader'), 'Advanced Sensors'),
((SELECT id FROM spaceships WHERE name = 'Far Trader'), 'Computer/1'),
((SELECT id FROM spaceships WHERE name = 'Yacht'), 'Luxury Accommodations'),
((SELECT id FROM spaceships WHERE name = 'Yacht'), 'Advanced Sensors'),
((SELECT id FROM spaceships WHERE name = 'Yacht'), 'Computer/2'),
((SELECT id FROM spaceships WHERE name = 'Patrol Cruiser'), 'Advanced Sensors'),
((SELECT id FROM spaceships WHERE name = 'Patrol Cruiser'), 'Military-grade Computer/3'),
((SELECT id FROM spaceships WHERE name = 'Patrol Cruiser'), 'Armory'),
((SELECT id FROM spaceships WHERE name = 'Patrol Cruiser'), 'Brig'),
((SELECT id FROM spaceships WHERE name = 'Subsidized Merchant'), 'Cargo Handling Equipment'),
((SELECT id FROM spaceships WHERE name = 'Subsidized Merchant'), 'Computer/1');

-- Insert spaceship weapons
INSERT INTO spaceship_weapons (spaceship_id, weapon) VALUES
((SELECT id FROM spaceships WHERE name = 'Scout/Courier'), 'Pulse Laser'),
((SELECT id FROM spaceships WHERE name = 'Free Trader'), 'Double Turret (Beam Laser)'),
((SELECT id FROM spaceships WHERE name = 'Far Trader'), 'Double Turret (Beam Laser)'),
((SELECT id FROM spaceships WHERE name = 'Far Trader'), 'Double Turret (Missile Rack)'),
((SELECT id FROM spaceships WHERE name = 'Yacht'), 'Single Turret (Beam Laser)'),
((SELECT id FROM spaceships WHERE name = 'Patrol Cruiser'), 'Triple Turret (Beam Laser)'),
((SELECT id FROM spaceships WHERE name = 'Patrol Cruiser'), 'Triple Turret (Missile Rack)'),
((SELECT id FROM spaceships WHERE name = 'Patrol Cruiser'), 'Spinal Mount (Particle Beam)'),
((SELECT id FROM spaceships WHERE name = 'Subsidized Merchant'), 'Double Turret (Beam Laser)'),
((SELECT id FROM spaceships WHERE name = 'Subsidized Merchant'), 'Double Turret (Missile Rack)');

-- Insert political entities
INSERT INTO political_entities (name, type, government_type, tech_level, description, founding_date) VALUES
('Third Imperium', 'EMPIRE', 6, 15, 'The largest interstellar empire in charted space, spanning over 11,000 worlds across hundreds of subsectors. Founded by Cleon Zhunastu after the Long Night, it has endured for over a thousand years. The Imperium is characterized by a policy of non-interference in local planetary affairs as long as Imperial laws are followed and taxes paid.', '0'),
('Zhodani Consulate', 'OLIGARCHY', 10, 15, 'A major human interstellar state ruled by psionic nobles. The Zhodani society is divided into three classes: nobles (who must be psionic), intendants (administrators and managers), and proles (the common citizens). The use of psionics is integrated into all aspects of Zhodani society, unlike in the Imperium where it is often feared and restricted.', '-6000'),
('Solomani Confederation', 'CONFEDERATION', 7, 14, 'A human-supremacist interstellar state centered on Terra (Earth), the original homeworld of humanity. The Solomani Confederation broke away from the Third Imperium during the Solomani Rim War. It promotes the idea that humans from Earth (Solomani) are superior to other human subspecies and non-human races.', '871'),
('Sword Worlds Confederation', 'CONFEDERATION', 7, 11, 'A loose confederation of independent worlds with a strong martial tradition and Norse-inspired culture. The Sword Worlds are named after legendary swords from Norse and Finnish mythology. They have a history of conflict with the Imperium and the Darrians, and have been used as a buffer state between the Imperium and the Zhodani Consulate.', '73'),
('Aslan Hierate', 'HEGEMONY', 2, 13, 'A loose collection of clan holdings of the Aslan, a major non-human race resembling anthropomorphic lions. The Hierate is not a unified government but rather thousands of independent clan territories. Male Aslan are concerned with territory and honor, while females manage business and trade. Land ownership is the foundation of Aslan society.', '-2500');

-- Insert political entity characteristics
INSERT INTO political_entity_characteristics (political_entity_id, characteristic) VALUES
((SELECT id FROM political_entities WHERE name = 'Third Imperium'), 'Ruled by an Emperor/Empress'),
((SELECT id FROM political_entities WHERE name = 'Third Imperium'), 'Nobility system with hereditary titles'),
((SELECT id FROM political_entities WHERE name = 'Third Imperium'), 'Decentralized governance'),
((SELECT id FROM political_entities WHERE name = 'Third Imperium'), 'Strong military (Imperial Navy)'),
((SELECT id FROM political_entities WHERE name = 'Third Imperium'), 'Interstellar trade network'),
((SELECT id FROM political_entities WHERE name = 'Zhodani Consulate'), 'Psionic ruling class'),
((SELECT id FROM political_entities WHERE name = 'Zhodani Consulate'), 'Three-tiered social structure'),
((SELECT id FROM political_entities WHERE name = 'Zhodani Consulate'), 'Thought police'),
((SELECT id FROM political_entities WHERE name = 'Zhodani Consulate'), 'Centralized governance'),
((SELECT id FROM political_entities WHERE name = 'Zhodani Consulate'), 'Expansionist policy'),
((SELECT id FROM political_entities WHERE name = 'Solomani Confederation'), 'Human supremacist ideology'),
((SELECT id FROM political_entities WHERE name = 'Solomani Confederation'), 'Loose confederation of worlds'),
((SELECT id FROM political_entities WHERE name = 'Solomani Confederation'), 'Strong military'),
((SELECT id FROM political_entities WHERE name = 'Solomani Confederation'), 'Hostile to the Imperium'),
((SELECT id FROM political_entities WHERE name = 'Solomani Confederation'), 'Controls Terra (Earth)'),
((SELECT id FROM political_entities WHERE name = 'Sword Worlds Confederation'), 'Martial culture'),
((SELECT id FROM political_entities WHERE name = 'Sword Worlds Confederation'), 'Norse-inspired traditions'),
((SELECT id FROM political_entities WHERE name = 'Sword Worlds Confederation'), 'Independent spirit'),
((SELECT id FROM political_entities WHERE name = 'Sword Worlds Confederation'), 'Frequent internal conflicts'),
((SELECT id FROM political_entities WHERE name = 'Sword Worlds Confederation'), 'Buffer state between major powers'),
((SELECT id FROM political_entities WHERE name = 'Aslan Hierate'), 'Clan-based society'),
((SELECT id FROM political_entities WHERE name = 'Aslan Hierate'), 'Strong territorial instincts'),
((SELECT id FROM political_entities WHERE name = 'Aslan Hierate'), 'Gender-based division of roles'),
((SELECT id FROM political_entities WHERE name = 'Aslan Hierate'), 'Honor-focused culture'),
((SELECT id FROM political_entities WHERE name = 'Aslan Hierate'), 'Expansionist tendencies');
