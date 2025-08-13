/**
 * Database Seed Functions
 * 
 * Provides functions to seed the database with initial data for development
 * and testing, including canonical Traveller universe data.
 */

import { db } from './client';
import { generateUWP, determineTradeClassifications } from './utilities';

// ============================================================================
// SEED DATA CONSTANTS
// ============================================================================

const CANONICAL_SYSTEMS = [
  {
    name: 'Regina',
    hexLocation: '1910',
    sector: 'Spinward Marches',
    subsector: 'Regina',
    allegiance: 'Imperial',
    starType: 'M0 V',
    gasGiants: 2,
    planets: [
      {
        name: 'Regina',
        size: 7,
        atmosphere: 6,
        hydrographics: 6,
        population: 8,
        government: 6,
        lawLevel: 5,
        techLevel: 12,
        starport: 'A',
        bases: ['Naval', 'Scout'],
        description: 'Capital of the Regina subsector, major naval base and commercial hub.'
      }
    ]
  },
  {
    name: 'Jewell',
    hexLocation: '1106',
    sector: 'Spinward Marches',
    subsector: 'Jewell',
    allegiance: 'Imperial',
    starType: 'F5 V',
    gasGiants: 1,
    planets: [
      {
        name: 'Jewell',
        size: 6,
        atmosphere: 4,
        hydrographics: 3,
        population: 8,
        government: 6,
        lawLevel: 6,
        techLevel: 12,
        starport: 'A',
        bases: ['Naval', 'Scout'],
        description: 'Major military installation guarding the Jewell cluster.'
      }
    ]
  },
  {
    name: 'Rhylanor',
    hexLocation: '2716',
    sector: 'Spinward Marches',
    subsector: 'Rhylanor',
    allegiance: 'Imperial',
    starType: 'G8 V',
    gasGiants: 3,
    planets: [
      {
        name: 'Rhylanor',
        size: 8,
        atmosphere: 4,
        hydrographics: 7,
        population: 9,
        government: 6,
        lawLevel: 3,
        techLevel: 13,
        starport: 'A',
        bases: ['Naval'],
        description: 'High-population industrial world and subsector capital.'
      }
    ]
  }
];

const SAMPLE_TRADE_GOODS = [
  { name: 'Basic Electronics', category: 'Electronics', basePrice: 20000, availability: 'Common', dtm: 0 },
  { name: 'Advanced Electronics', category: 'Electronics', basePrice: 100000, availability: 'Uncommon', dtm: -2 },
  { name: 'Computer/1', category: 'Electronics', basePrice: 5000, availability: 'Common', dtm: 1 },
  { name: 'Computer/2', category: 'Electronics', basePrice: 30000, availability: 'Uncommon', dtm: -1 },
  { name: 'Computer/3', category: 'Electronics', basePrice: 200000, availability: 'Rare', dtm: -3 },
  
  { name: 'Textiles', category: 'Textiles', basePrice: 3000, availability: 'Common', dtm: 2 },
  { name: 'Luxury Textiles', category: 'Textiles', basePrice: 50000, availability: 'Uncommon', dtm: -2 },
  
  { name: 'Basic Raw Materials', category: 'Raw Materials', basePrice: 4000, availability: 'Common', dtm: 1 },
  { name: 'Rare Metals', category: 'Raw Materials', basePrice: 50000, availability: 'Rare', dtm: -4 },
  { name: 'Radioactives', category: 'Raw Materials', basePrice: 1000000, availability: 'Very Rare', dtm: -6 },
  
  { name: 'Common Food', category: 'Food', basePrice: 6000, availability: 'Common', dtm: 2 },
  { name: 'Luxury Food', category: 'Food', basePrice: 20000, availability: 'Uncommon', dtm: -1 },
  { name: 'Spices', category: 'Food', basePrice: 6000, availability: 'Uncommon', dtm: 0 },
  
  { name: 'Basic Medical Supplies', category: 'Medical', basePrice: 50000, availability: 'Common', dtm: 0 },
  { name: 'Advanced Medical Supplies', category: 'Medical', basePrice: 200000, availability: 'Uncommon', dtm: -2 },
  { name: 'Anagathics', category: 'Medical', basePrice: 400000, availability: 'Very Rare', dtm: -8 },
  
  { name: 'Basic Manufactured Goods', category: 'Manufactured', basePrice: 20000, availability: 'Common', dtm: 1 },
  { name: 'Luxury Manufactured Goods', category: 'Manufactured', basePrice: 200000, availability: 'Uncommon', dtm: -2 },
  
  { name: 'Basic Vehicles', category: 'Vehicles', basePrice: 15000, availability: 'Common', dtm: 0 },
  { name: 'Advanced Vehicles', category: 'Vehicles', basePrice: 80000, availability: 'Uncommon', dtm: -2 },
  { name: 'Grav Vehicles', category: 'Vehicles', basePrice: 200000, availability: 'Rare', dtm: -4 }
];

// ============================================================================
// SEED FUNCTIONS
// ============================================================================

/**
 * Seed canonical star systems and planets
 */
