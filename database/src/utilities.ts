/**
 * Database Utility Functions
 * 
 * Provides utility functions for common database operations, calculations,
 * and data transformations specific to the Traveller RPG system.
 */

import { CharacteristicsData, DerivedCharacteristics, UniversalWorldProfile, DiceRollResult } from './types';

// ============================================================================
// CHARACTER UTILITIES
// ============================================================================

/**
 * Calculate Traveller characteristic dice modifiers
 */
export function calculateCharacteristicModifier(value: number): number {
  if (value <= 2) return -2;
  if (value <= 5) return -1;
  if (value <= 8) return 0;
  if (value <= 11) return 1;
  if (value <= 14) return 2;
  return 3; // 15+
}

/**
 * Calculate derived characteristics from base characteristics
 */
export function calculateDerivedCharacteristics(characteristics: CharacteristicsData): DerivedCharacteristics {
  const {
    strength,
    dexterity,
    endurance,
    intelligence,
    education,
    socialStanding
  } = characteristics;

  return {
    physicalDamage: Math.floor((strength + endurance) / 2),
    mentalDamage: Math.floor((intelligence + education) / 2),
    strengthDM: calculateCharacteristicModifier(strength),
    dexterityDM: calculateCharacteristicModifier(dexterity),
    enduranceDM: calculateCharacteristicModifier(endurance),
    intelligenceDM: calculateCharacteristicModifier(intelligence),
    educationDM: calculateCharacteristicModifier(education),
    socialStandingDM: calculateCharacteristicModifier(socialStanding)
  };
}

/**
 * Validate characteristic values are within legal range
 */
