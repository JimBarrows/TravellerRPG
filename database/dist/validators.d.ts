/**
 * Database Validation Functions
 *
 * Provides validation functions for database operations, ensuring data integrity
 * and business rule compliance before database writes.
 */
import { DatabaseResult } from './types';
/**
 * Validate user profile data
 */
export declare function validateUserProfile(data: unknown): Promise<DatabaseResult<any>>;
/**
 * Validate Cognito user registration data
 */
export declare function validateCognitoUser(data: unknown): Promise<DatabaseResult<any>>;
/**
 * Validate character creation data
 */
export declare function validateCharacterCreate(data: unknown): Promise<DatabaseResult<any>>;
/**
 * Validate character skill data
 */
export declare function validateCharacterSkill(data: unknown): DatabaseResult<any>;
/**
 * Validate character equipment data
 */
export declare function validateCharacterEquipment(data: unknown): DatabaseResult<any>;
/**
 * Validate campaign creation data
 */
export declare function validateCampaignCreate(data: unknown, gamemasterId: string): Promise<DatabaseResult<any>>;
/**
 * Validate campaign member addition
 */
export declare function validateCampaignMember(campaignId: string, userId: string, role?: string): Promise<DatabaseResult<any>>;
/**
 * Validate star system creation data
 */
export declare function validateStarSystemCreate(data: unknown, campaignId?: string): Promise<DatabaseResult<any>>;
/**
 * Validate planet creation data
 */
export declare function validatePlanetCreate(data: unknown): DatabaseResult<any>;
/**
 * Validate dice roll data
 */
export declare function validateDiceRoll(data: unknown, rollerId: string, campaignId: string): Promise<DatabaseResult<any>>;
/**
 * Check if user has permission to perform action on campaign
 */
export declare function validateCampaignPermission(userId: string, campaignId: string, requiredRole?: 'GAMEMASTER' | 'PLAYER' | 'OBSERVER'): Promise<DatabaseResult<{
    role: string;
}>>;
/**
 * Check if user owns or has permission to modify a character
 */
export declare function validateCharacterPermission(userId: string, characterId: string): Promise<DatabaseResult<{
    character: any;
}>>;