export async function seedCanonicalSystems(): Promise<void> {
  console.log('Seeding canonical star systems...');
  
  for (const systemData of CANONICAL_SYSTEMS) {
    const { planets, ...systemInfo } = systemData;
    
    // Create star system
    const system = await db.starSystem.upsert({
      where: {
        campaignId_hexLocation: {
          campaignId: null as any,
          hexLocation: systemData.hexLocation
        }
      },
      update: systemInfo,
      create: {
        ...systemInfo,
        campaignId: null // Canonical systems are not campaign-specific
      }
    });
    
    // Create planets
    for (const planetData of planets) {
      const uwp = generateUWP({
        starport: planetData.starport as any,
        size: planetData.size,
        atmosphere: planetData.atmosphere,
        hydrographics: planetData.hydrographics,
        population: planetData.population,
        government: planetData.government,
        lawLevel: planetData.lawLevel,
        techLevel: planetData.techLevel
      });
      
      const tradeCodes = determineTradeClassifications({
        starport: planetData.starport as any,
        size: planetData.size,
        atmosphere: planetData.atmosphere,
        hydrographics: planetData.hydrographics,
        population: planetData.population,
        government: planetData.government,
        lawLevel: planetData.lawLevel,
        techLevel: planetData.techLevel
      });
      
      const planetId = `${system.id}_planet_${planetData.name.toLowerCase().replace(/\\s+/g, '_')}`;
      await db.planet.upsert({
        where: {
          id: planetId
        },
        update: {
          ...planetData,
          uwp,
          tradeCodes,
          gasGiant: false
        },
        create: {
          id: planetId,
          ...planetData,
          uwp,
          tradeCodes,
          gasGiant: false,
          starSystemId: system.id
        }
      });
    }
  }
  
  console.log(`Seeded ${CANONICAL_SYSTEMS.length} canonical star systems.`);
}

/**
 * Seed trade goods data
 */
export async function seedTradeGoods(): Promise<void> {
  console.log('Seeding trade goods...');
  
  for (const goodData of SAMPLE_TRADE_GOODS) {
    await db.tradeGood.upsert({
      where: {
        id: goodData.name.toLowerCase().replace(/[^a-z0-9]/g, '_')
      },
      update: goodData,
      create: {
        id: goodData.name.toLowerCase().replace(/[^a-z0-9]/g, '_'),
        ...goodData
      }
    });
  }
  
  console.log(`Seeded ${SAMPLE_TRADE_GOODS.length} trade goods.`);
}

/**
 * Create test users for development
 */
export async function seedTestUsers(): Promise<void> {
  console.log('Seeding test users...');
  
  const testUsers = [
    {
      id: 'test_gamemaster_1',
      email: 'gamemaster@example.com',
      displayName: 'Test Gamemaster',
      cognitoUserId: 'test_cognito_gm_1',
      subscriptionTier: 'PREMIUM' as const,
      timezone: 'UTC',
      emailVerified: true
    },
    {
      id: 'test_player_1',
      email: 'player1@example.com',
      displayName: 'Test Player 1',
      cognitoUserId: 'test_cognito_p1',
      subscriptionTier: 'STANDARD' as const,
      timezone: 'America/New_York',
      emailVerified: true
    },
    {
      id: 'test_player_2',
      email: 'player2@example.com',
      displayName: 'Test Player 2',
      cognitoUserId: 'test_cognito_p2',
      subscriptionTier: 'FREE' as const,
      timezone: 'Europe/London',
      emailVerified: true
    }
  ];
  
  for (const userData of testUsers) {
    await db.user.upsert({
      where: { id: userData.id },
      update: userData,
      create: userData
    });
  }
  
  console.log(`Seeded ${testUsers.length} test users.`);
}

/**
 * Create a test campaign with characters
 */
