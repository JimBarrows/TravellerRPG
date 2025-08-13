/**
 * Standalone Utility Tests
 * 
 * Unit tests for database utility functions that don't require database connectivity.
 */

import {
  calculateCharacteristicModifier,
  calculateDerivedCharacteristics,
  validateCharacteristics,
  parseUWP,
  generateUWP,
  determineTradeClassifications,
  calculateHexDistance,
  parseDiceNotation,
  rollDice,
  performTaskCheck,
  formatCredits,
  formatTonnage,
  toTravellerHex
} from '../src/utilities';

describe('Character Utilities', () => {
  describe('calculateCharacteristicModifier', () => {
    it('should return correct modifiers for all ranges', () => {
      expect(calculateCharacteristicModifier(1)).toBe(-2);
      expect(calculateCharacteristicModifier(2)).toBe(-2);
      expect(calculateCharacteristicModifier(3)).toBe(-1);
      expect(calculateCharacteristicModifier(5)).toBe(-1);
      expect(calculateCharacteristicModifier(6)).toBe(0);
      expect(calculateCharacteristicModifier(8)).toBe(0);
      expect(calculateCharacteristicModifier(9)).toBe(1);
      expect(calculateCharacteristicModifier(11)).toBe(1);
      expect(calculateCharacteristicModifier(12)).toBe(2);
      expect(calculateCharacteristicModifier(14)).toBe(2);
      expect(calculateCharacteristicModifier(15)).toBe(3);
      expect(calculateCharacteristicModifier(16)).toBe(3);
    });
  });

  describe('calculateDerivedCharacteristics', () => {
    it('should calculate derived characteristics correctly', () => {
      const characteristics = {
        strength: 8,
        dexterity: 9,
        endurance: 10,
        intelligence: 11,
        education: 12,
        socialStanding: 7
      };

      const derived = calculateDerivedCharacteristics(characteristics);

      expect(derived.physicalDamage).toBe(9); // (8 + 10) / 2
      expect(derived.mentalDamage).toBe(11); // (11 + 12) / 2
      expect(derived.strengthDM).toBe(0);
      expect(derived.dexterityDM).toBe(1);
      expect(derived.enduranceDM).toBe(1);
      expect(derived.intelligenceDM).toBe(1);
      expect(derived.educationDM).toBe(2);
      expect(derived.socialStandingDM).toBe(0);
    });
  });

  describe('validateCharacteristics', () => {
    it('should validate correct characteristics', () => {
      const characteristics = {
        strength: 8,
        dexterity: 9,
        endurance: 10,
        intelligence: 11,
        education: 12,
        socialStanding: 7
      };

      const result = validateCharacteristics(characteristics);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject invalid characteristics', () => {
      const characteristics = {
        strength: 0,
        dexterity: 16,
        endurance: 10,
        intelligence: 11,
        education: 12,
        socialStanding: 7
      };

      const result = validateCharacteristics(characteristics);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('strength must be between 1 and 15');
      expect(result.errors).toContain('dexterity must be between 1 and 15');
    });
  });
});

describe('World Generation Utilities', () => {
  describe('parseUWP', () => {
    it('should parse valid UWP strings', () => {
      const uwp = parseUWP('A867569-C');
      expect(uwp).toEqual({
        starport: 'A',
        size: 8,
        atmosphere: 6,
        hydrographics: 7,
        population: 5,
        government: 6,
        lawLevel: 9,
        techLevel: 12
      });
    });

    it('should handle hex values correctly', () => {
      const uwp = parseUWP('BAFECBA-F');
      expect(uwp).toEqual({
        starport: 'B',
        size: 10, // A
        atmosphere: 15, // F
        hydrographics: 14, // E
        population: 12, // C
        government: 11, // B
        lawLevel: 10, // A
        techLevel: 15 // F
      });
    });

    it('should return null for invalid UWP strings', () => {
      expect(parseUWP('invalid')).toBeNull();
      expect(parseUWP('A867569')).toBeNull(); // Missing tech level
      expect(parseUWP('G867569-C')).toBeNull(); // Invalid starport
    });
  });

  describe('generateUWP', () => {
    it('should generate correct UWP strings', () => {
      const profile = {
        starport: 'A' as const,
        size: 8,
        atmosphere: 6,
        hydrographics: 7,
        population: 5,
        government: 6,
        lawLevel: 9,
        techLevel: 12
      };

      expect(generateUWP(profile)).toBe('A867569-C');
    });

    it('should handle hex values correctly', () => {
      const profile = {
        starport: 'B' as const,
        size: 10,
        atmosphere: 15,
        hydrographics: 14,
        population: 12,
        government: 11,
        lawLevel: 10,
        techLevel: 15
      };

      expect(generateUWP(profile)).toBe('BAFECBA-F');
    });
  });

  describe('determineTradeClassifications', () => {
    it('should classify agricultural worlds correctly', () => {
      const profile = {
        starport: 'B' as const,
        size: 7,
        atmosphere: 6,
        hydrographics: 5,
        population: 6,
        government: 5,
        lawLevel: 4,
        techLevel: 8
      };

      const classifications = determineTradeClassifications(profile);
      expect(classifications).toContain('Ag');
    });

    it('should classify high population worlds correctly', () => {
      const profile = {
        starport: 'A' as const,
        size: 8,
        atmosphere: 6,
        hydrographics: 7,
        population: 9,
        government: 6,
        lawLevel: 5,
        techLevel: 12
      };

      const classifications = determineTradeClassifications(profile);
      expect(classifications).toContain('Hi');
    });

    it('should classify vacuum worlds correctly', () => {
      const profile = {
        starport: 'E' as const,
        size: 2,
        atmosphere: 0,
        hydrographics: 0,
        population: 1,
        government: 0,
        lawLevel: 0,
        techLevel: 3
      };

      const classifications = determineTradeClassifications(profile);
      expect(classifications).toContain('Va');
    });
  });

  describe('calculateHexDistance', () => {
    it('should calculate distance between adjacent hexes', () => {
      expect(calculateHexDistance('0101', '0102')).toBe(1);
      expect(calculateHexDistance('0101', '0201')).toBe(1);
    });

    it('should calculate distance between distant hexes', () => {
      expect(calculateHexDistance('0101', '0303')).toBe(3);
      expect(calculateHexDistance('1910', '2716')).toBe(11);
    });

    it('should return 0 for identical hexes', () => {
      expect(calculateHexDistance('1234', '1234')).toBe(0);
    });
  });
});