export function validateCharacteristics(characteristics: CharacteristicsData): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  const values = Object.entries(characteristics);

  for (const [name, value] of values) {
    if (typeof value !== 'number' || value < 1 || value > 15) {
      errors.push(`${name} must be between 1 and 15`);
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

// ============================================================================
// WORLD GENERATION UTILITIES
// ============================================================================

/**
 * Parse Universal World Profile (UWP) string into components
 */
export function parseUWP(uwp: string): UniversalWorldProfile | null {
  const match = uwp.match(/^([A-EX])([0-9A-F])([0-9A-F])([0-9A-F])([0-9A-F])([0-9A-F])([0-9A-F])-([0-9A-F]+)$/);
  
  if (!match) return null;

  const hexToInt = (hex: string): number => {
    if (hex >= '0' && hex <= '9') return parseInt(hex, 10);
    return hex.charCodeAt(0) - 'A'.charCodeAt(0) + 10;
  };

  return {
    starport: match[1],
    size: hexToInt(match[2]),
    atmosphere: hexToInt(match[3]),
    hydrographics: hexToInt(match[4]),
    population: hexToInt(match[5]),
    government: hexToInt(match[6]),
    lawLevel: hexToInt(match[7]),
    techLevel: hexToInt(match[8])
  };
}

/**
 * Generate UWP string from components
 */
export function generateUWP(profile: UniversalWorldProfile): string {
  const intToHex = (value: number): string => {
    if (value < 10) return value.toString();
    return String.fromCharCode('A'.charCodeAt(0) + value - 10);
  };

  return `${profile.starport}${intToHex(profile.size)}${intToHex(profile.atmosphere)}${intToHex(profile.hydrographics)}${intToHex(profile.population)}${intToHex(profile.government)}${intToHex(profile.lawLevel)}-${intToHex(profile.techLevel)}`;
}

/**
 * Determine trade classifications based on UWP
 */
export function determineTradeClassifications(profile: UniversalWorldProfile): string[] {
  const classifications: string[] = [];
  const { size, atmosphere, hydrographics, population, government, lawLevel, techLevel } = profile;

  // Agricultural
  if (atmosphere >= 4 && atmosphere <= 9 && hydrographics >= 4 && hydrographics <= 8 && population >= 5 && population <= 7) {
    classifications.push('Ag');
  }

  // Non-agricultural
  if (atmosphere <= 3 || atmosphere >= 10 || hydrographics <= 3 || population <= 5) {
    classifications.push('Na');
  }

  // Industrial
  if (atmosphere <= 2 || atmosphere === 4 || atmosphere === 7 || atmosphere === 9 && population >= 9) {
    classifications.push('In');
  }

  // Non-industrial
  if (population <= 6) {
    classifications.push('Ni');
  }

  // High Population
  if (population >= 9) {
    classifications.push('Hi');
  }

  // Low Population
  if (population <= 3) {
    classifications.push('Lo');
  }

  // Rich
  if (atmosphere >= 6 && atmosphere <= 8 && population >= 6 && population <= 8 && government >= 4 && government <= 9) {
    classifications.push('Ri');
  }

  // Poor
  if (atmosphere >= 2 && atmosphere <= 5 && hydrographics <= 3) {
    classifications.push('Po');
  }

  // Water World
  if (hydrographics === 10) {
    classifications.push('Wa');
  }

  // Desert
  if (atmosphere >= 2 && hydrographics === 0) {
    classifications.push('De');
  }

  // Vacuum
  if (atmosphere === 0) {
    classifications.push('Va');
  }

  // Asteroid
  if (size === 0) {
    classifications.push('As');
  }

  // Ice-capped
  if (atmosphere <= 1 && hydrographics >= 1) {
    classifications.push('Ic');
  }

  // High Tech
  if (techLevel >= 12) {
    classifications.push('Ht');
  }

  // Low Tech
  if (techLevel <= 5) {
    classifications.push('Lt');
  }

  return classifications;
}

/**
 * Calculate hex distance between two star systems
 */
export function calculateHexDistance(hex1: string, hex2: string): number {
  const parseHex = (hex: string): { x: number; y: number } => {
    const x = parseInt(hex.substring(0, 2), 10);
    const y = parseInt(hex.substring(2, 4), 10);
    return { x, y };
  };

  const pos1 = parseHex(hex1);
  const pos2 = parseHex(hex2);

  // Hex grid distance calculation
  const dx = pos2.x - pos1.x;
  const dy = pos2.y - pos1.y;

  // Convert to cube coordinates for hex distance
  const q1 = pos1.x - Math.floor((pos1.y + (pos1.y & 1)) / 2);
  const r1 = pos1.y;
  const s1 = -q1 - r1;

  const q2 = pos2.x - Math.floor((pos2.y + (pos2.y & 1)) / 2);
  const r2 = pos2.y;
  const s2 = -q2 - r2;

  return Math.max(Math.abs(q2 - q1), Math.abs(r2 - r1), Math.abs(s2 - s1));
}

// ============================================================================
// DICE ROLLING UTILITIES
// ============================================================================

/**
 * Parse dice notation (e.g., "2d6+1", "3d6-2")
 */
export function parseDiceNotation(notation: string): {
  count: number;
  sides: number;
  modifier: number;
} | null {
  const match = notation.match(/^(\d+)[dD](\d+)([+-]\d+)?$/);
  if (!match) return null;

  return {
    count: parseInt(match[1], 10),
    sides: parseInt(match[2], 10),
    modifier: match[3] ? parseInt(match[3], 10) : 0
  };
}

/**
 * Roll dice and return detailed results
 */
export function rollDice(notation: string, modifiers: Array<{ name: string; value: number }> = []): DiceRollResult | null {
  const parsed = parseDiceNotation(notation);
  if (!parsed) return null;

  const { count, sides, modifier } = parsed;
  const individual: number[] = [];

  // Roll individual dice
  for (let i = 0; i < count; i++) {
    individual.push(Math.floor(Math.random() * sides) + 1);
  }

  const total = individual.reduce((sum, roll) => sum + roll, 0);
  const modifierTotal = modifiers.reduce((sum, mod) => sum + mod.value, 0);
  const finalResult = total + modifier + modifierTotal;

  return {
    dice: notation,
    individual,
    total,
    modifiers: [
      ...modifiers,
      ...(modifier !== 0 ? [{ name: 'base', value: modifier }] : [])
    ],
    finalResult
  };
}

/**
 * Perform Traveller task check (2d6 + skill + characteristic vs difficulty)
 */
export function performTaskCheck(
  skillLevel: number,
  characteristicModifier: number,
  difficulty: number = 8,
  modifiers: Array<{ name: string; value: number }> = []
): DiceRollResult & { success: boolean; effect: number } {
  const roll = rollDice('2d6');
  if (!roll) {
    throw new Error('Failed to roll dice');
  }

  const totalModifiers = [
    { name: 'skill', value: skillLevel },
    { name: 'characteristic', value: characteristicModifier },
    ...modifiers
  ];

  const modifierTotal = totalModifiers.reduce((sum, mod) => sum + mod.value, 0);
  const finalResult = roll.total + modifierTotal;
  const success = finalResult >= difficulty;
  const effect = finalResult - difficulty;

  return {
    ...roll,
    modifiers: totalModifiers,
    finalResult,
    success,
    effect
  };
}

// ============================================================================
// VALIDATION UTILITIES
// ============================================================================

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate CUID format
 */
export function isValidCUID(id: string): boolean {
  const cuidRegex = /^c[0-9a-z]{24}$/;
  return cuidRegex.test(id);
}

/**
 * Validate hex coordinates format
 */
export function isValidHexCoordinate(hex: string): boolean {
  const hexRegex = /^\d{4}$/;
  return hexRegex.test(hex);
}

/**
 * Sanitize user input for database storage
 */
export function sanitizeInput(input: string): string {
  return input.trim().replace(/[<>]/g, '');
}

/**
 * Generate secure random password
 */
export function generateSecurePassword(length: number = 16): string {
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
  let password = '';
  
  for (let i = 0; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  
  return password;
}

// ============================================================================
// FORMATTING UTILITIES
// ============================================================================

/**
 * Format credits as currency
 */
export function formatCredits(amount: number): string {
  return `Cr${amount.toLocaleString()}`;
}

/**
 * Format tonnage
 */
export function formatTonnage(tons: number): string {
  return `${tons.toLocaleString()} tons`;
}

/**
 * Format distance in parsecs
 */
export function formatDistance(parsecs: number): string {
  if (parsecs === 1) return '1 parsec';
  return `${parsecs} parsecs`;
}

/**
 * Format date for display
 */
export function formatGameDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

/**
 * Convert characteristic value to Traveller hex notation
 */
export function toTravellerHex(value: number): string {
  if (value < 10) return value.toString();
  return String.fromCharCode('A'.charCodeAt(0) + value - 10);
}