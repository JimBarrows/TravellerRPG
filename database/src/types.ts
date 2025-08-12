/**
 * Database Types and Interfaces
 * 
 * Provides TypeScript type definitions that complement the Prisma-generated types
 * with additional business logic types and validation schemas.
 */

import { z } from 'zod';

// Re-export Prisma types for convenience
export type {
  User,
  Campaign,
  CampaignMember,
  Character,
  Characteristics,
  CharacterSkill,
  CharacterEquipment,
  LifeEvent,
  StarSystem,
  Planet,
  Starship,
  TradeGood,
  TradeRoute,
  Session,
  Encounter,
  CombatSession,
  CombatAction,
  DiceRoll,
  CustomContent,
  HouseRule,
  Handout,
  SessionNote,
  SubscriptionTier,
  CampaignRole,
  SessionStatus
} from './generated';

// ============================================================================
// BUSINESS LOGIC TYPES
// ============================================================================

/**
 * User profile data for registration/updates
 */
export interface UserProfile {
  email: string;
  displayName?: string;
  avatar?: string;
  timezone?: string;
  subscriptionTier?: 'FREE' | 'STANDARD' | 'PREMIUM';
}

/**
 * Campaign creation data
 */
export interface CampaignCreate {
  name: string;
  description?: string;
  maxPlayers?: number;
  isPublic?: boolean;
  allowedBooks?: string[];
  houseRules?: Record<string, any>;
}

/**
 * Character creation data with validation
 */
export interface CharacterCreate {
  name: string;
  playerId: string;
  campaignId: string;
  characteristics: CharacteristicsData;
  homeworld?: string;
  age?: number;
  gender?: string;
  species?: string;
}

/**
 * Character characteristics with derived values
 */
export interface CharacteristicsData {
  strength: number;
  dexterity: number;
  endurance: number;
  intelligence: number;
  education: number;
  socialStanding: number;
}

/**
 * Derived characteristics calculations
 */
export interface DerivedCharacteristics {
  physicalDamage: number;
  mentalDamage: number;
  strengthDM: number;
  dexterityDM: number;
  enduranceDM: number;
  intelligenceDM: number;
  educationDM: number;
  socialStandingDM: number;
}

/**
 * Universal World Profile (UWP) breakdown
 */
export interface UniversalWorldProfile {
  starport: string;
  size: number;
  atmosphere: number;
  hydrographics: number;
  population: number;
  government: number;
  lawLevel: number;
  techLevel: number;
}

/**
 * Trade classification codes
 */
export type TradeClassification = 
  | 'Ag' // Agricultural
  | 'As' // Asteroid
  | 'Ba' // Barren
  | 'De' // Desert
  | 'Fl' // Fluid Oceans
  | 'Ga' // Garden
  | 'Hi' // High Population
  | 'Ht' // High Tech
  | 'Ic' // Ice-capped
  | 'In' // Industrial
  | 'Lo' // Low Population
  | 'Lt' // Low Tech
  | 'Na' // Non-agricultural
  | 'Ni' // Non-industrial
  | 'Po' // Poor
  | 'Ri' // Rich
  | 'Va' // Vacuum
  | 'Wa' // Water World;

/**
 * Dice roll result with metadata
 */
export interface DiceRollResult {
  dice: string;
  individual: number[];
  total: number;
  modifiers: Array<{
    name: string;
    value: number;
  }>;
  finalResult: number;
  success?: boolean;
  description?: string;
}

/**
 * Combat action types
 */
export type CombatActionType =
  | 'attack'
  | 'move'
  | 'dodge'
  | 'parry'
  | 'aim'
  | 'reload'
  | 'skill'
  | 'other';

/**
 * Equipment categories
 */
export type EquipmentCategory =
  | 'weapon'
  | 'armor'
  | 'tool'
  | 'survival'
  | 'medical'
  | 'electronics'
  | 'trade_goods'
  | 'personal'
  | 'other';

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

/**
 * User validation schemas
 */
export const UserSchemas = {
  profile: z.object({
    email: z.string().email(),
    displayName: z.string().min(2).max(50).optional(),
    timezone: z.string().optional(),
    subscriptionTier: z.enum(['FREE', 'STANDARD', 'PREMIUM']).optional()
  }),
  
  cognitoUser: z.object({
    cognitoUserId: z.string().min(1),
    email: z.string().email(),
    emailVerified: z.boolean().default(false)
  })
};

/**
 * Character validation schemas
 */
