import { describe, it, expect } from 'vitest';
import { 
  evaluatePasswordStrength, 
  getStrengthClass, 
  getStrengthText, 
  getStrengthPercentage 
} from './passwordStrength';

describe('passwordStrength utilities', () => {
  describe('evaluatePasswordStrength', () => {
    it('returns empty analysis for empty password', () => {
      const result = evaluatePasswordStrength('');
      
      expect(result.score).toBe(0);
      expect(result.strength).toBe('empty');
      expect(result.isValid).toBe(false);
      expect(result.requirements.hasMinLength).toBe(false);
      expect(result.requirements.hasUpperCase).toBe(false);
      expect(result.requirements.hasLowerCase).toBe(false);
      expect(result.requirements.hasNumbers).toBe(false);
      expect(result.requirements.hasSpecialChar).toBe(false);
    });

    it('evaluates very weak password correctly', () => {
      const result = evaluatePasswordStrength('123');
      
      expect(result.score).toBe(0);
      expect(result.strength).toBe('very-weak');
      expect(result.isValid).toBe(false);
      expect(result.requirements.hasMinLength).toBe(false);
    });

    it('evaluates weak password correctly', () => {
      const result = evaluatePasswordStrength('password');
      
      expect(result.score).toBeLessThanOrEqual(1);
      expect(result.strength).toMatch(/weak|very-weak/);
      expect(result.isValid).toBe(false);
      expect(result.requirements.hasMinLength).toBe(true);
      expect(result.requirements.hasLowerCase).toBe(true);
      expect(result.requirements.hasUpperCase).toBe(false);
      expect(result.requirements.hasNumbers).toBe(false);
      expect(result.requirements.hasSpecialChar).toBe(false);
    });

    it('evaluates fair password correctly', () => {
      const result = evaluatePasswordStrength('Password123');
      
      expect(result.requirements.hasMinLength).toBe(true);
      expect(result.requirements.hasLowerCase).toBe(true);
      expect(result.requirements.hasUpperCase).toBe(true);
      expect(result.requirements.hasNumbers).toBe(true);
      expect(result.requirements.hasSpecialChar).toBe(false);
      expect(result.isValid).toBe(false); // Missing special char
    });

    it('evaluates strong password correctly', () => {
      const result = evaluatePasswordStrength('StrongPass123!');
      
      expect(result.requirements.hasMinLength).toBe(true);
      expect(result.requirements.hasLowerCase).toBe(true);
      expect(result.requirements.hasUpperCase).toBe(true);
      expect(result.requirements.hasNumbers).toBe(true);
      expect(result.requirements.hasSpecialChar).toBe(true);
      expect(result.isValid).toBe(true);
    });

    it('considers user inputs when evaluating strength', () => {
      const userInputs = ['john@example.com', 'John', 'Doe'];
      const weakResult = evaluatePasswordStrength('johndoe123', userInputs);
      const strongResult = evaluatePasswordStrength('ComplexPass123!', userInputs);
      
      // Password containing user info should be weaker
      expect(weakResult.score).toBeLessThan(strongResult.score);
    });

    it('provides helpful feedback and suggestions', () => {
      const result = evaluatePasswordStrength('abc');
      
      expect(result.feedback.suggestions).toContain('Use at least 8 characters');
      expect(result.feedback.suggestions).toContain('Add an uppercase letter');
      expect(result.feedback.suggestions).toContain('Add a number');
      expect(result.feedback.suggestions).toContain('Add a special character');
    });

    it('includes crack time estimation for strong passwords', () => {
      const result = evaluatePasswordStrength('VeryComplexPassword123!@#');
      
      expect(result.crackTime).toBeDefined();
      expect(typeof result.crackTime).toBe('string');
    });
  });

  describe('getStrengthClass', () => {
    it('returns correct CSS classes for each strength level', () => {
      expect(getStrengthClass('empty')).toBe('');
      expect(getStrengthClass('very-weak')).toBe('strength-very-weak');
      expect(getStrengthClass('weak')).toBe('strength-weak');
      expect(getStrengthClass('fair')).toBe('strength-fair');
      expect(getStrengthClass('good')).toBe('strength-good');
      expect(getStrengthClass('strong')).toBe('strength-strong');
    });

    it('returns empty string for unknown strength levels', () => {
      expect(getStrengthClass('unknown')).toBe('');
      expect(getStrengthClass('')).toBe('');
      expect(getStrengthClass(null)).toBe('');
    });
  });

  describe('getStrengthText', () => {
    it('returns correct text for each strength level', () => {
      expect(getStrengthText('empty')).toBe('');
      expect(getStrengthText('very-weak')).toBe('Very Weak');
      expect(getStrengthText('weak')).toBe('Weak');
      expect(getStrengthText('fair')).toBe('Fair');
      expect(getStrengthText('good')).toBe('Good');
      expect(getStrengthText('strong')).toBe('Strong');
    });

    it('returns empty string for unknown strength levels', () => {
      expect(getStrengthText('unknown')).toBe('');
      expect(getStrengthText('')).toBe('');
      expect(getStrengthText(null)).toBe('');
    });
  });

  describe('getStrengthPercentage', () => {
    it('calculates percentage correctly for different score combinations', () => {
      // Very weak: score 0, no basic requirements
      expect(getStrengthPercentage(0, 0)).toBe(0);
      
      // Some basic requirements but low zxcvbn score
      expect(getStrengthPercentage(0, 3)).toBe(24); // 0 * 0.6 + 60 * 0.4
      
      // Strong zxcvbn score with all requirements
      expect(getStrengthPercentage(4, 5)).toBe(100); // 100 * 0.6 + 100 * 0.4
      
      // Balanced combination
      expect(getStrengthPercentage(2, 3)).toBe(54); // 50 * 0.6 + 60 * 0.4
    });

    it('returns integer percentages', () => {
      const result = getStrengthPercentage(1, 2);
      expect(Number.isInteger(result)).toBe(true);
      expect(result).toBeGreaterThanOrEqual(0);
      expect(result).toBeLessThanOrEqual(100);
    });
  });

  describe('edge cases', () => {
    it('handles null and undefined passwords', () => {
      expect(() => evaluatePasswordStrength(null)).not.toThrow();
      expect(() => evaluatePasswordStrength(undefined)).not.toThrow();
      
      const nullResult = evaluatePasswordStrength(null);
      const undefinedResult = evaluatePasswordStrength(undefined);
      
      expect(nullResult.strength).toBe('empty');
      expect(undefinedResult.strength).toBe('empty');
    });

    it('handles very long passwords', () => {
      // Use a reasonable long password instead of extremely long one
      const longPassword = 'a'.repeat(100) + 'B1!';
      const result = evaluatePasswordStrength(longPassword);
      
      expect(result).toBeDefined();
      expect(result.requirements.hasMinLength).toBe(true);
    });

    it('handles passwords with unicode characters', () => {
      const unicodePassword = 'Pâssw0rd123!@#🔒';
      const result = evaluatePasswordStrength(unicodePassword);
      
      expect(result).toBeDefined();
      expect(result.requirements.hasMinLength).toBe(true);
      expect(result.requirements.hasSpecialChar).toBe(true);
    });

    it('handles empty user inputs array', () => {
      const result = evaluatePasswordStrength('StrongPass123!', []);
      expect(result).toBeDefined();
      expect(result.isValid).toBe(true);
    });

    it('handles user inputs with special characters', () => {
      const userInputs = ['user@domain.com', 'Firstname-Lastname'];
      const result = evaluatePasswordStrength('ComplexPass123!', userInputs);
      
      expect(result).toBeDefined();
      expect(Array.isArray(result.feedback.suggestions)).toBe(true);
    });
  });
});