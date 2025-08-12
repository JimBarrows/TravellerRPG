/**
 * Database Types and Interfaces
 *
 * Provides TypeScript type definitions that complement the Prisma-generated types
 * with additional business logic types and validation schemas.
 */
import { z } from 'zod';
export type { User, Campaign, CampaignMember, Character, Characteristics, CharacterSkill, CharacterEquipment, LifeEvent, StarSystem, Planet, Starship, TradeGood, TradeRoute, Session, Encounter, CombatSession, CombatAction, DiceRoll, CustomContent, HouseRule, Handout, SessionNote, SubscriptionTier, CampaignRole, SessionStatus } from './generated';
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
export type TradeClassification = 'Ag' | 'As' | 'Ba' | 'De' | 'Fl' | 'Ga' | 'Hi' | 'Ht' | 'Ic' | 'In' | 'Lo' | 'Lt' | 'Na' | 'Ni' | 'Po' | 'Ri' | 'Va' | 'Wa';
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
export type CombatActionType = 'attack' | 'move' | 'dodge' | 'parry' | 'aim' | 'reload' | 'skill' | 'other';
/**
 * Equipment categories
 */
export type EquipmentCategory = 'weapon' | 'armor' | 'tool' | 'survival' | 'medical' | 'electronics' | 'trade_goods' | 'personal' | 'other';
/**
 * User validation schemas
 */
export declare const UserSchemas: {
    profile: z.ZodObject<{
        email: z.ZodString;
        displayName: z.ZodOptional<z.ZodString>;
        timezone: z.ZodOptional<z.ZodString>;
        subscriptionTier: z.ZodOptional<z.ZodEnum<["FREE", "STANDARD", "PREMIUM"]>>;
    }, "strip", z.ZodTypeAny, {
        email: string;
        displayName?: string | undefined;
        timezone?: string | undefined;
        subscriptionTier?: "FREE" | "STANDARD" | "PREMIUM" | undefined;
    }, {
        email: string;
        displayName?: string | undefined;
        timezone?: string | undefined;
        subscriptionTier?: "FREE" | "STANDARD" | "PREMIUM" | undefined;
    }>;
    cognitoUser: z.ZodObject<{
        cognitoUserId: z.ZodString;
        email: z.ZodString;
        emailVerified: z.ZodDefault<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        email: string;
        cognitoUserId: string;
        emailVerified: boolean;
    }, {
        email: string;
        cognitoUserId: string;
        emailVerified?: boolean | undefined;
    }>;
};
/**
 * Character validation schemas
 */
export declare const CharacterSchemas: {
    characteristics: z.ZodObject<any>;
    create: z.ZodObject<any>;
    skill: z.ZodObject<any>;
    equipment: z.ZodObject<any>;
};
/**
 * Campaign validation schemas
 */
export declare const CampaignSchemas: {
    create: z.ZodObject<{
        name: z.ZodString;
        description: z.ZodOptional<z.ZodString>;
        maxPlayers: z.ZodDefault<z.ZodNumber>;
        isPublic: z.ZodDefault<z.ZodBoolean>;
        allowedBooks: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
        houseRules: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
    }, "strip", z.ZodTypeAny, {
        name: string;
        maxPlayers: number;
        isPublic: boolean;
        allowedBooks: string[];
        description?: string | undefined;
        houseRules?: Record<string, any> | undefined;
    }, {
        name: string;
        description?: string | undefined;
        maxPlayers?: number | undefined;
        isPublic?: boolean | undefined;
        allowedBooks?: string[] | undefined;
        houseRules?: Record<string, any> | undefined;
    }>;
    member: z.ZodObject<{
        userId: z.ZodString;
        role: z.ZodDefault<z.ZodEnum<["GAMEMASTER", "PLAYER", "OBSERVER"]>>;
    }, "strip", z.ZodTypeAny, {
        userId: string;
        role: "GAMEMASTER" | "PLAYER" | "OBSERVER";
    }, {
        userId: string;
        role?: "GAMEMASTER" | "PLAYER" | "OBSERVER" | undefined;
    }>;
};
/**
 * Star system validation schemas
 */
export declare const StarSystemSchemas: {
    create: z.ZodObject<{
        name: z.ZodString;
        hexLocation: z.ZodString;
        sector: z.ZodString;
        subsector: z.ZodOptional<z.ZodString>;
        allegiance: z.ZodOptional<z.ZodString>;
        starType: z.ZodOptional<z.ZodString>;
        gasGiants: z.ZodDefault<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        name: string;
        hexLocation: string;
        sector: string;
        gasGiants: number;
        subsector?: string | undefined;
        allegiance?: string | undefined;
        starType?: string | undefined;
    }, {
        name: string;
        hexLocation: string;
        sector: string;
        subsector?: string | undefined;
        allegiance?: string | undefined;
        starType?: string | undefined;
        gasGiants?: number | undefined;
    }>;
    planet: z.ZodObject<{
        name: z.ZodString;
        uwp: z.ZodString;
        size: z.ZodNumber;
        atmosphere: z.ZodNumber;
        hydrographics: z.ZodNumber;
        population: z.ZodNumber;
        government: z.ZodNumber;
        lawLevel: z.ZodNumber;
        techLevel: z.ZodNumber;
        starport: z.ZodEnum<["A", "B", "C", "D", "E", "X"]>;
        tradeCodes: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    }, "strip", z.ZodTypeAny, {
        name: string;
        uwp: string;
        size: number;
        atmosphere: number;
        hydrographics: number;
        population: number;
        government: number;
        lawLevel: number;
        techLevel: number;
        starport: "A" | "B" | "C" | "D" | "E" | "X";
        tradeCodes: string[];
    }, {
        name: string;
        uwp: string;
        size: number;
        atmosphere: number;
        hydrographics: number;
        population: number;
        government: number;
        lawLevel: number;
        techLevel: number;
        starport: "A" | "B" | "C" | "D" | "E" | "X";
        tradeCodes?: string[] | undefined;
    }>;
};
/**
 * Dice roll validation schemas
 */
export declare const DiceRollSchemas: {
    roll: z.ZodObject<{
        dice: z.ZodString;
        modifiers: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
        description: z.ZodOptional<z.ZodString>;
        isPublic: z.ZodDefault<z.ZodBoolean>;
        isGMOnly: z.ZodDefault<z.ZodBoolean>;
        character: z.ZodOptional<z.ZodString>;
        skill: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        isPublic: boolean;
        dice: string;
        modifiers: string[];
        isGMOnly: boolean;
        character?: string | undefined;
        skill?: string | undefined;
        description?: string | undefined;
    }, {
        dice: string;
        character?: string | undefined;
        skill?: string | undefined;
        description?: string | undefined;
        isPublic?: boolean | undefined;
        modifiers?: string[] | undefined;
        isGMOnly?: boolean | undefined;
    }>;
};
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
export type CreateUserProfile = z.infer<typeof UserSchemas.profile>;
export type CreateCharacter = z.infer<typeof CharacterSchemas.create>;
export type CreateCampaign = z.infer<typeof CampaignSchemas.create>;
export type CreateStarSystem = z.infer<typeof StarSystemSchemas.create>;
export type CreatePlanet = z.infer<typeof StarSystemSchemas.planet>;
export type CreateDiceRoll = z.infer<typeof DiceRollSchemas.roll>;