describe('Dice Rolling Utilities', () => {
  describe('parseDiceNotation', () => {
    it('should parse standard dice notation', () => {
      expect(parseDiceNotation('2d6')).toEqual({
        count: 2,
        sides: 6,
        modifier: 0
      });

      expect(parseDiceNotation('3d8+2')).toEqual({
        count: 3,
        sides: 8,
        modifier: 2
      });

      expect(parseDiceNotation('1d20-1')).toEqual({
        count: 1,
        sides: 20,
        modifier: -1
      });
    });

    it('should return null for invalid notation', () => {
      expect(parseDiceNotation('invalid')).toBeNull();
      expect(parseDiceNotation('2x6')).toBeNull();
      expect(parseDiceNotation('d6')).toBeNull();
    });
  });

  describe('rollDice', () => {
    it('should return valid dice roll results', () => {
      const result = rollDice('2d6');
      
      expect(result).toBeDefined();
      expect(result!.dice).toBe('2d6');
      expect(result!.individual).toHaveLength(2);
      expect(result!.individual.every(roll => roll >= 1 && roll <= 6)).toBe(true);
      expect(result!.total).toBe(result!.individual[0] + result!.individual[1]);
      expect(result!.finalResult).toBe(result!.total);
    });

    it('should apply modifiers correctly', () => {
      const modifiers = [
        { name: 'skill', value: 2 },
        { name: 'circumstance', value: -1 }
      ];
      
      const result = rollDice('2d6', modifiers);
      
      expect(result).toBeDefined();
      expect(result!.modifiers).toContainEqual({ name: 'skill', value: 2 });
      expect(result!.modifiers).toContainEqual({ name: 'circumstance', value: -1 });
      expect(result!.finalResult).toBe(result!.total + 1); // 2 - 1
    });

    it('should handle dice notation with built-in modifier', () => {
      const result = rollDice('2d6+3');
      
      expect(result).toBeDefined();
      expect(result!.modifiers).toContainEqual({ name: 'base', value: 3 });
      expect(result!.finalResult).toBe(result!.total + 3);
    });
  });

  describe('performTaskCheck', () => {
    it('should perform task checks correctly', () => {
      const result = performTaskCheck(2, 1, 8); // skill 2, char mod +1, difficulty 8
      
      expect(result.dice).toBe('2d6');
      expect(result.individual).toHaveLength(2);
      expect(result.modifiers).toContainEqual({ name: 'skill', value: 2 });
      expect(result.modifiers).toContainEqual({ name: 'characteristic', value: 1 });
      expect(result.finalResult).toBe(result.total + 3); // +2 skill +1 char
      expect(typeof result.success).toBe('boolean');
      expect(result.effect).toBe(result.finalResult - 8);
    });
  });
});

describe('Formatting Utilities', () => {
  describe('formatCredits', () => {
    it('should format credits correctly', () => {
      expect(formatCredits(1000)).toBe('Cr1,000');
      expect(formatCredits(1500000)).toBe('Cr1,500,000');
      expect(formatCredits(50)).toBe('Cr50');
    });
  });

  describe('formatTonnage', () => {
    it('should format tonnage correctly', () => {
      expect(formatTonnage(100)).toBe('100 tons');
      expect(formatTonnage(1)).toBe('1 tons');
      expect(formatTonnage(50000)).toBe('50,000 tons');
    });
  });

  describe('toTravellerHex', () => {
    it('should convert numbers to Traveller hex notation', () => {
      expect(toTravellerHex(5)).toBe('5');
      expect(toTravellerHex(9)).toBe('9');
      expect(toTravellerHex(10)).toBe('A');
      expect(toTravellerHex(15)).toBe('F');
    });
  });
});