export const CharacterSchemas: {
  characteristics: z.ZodObject<any>;
  create: z.ZodObject<any>;
  skill: z.ZodObject<any>;
  equipment: z.ZodObject<any>;
} = {
  characteristics: z.object({
    strength: z.number().min(1).max(15),
    dexterity: z.number().min(1).max(15),
    endurance: z.number().min(1).max(15),
    intelligence: z.number().min(1).max(15),
    education: z.number().min(1).max(15),
    socialStanding: z.number().min(1).max(15)
  }),
  
  create: z.object({
    name: z.string().min(1).max(100),
    playerId: z.string().cuid(),
    campaignId: z.string().cuid(),
    characteristics: z.object({
      strength: z.number().min(1).max(15),
      dexterity: z.number().min(1).max(15),
      endurance: z.number().min(1).max(15),
      intelligence: z.number().min(1).max(15),
      education: z.number().min(1).max(15),
      socialStanding: z.number().min(1).max(15)
    }),
    homeworld: z.string().max(100).optional(),
    age: z.number().min(18).max(100).optional(),
    gender: z.string().max(50).optional(),
    species: z.string().max(50).default('Human')
  }),
  
  skill: z.object({
    name: z.string().min(1).max(100),
    level: z.number().min(0).max(6),
    specialization: z.string().max(100).optional()
  }),
  
  equipment: z.object({
    name: z.string().min(1).max(200),
    description: z.string().max(1000).optional(),
    weight: z.number().min(0).optional(),
    cost: z.number().min(0).optional(),
    quantity: z.number().min(1).default(1),
    equipped: z.boolean().default(false),
    category: z.string().max(50).optional()
  })
};

/**
 * Campaign validation schemas
 */
export const CampaignSchemas = {
  create: z.object({
    name: z.string().min(1).max(200),
    description: z.string().max(2000).optional(),
    maxPlayers: z.number().min(2).max(20).default(6),
    isPublic: z.boolean().default(false),
    allowedBooks: z.array(z.string()).default([]),
    houseRules: z.record(z.any()).optional()
  }),
  
  member: z.object({
    userId: z.string().cuid(),
    role: z.enum(['GAMEMASTER', 'PLAYER', 'OBSERVER']).default('PLAYER')
  })
};

/**
 * Star system validation schemas
 */
export const StarSystemSchemas = {
  create: z.object({
    name: z.string().min(1).max(100),
    hexLocation: z.string().regex(/^\d{4}$/, 'Must be 4-digit hex coordinates'),
    sector: z.string().min(1).max(100),
    subsector: z.string().max(10).optional(),
    allegiance: z.string().max(50).optional(),
    starType: z.string().max(20).optional(),
    gasGiants: z.number().min(0).max(10).default(0)
  }),
  
  planet: z.object({
    name: z.string().min(1).max(100),
    uwp: z.string().regex(/^[A-EX][0-9A-F]{6}-[0-9A-F]+$/, 'Invalid UWP format'),
    size: z.number().min(0).max(10),
    atmosphere: z.number().min(0).max(15),
    hydrographics: z.number().min(0).max(10),
    population: z.number().min(0).max(12),
    government: z.number().min(0).max(15),
    lawLevel: z.number().min(0).max(18),
    techLevel: z.number().min(0).max(15),
    starport: z.enum(['A', 'B', 'C', 'D', 'E', 'X']),
    tradeCodes: z.array(z.string()).default([])
  })
};

/**
 * Dice roll validation schemas
 */
export const DiceRollSchemas = {
  roll: z.object({
    dice: z.string().regex(/^\d+[dD]\d+([+-]\d+)?$/, 'Invalid dice notation'),
    modifiers: z.array(z.string()).default([]),
    description: z.string().max(500).optional(),
    isPublic: z.boolean().default(true),
    isGMOnly: z.boolean().default(false),
    character: z.string().max(100).optional(),
    skill: z.string().max(100).optional()
  })
};

// ============================================================================
// UTILITY TYPES
// ============================================================================

/**
 * Database operation result
 */
export interface DatabaseResult<T> {
  success: boolean;
  data?: T;
  error?: string;
  code?: string;
}

/**
 * Pagination parameters
 */
export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/**
 * Search and filter parameters
 */
export interface SearchParams {
  query?: string;
  filters?: Record<string, any>;
  pagination?: PaginationParams;
}

/**
 * Database health status
 */
export interface DatabaseHealth {
  status: 'healthy' | 'unhealthy' | 'degraded';
  connection: boolean;
  latency: number;
  timestamp: string;
  details?: Record<string, any>;
}

// Type exports for convenience
export type CreateUserProfile = z.infer<typeof UserSchemas.profile>;
export type CreateCharacter = z.infer<typeof CharacterSchemas.create>;
export type CreateCampaign = z.infer<typeof CampaignSchemas.create>;
export type CreateStarSystem = z.infer<typeof StarSystemSchemas.create>;
export type CreatePlanet = z.infer<typeof StarSystemSchemas.planet>;
export type CreateDiceRoll = z.infer<typeof DiceRollSchemas.roll>;