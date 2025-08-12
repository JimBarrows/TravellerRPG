/**
 * Database Utility Functions
 *
 * Provides utility functions for common database operations, calculations,
 * and data transformations specific to the Traveller RPG system.
 */
import { CharacteristicsData, DerivedCharacteristics, UniversalWorldProfile, DiceRollResult } from './types';
/**
 * Calculate Traveller characteristic dice modifiers
 */
export declare function calculateCharacteristicModifier(value: number): number;
/**
 * Calculate derived characteristics from base characteristics
 */
export declare function calculateDerivedCharacteristics(characteristics: CharacteristicsData): DerivedCharacteristics;
/**
 * Validate characteristic values are within legal range
 */
export declare function validateCharacteristics(characteristics: CharacteristicsData): {
    isValid: boolean;
    errors: string[];
};
/**
 * Parse Universal World Profile (UWP) string into components
 */
export declare function parseUWP(uwp: string): UniversalWorldProfile | null;
/**
 * Generate UWP string from components
 */
export declare function generateUWP(profile: UniversalWorldProfile): string;
/**
 * Determine trade classifications based on UWP
 */
export declare function determineTradeClassifications(profile: UniversalWorldProfile): string[];
/**
 * Calculate hex distance between two star systems
 */
export declare function calculateHexDistance(hex1: string, hex2: string): number;
/**
 * Parse dice notation (e.g., "2d6+1", "3d6-2")
 */
export declare function parseDiceNotation(notation: string): {
    count: number;
    sides: number;
    modifier: number;
} | null;
/**
 * Roll dice and return detailed results
 */
export declare function rollDice(notation: string, modifiers?: Array<{
    name: string;
    value: number;
}>): DiceRollResult | null;
/**
 * Perform Traveller task check (2d6 + skill + characteristic vs difficulty)
 */
export declare function performTaskCheck(skillLevel: number, characteristicModifier: number, difficulty?: number, modifiers?: Array<{
    name: string;
    value: number;
}>): DiceRollResult & {
    success: boolean;
    effect: number;
};
/**
 * Validate email format
 */
export declare function isValidEmail(email: string): boolean;
/**
 * Validate CUID format
 */
export declare function isValidCUID(id: string): boolean;
/**
 * Validate hex coordinates format
 */
export declare function isValidHexCoordinate(hex: string): boolean;
/**
 * Sanitize user input for database storage
 */
export declare function sanitizeInput(input: string): string;
/**
 * Generate secure random password
 */
export declare function generateSecurePassword(length?: number): string;
/**
 * Format credits as currency
 */
export declare function formatCredits(amount: number): string;
/**
 * Format tonnage
 */
export declare function formatTonnage(tons: number): string;
/**
 * Format distance in parsecs
 */
export declare function formatDistance(parsecs: number): string;
/**
 * Format date for display
 */
export declare function formatGameDate(date: Date): string;
/**
 * Convert characteristic value to Traveller hex notation
 */
export declare function toTravellerHex(value: number): string;
