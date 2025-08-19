/**
 * Tests for skills calculations following Traveller RPG rules
 */

import {
  calculateSkillImprovementCost,
  calculateMultiLevelImprovementCost,
  getDifficultyModifier,
  calculateSkillCheckTarget,
  calculateSuccessProbability,
  calculateExperienceGain,
  updateSkillUsage,
  getSkillEffectiveness,
  validateSkillIntegrity
} from '../skillsCalculations';

import type { CharacterSheetSkill, CharacterCharacteristics, SkillUsageTracker } from '../../types/characterSheet';

describe('skillsCalculations', () => {
  const mockCharacteristics: CharacterCharacteristics = {
    strength: 10,
    dexterity: 12,
    endurance: 8,
    intelligence: 14,
    education: 11,
    social: 9
  };

  const mockSkill: CharacterSheetSkill = {
    id: 'test-skill',
    name: 'Gun Combat',
    specialty: 'Slug',
    level: 2,
    category: 'Combat',
    characteristic: 'dexterity',
    isCareerSkill: true
  };

  describe('calculateSkillImprovementCost', () => {
    it('should calculate correct cost for career skills level 0 to 1', () => {
      expect(calculateSkillImprovementCost(0, 1, true)).toBe(1);
    });

    it('should calculate correct cost for non-career skills level 0 to 1', () => {
      expect(calculateSkillImprovementCost(0, 1, false)).toBe(2);
    });

    it('should calculate correct cost for career skills level 1 to 2', () => {
      expect(calculateSkillImprovementCost(1, 2, true)).toBe(4); // 2 * 2
    });

    it('should calculate correct cost for non-career skills level 1 to 2', () => {
      expect(calculateSkillImprovementCost(1, 2, false)).toBe(8); // 2 * 4
    });

    it('should calculate correct total cost for multiple levels', () => {
      // Career skill from level 0 to 3: 1 + 4 + 6 = 11
      expect(calculateSkillImprovementCost(0, 3, true)).toBe(11);
      
      // Non-career skill from level 0 to 3: 2 + 8 + 12 = 22
      expect(calculateSkillImprovementCost(0, 3, false)).toBe(22);
    });
  });

  describe('calculateMultiLevelImprovementCost', () => {
    it('should return detailed cost breakdown', () => {
      const result = calculateMultiLevelImprovementCost(0, 3, true);
      
      expect(result.levelCosts).toEqual([
        { level: 1, cost: 1 },
        { level: 2, cost: 4 },
        { level: 3, cost: 6 }
      ]);
      expect(result.totalCost).toBe(11);
    });
  });

  describe('getDifficultyModifier', () => {
    it('should return correct modifiers for all difficulties', () => {
      expect(getDifficultyModifier('simple')).toBe(4);
      expect(getDifficultyModifier('routine')).toBe(4);
      expect(getDifficultyModifier('easy')).toBe(2);
      expect(getDifficultyModifier('average')).toBe(0);
      expect(getDifficultyModifier('difficult')).toBe(-2);
      expect(getDifficultyModifier('very difficult')).toBe(-4);
      expect(getDifficultyModifier('formidable')).toBe(-4);
      expect(getDifficultyModifier('impossible')).toBe(-6);
    });

    it('should handle case insensitive input', () => {
      expect(getDifficultyModifier('EASY')).toBe(2);
      expect(getDifficultyModifier('Average')).toBe(0);
      expect(getDifficultyModifier('DIFFICULT')).toBe(-2);
    });

    it('should return 0 for unknown difficulties', () => {
      expect(getDifficultyModifier('unknown')).toBe(0);
      expect(getDifficultyModifier('')).toBe(0);
    });
  });

  describe('calculateSkillCheckTarget', () => {
    it('should calculate correct skill check components', () => {
      const result = calculateSkillCheckTarget(mockSkill, mockCharacteristics, 'average', 0);
      
      expect(result.skillDM).toBe(2); // Skill level
      expect(result.characteristicDM).toBe(1); // (12 - 6) / 3 = 2, floor = 1
      expect(result.difficultyDM).toBe(0); // Average difficulty
      expect(result.totalDM).toBe(3); // 2 + 1 + 0
      expect(result.targetNumber).toBe(5); // 8 - 3 = 5
    });

    it('should handle high characteristic values correctly', () => {
      const highCharacteristics = { ...mockCharacteristics, dexterity: 18 };
      const result = calculateSkillCheckTarget(mockSkill, highCharacteristics, 'average', 0);
      
      expect(result.characteristicDM).toBe(4); // (18 - 6) / 3 = 4
      expect(result.totalDM).toBe(6); // 2 + 4 + 0
      expect(result.targetNumber).toBe(2); // 8 - 6 = 2 (minimum 2)
    });

    it('should handle low characteristic values correctly', () => {
      const lowCharacteristics = { ...mockCharacteristics, dexterity: 3 };
      const result = calculateSkillCheckTarget(mockSkill, lowCharacteristics, 'average', 0);
      
      expect(result.characteristicDM).toBe(-1); // (3 - 6) / 3 = -1
      expect(result.totalDM).toBe(1); // 2 + (-1) + 0
      expect(result.targetNumber).toBe(7); // 8 - 1 = 7
    });

    it('should apply difficulty modifiers correctly', () => {
      const result = calculateSkillCheckTarget(mockSkill, mockCharacteristics, 'difficult', 0);
      
      expect(result.difficultyDM).toBe(-2);
      expect(result.totalDM).toBe(1); // 2 + 1 + (-2)
      expect(result.targetNumber).toBe(7); // 8 - 1 = 7
    });

    it('should include additional modifiers', () => {
      const result = calculateSkillCheckTarget(mockSkill, mockCharacteristics, 'average', 2);
      
      expect(result.totalDM).toBe(5); // 2 + 1 + 0 + 2
      expect(result.targetNumber).toBe(3); // 8 - 5 = 3
    });
  });

  describe('calculateSuccessProbability', () => {
    it('should calculate correct probability for various scenarios', () => {
      // Target 8 (no modifiers) should be 41.67% (15/36)
      const noModResult = calculateSuccessProbability(
        { ...mockSkill, level: 0 }, 
        { ...mockCharacteristics, dexterity: 6 }, 
        'average', 
        0
      );
      expect(noModResult).toBeCloseTo(0.4167, 3);

      // Very easy target (2+) should be 100% (36/36)
      const easyResult = calculateSuccessProbability(
        { ...mockSkill, level: 6 }, 
        { ...mockCharacteristics, dexterity: 18 }, 
        'simple', 
        0
      );
      expect(easyResult).toBe(1.0);

      // Very hard target (12+) should be 2.78% (1/36)
      const hardResult = calculateSuccessProbability(
        { ...mockSkill, level: 0 }, 
        { ...mockCharacteristics, dexterity: 3 }, 
        'impossible', 
        -2
      );
      expect(hardResult).toBeCloseTo(0.0278, 3);
    });
  });

  describe('calculateExperienceGain', () => {
    it('should give more XP for failures than successes', () => {
      const successXP = calculateExperienceGain(2, true, 'average', false);
      const failureXP = calculateExperienceGain(2, false, 'average', false);
      
      expect(failureXP).toBeGreaterThan(successXP);
    });

    it('should give more XP for training', () => {
      const normalXP = calculateExperienceGain(2, true, 'average', false);
      const trainingXP = calculateExperienceGain(2, true, 'average', true);
      
      expect(trainingXP).toBeGreaterThan(normalXP);
    });

    it('should scale XP based on difficulty', () => {
      const easyXP = calculateExperienceGain(2, true, 'easy', false);
      const averageXP = calculateExperienceGain(2, true, 'average', false);
      const difficultXP = calculateExperienceGain(2, true, 'difficult', false);
      
      expect(difficultXP).toBeGreaterThan(averageXP);
      expect(averageXP).toBeGreaterThan(easyXP);
    });

    it('should reduce XP for higher skill levels', () => {
      const level0XP = calculateExperienceGain(0, true, 'average', false);
      const level3XP = calculateExperienceGain(3, true, 'average', false);
      const level6XP = calculateExperienceGain(6, true, 'average', false);
      
      expect(level0XP).toBeGreaterThan(level3XP);
      expect(level3XP).toBeGreaterThan(level6XP);
    });
  });

  describe('updateSkillUsage', () => {
    const initialUsage: SkillUsageTracker = {
      timesUsed: 5,
      successfulUses: 3,
      failedUses: 2,
      experienceGained: 10,
      averageDifficultyFaced: 0,
      consecutiveSuccesses: 1,
      consecutiveFailures: 0,
      sessionUsage: []
    };

    it('should update usage stats correctly for success', () => {
      const result = updateSkillUsage(initialUsage, true, 'average');
      
      expect(result.timesUsed).toBe(6);
      expect(result.successfulUses).toBe(4);
      expect(result.failedUses).toBe(2);
      expect(result.consecutiveSuccesses).toBe(2);
      expect(result.consecutiveFailures).toBe(0);
      expect(result.lastUsed).toBeDefined();
    });

    it('should update usage stats correctly for failure', () => {
      const result = updateSkillUsage(initialUsage, false, 'difficult');
      
      expect(result.timesUsed).toBe(6);
      expect(result.successfulUses).toBe(3);
      expect(result.failedUses).toBe(3);
      expect(result.consecutiveSuccesses).toBe(0);
      expect(result.consecutiveFailures).toBe(1);
    });

    it('should update average difficulty correctly', () => {
      const result = updateSkillUsage(initialUsage, true, 'difficult'); // -2 modifier
      
      // (0 * 5 + (-2) * 1) / 6 = -2/6 = -0.333...
      expect(result.averageDifficultyFaced).toBeCloseTo(-0.333, 3);
    });

    it('should handle session usage tracking', () => {
      const result = updateSkillUsage(initialUsage, true, 'average', 'session-1');
      
      expect(result.sessionUsage).toHaveLength(1);
      expect(result.sessionUsage[0]).toEqual({
        sessionId: 'session-1',
        date: expect.any(String),
        uses: 1,
        successes: 1,
        failures: 0
      });
    });

    it('should update existing session usage', () => {
      const usageWithSession: SkillUsageTracker = {
        ...initialUsage,
        sessionUsage: [{
          sessionId: 'session-1',
          date: '2023-01-01',
          uses: 2,
          successes: 1,
          failures: 1
        }]
      };

      const result = updateSkillUsage(usageWithSession, false, 'average', 'session-1');
      
      expect(result.sessionUsage).toHaveLength(1);
      expect(result.sessionUsage[0]).toEqual({
        sessionId: 'session-1',
        date: '2023-01-01',
        uses: 3,
        successes: 1,
        failures: 2
      });
    });
  });

  describe('getSkillEffectiveness', () => {
    it('should rate skill effectiveness correctly', () => {
      const poorSkill = { ...mockSkill, level: 0 };
      const poorChars = { ...mockCharacteristics, dexterity: 3 };
      const poorResult = getSkillEffectiveness(poorSkill, poorChars);
      expect(poorResult.rating).toBe('Poor');
      expect(poorResult.totalDM).toBe(-1); // 0 + (-1)

      const goodSkill = { ...mockSkill, level: 3 };
      const goodChars = { ...mockCharacteristics, dexterity: 12 };
      const goodResult = getSkillEffectiveness(goodSkill, goodChars);
      expect(goodResult.rating).toBe('Good');
      expect(goodResult.totalDM).toBe(4); // 3 + 1

      const legendarySkill = { ...mockSkill, level: 6 };
      const legendaryChars = { ...mockCharacteristics, dexterity: 18 };
      const legendaryResult = getSkillEffectiveness(legendarySkill, legendaryChars);
      expect(legendaryResult.rating).toBe('Legendary');
      expect(legendaryResult.totalDM).toBe(10); // 6 + 4
    });
  });

  describe('validateSkillIntegrity', () => {
    it('should detect inconsistent usage data', () => {
      const invalidSkill: CharacterSheetSkill = {
        ...mockSkill,
        usage: {
          timesUsed: 5,
          successfulUses: 3,
          failedUses: 4, // 3 + 4 > 5
          experienceGained: 0,
          averageDifficultyFaced: 0,
          consecutiveSuccesses: 0,
          consecutiveFailures: 0,
          sessionUsage: []
        }
      };

      const errors = validateSkillIntegrity(invalidSkill);
      expect(errors).toContain('Usage data inconsistent: successes + failures > total uses');
    });

    it('should detect missing last used date with usage data', () => {
      const invalidSkill: CharacterSheetSkill = {
        ...mockSkill,
        usage: {
          timesUsed: 1,
          successfulUses: 1,
          failedUses: 0,
          experienceGained: 0,
          averageDifficultyFaced: 0,
          consecutiveSuccesses: 1,
          consecutiveFailures: 0,
          sessionUsage: []
        }
        // Missing lastUsed property
      };

      const errors = validateSkillIntegrity(invalidSkill);
      expect(errors).toContain('Skill has usage data but no last used date');
    });

    it('should detect inconsistent improvement history', () => {
      const invalidSkill: CharacterSheetSkill = {
        ...mockSkill,
        level: 3,
        improvementHistory: [
          {
            fromLevel: 0,
            toLevel: 2,
            costPaid: 5,
            dateImproved: '2023-01-01',
            methodUsed: 'experience'
          }
          // Missing level 2->3 improvement but current level is 3
        ]
      };

      const errors = validateSkillIntegrity(invalidSkill);
      expect(errors).toContain('Improvement history does not match current skill level');
    });

    it('should return no errors for valid skill', () => {
      const validSkill: CharacterSheetSkill = {
        ...mockSkill,
        usage: {
          timesUsed: 5,
          successfulUses: 3,
          failedUses: 2,
          experienceGained: 15,
          averageDifficultyFaced: 0,
          consecutiveSuccesses: 2,
          consecutiveFailures: 0,
          sessionUsage: []
        },
        lastUsed: '2023-01-01T12:00:00Z',
        improvementHistory: [
          {
            fromLevel: 0,
            toLevel: 1,
            costPaid: 1,
            dateImproved: '2022-01-01',
            methodUsed: 'experience'
          },
          {
            fromLevel: 1,
            toLevel: 2,
            costPaid: 4,
            dateImproved: '2023-01-01',
            methodUsed: 'experience'
          }
        ]
      };

      const errors = validateSkillIntegrity(validSkill);
      expect(errors).toHaveLength(0);
    });
  });
});