export async function seedTestCampaign(): Promise<void> {
  console.log('Seeding test campaign...');
  
  // Create campaign
  const campaign = await db.campaign.upsert({
    where: { id: 'test_campaign_1' },
    update: {},
    create: {
      id: 'test_campaign_1',
      name: 'The Third Imperium Campaign',
      description: 'A classic Traveller campaign set in the Third Imperium during the year 1105.',
      gamemasterId: 'test_gamemaster_1',
      maxPlayers: 6,
      isPublic: false,
      allowedBooks: ['Core Rulebook', 'High Guard', 'Central Supply Catalogue'],
      houseRules: {
        criticalHits: true,
        extendedCharacterCreation: true,
        psionics: false
      }
    }
  });
  
  // Add campaign members
  const members = [
    { userId: 'test_gamemaster_1', role: 'GAMEMASTER' as const },
    { userId: 'test_player_1', role: 'PLAYER' as const },
    { userId: 'test_player_2', role: 'PLAYER' as const }
  ];
  
  for (const memberData of members) {
    await db.campaignMember.upsert({
      where: {
        campaignId_userId: {
          campaignId: campaign.id,
          userId: memberData.userId
        }
      },
      update: memberData,
      create: {
        ...memberData,
        campaignId: campaign.id
      }
    });
  }
  
  // Create test characters
  const characters = [
    {
      id: 'test_character_1',
      name: 'Marcus "Ace" Starling',
      playerId: 'test_player_1',
      campaignId: campaign.id,
      credits: 15000,
      homeworld: 'Regina',
      age: 34,
      gender: 'Male',
      species: 'Human',
      notes: 'Former Navy pilot turned merchant captain.',
      characteristics: {
        strength: 8,
        dexterity: 11,
        endurance: 9,
        intelligence: 10,
        education: 12,
        socialStanding: 7
      },
      skills: [
        { name: 'Pilot (Starship)', level: 3 },
        { name: 'Astrogation', level: 2 },
        { name: 'Engineering', level: 1 },
        { name: 'Gun Combat', level: 2 },
        { name: 'Tactics (Naval)', level: 2 },
        { name: 'Leadership', level: 1 }
      ],
      equipment: [
        { name: 'Body Pistol', category: 'weapon', equipped: true, quantity: 1, cost: 500 },
        { name: 'Cloth Armor', category: 'armor', equipped: true, quantity: 1, cost: 250 },
        { name: 'Portable Computer', category: 'electronics', equipped: false, quantity: 1, cost: 1000 },
        { name: 'Comm Unit', category: 'electronics', equipped: true, quantity: 1, cost: 150 }
      ]
    },
    {
      id: 'test_character_2',
      name: 'Dr. Zara Chen',
      playerId: 'test_player_2',
      campaignId: campaign.id,
      credits: 8500,
      homeworld: 'Terra',
      age: 29,
      gender: 'Female',
      species: 'Human',
      notes: 'Brilliant xenobiologist seeking ancient artifacts.',
      characteristics: {
        strength: 6,
        dexterity: 9,
        endurance: 7,
        intelligence: 13,
        education: 14,
        socialStanding: 8
      },
      skills: [
        { name: 'Science (Biology)', level: 3 },
        { name: 'Science (Xenology)', level: 2 },
        { name: 'Medic', level: 2 },
        { name: 'Investigate', level: 2 },
        { name: 'Electronics (Sensors)', level: 1 },
        { name: 'Language (Vilani)', level: 1 }
      ],
      equipment: [
        { name: 'Medical Kit', category: 'medical', equipped: false, quantity: 1, cost: 1000 },
        { name: 'Hand Scanner', category: 'electronics', equipped: true, quantity: 1, cost: 1200 },
        { name: 'Body Pistol', category: 'weapon', equipped: false, quantity: 1, cost: 500 },
        { name: 'Vacc Suit', category: 'survival', equipped: false, quantity: 1, cost: 10000 }
      ]
    }
  ];
  
  for (const characterData of characters) {
    const { characteristics, skills, equipment, ...charInfo } = characterData;
    
    // Create character
    const character = await db.character.upsert({
      where: { id: characterData.id },
      update: charInfo,
      create: charInfo
    });
    
    // Create characteristics
    await db.characteristics.upsert({
      where: { characterId: character.id },
      update: characteristics,
      create: {
        ...characteristics,
        characterId: character.id
      }
    });
    
    // Create skills
    for (const skill of skills) {
      await db.characterSkill.upsert({
        where: {
          characterId_name_specialization: {
            characterId: character.id,
            name: skill.name,
            specialization: null as any
          }
        },
        update: {
          name: skill.name,
          level: skill.level
        },
        create: {
          name: skill.name,
          level: skill.level,
          characterId: character.id,
          specialization: null
        }
      });
    }
    
    // Create equipment
    for (const item of equipment) {
      await db.characterEquipment.create({
        data: {
          ...item,
          characterId: character.id
        }
      });
    }
  }
  
  console.log('Seeded test campaign with characters.');
}

/**
 * Run all seed functions
 */
export async function seedDatabase(): Promise<void> {
  try {
    console.log('Starting database seeding...');
    
    await seedTestUsers();
    await seedCanonicalSystems();
    await seedTradeGoods();
    await seedTestCampaign();
    
    console.log('Database seeding completed successfully!');
  } catch (error) {
    console.error('Database seeding failed:', error);
    throw error;
  }
}

/**
 * Clear all data (for testing purposes)
 */
export async function clearDatabase(): Promise<void> {
  console.log('Clearing database...');
  
  // Clear in reverse dependency order
  await db.characterEquipment.deleteMany();
  await db.characterSkill.deleteMany();
  await db.lifeEvent.deleteMany();
  await db.characteristics.deleteMany();
  await db.combatAction.deleteMany();
  await db.combatSession.deleteMany();
  await db.sessionNote.deleteMany();
  await db.handout.deleteMany();
  await db.houseRule.deleteMany();
  await db.customContent.deleteMany();
  await db.diceRoll.deleteMany();
  await db.encounter.deleteMany();
  await db.session.deleteMany();
  await db.character.deleteMany();
  await db.tradeRoute.deleteMany();
  await db.tradeGood.deleteMany();
  await db.planet.deleteMany();
  await db.starSystem.deleteMany();
  await db.starship.deleteMany();
  await db.campaignMember.deleteMany();
  await db.campaign.deleteMany();
  await db.user.deleteMany();
  
  console.log('Database cleared.');
}