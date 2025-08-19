/**
 * Skill-related calculations following Traveller RPG rules
 */

import type { CharacterSheetSkill, CharacterCharacteristics, SkillUsageTracker } from '../types/characterSheet';
import { getSkillById } from '../data/skills';

// Skill improvement cost calculations following Traveller RPG rules
export const calculateSkillImprovementCost = (
  currentLevel: number,
  targetLevel: number,
  isCareerSkill: boolean
): number => {
  let totalCost = 0;
  
  for (let level = currentLevel + 1; level <= targetLevel; level++) {
    let baseCost: number;
    
    if (level === 1) {
      // Level 0 to 1: Career skills cost 1 XP, non-career skills cost 2 XP
      baseCost = isCareerSkill ? 1 : 2;
    } else {
      // Level X to X+1: Career skills cost (level * 2) XP, non-career skills cost (level * 4) XP
      baseCost = level * (isCareerSkill ? 2 : 4);
    }
    
    totalCost += baseCost;
  }
  
  return totalCost;
};

// Calculate total improvement cost for multiple levels
export const calculateMultiLevelImprovementCost = (
  currentLevel: number,
  targetLevel: number,
  isCareerSkill: boolean
): { levelCosts: Array<{ level: number; cost: number }>; totalCost: number } => {
  const levelCosts: Array<{ level: number; cost: number }> = [];
  let totalCost = 0;
  
  for (let level = currentLevel + 1; level <= targetLevel; level++) {
    const cost = calculateSkillImprovementCost(level - 1, level, isCareerSkill);
    levelCosts.push({ level, cost });
    totalCost += cost;
  }
  
  return { levelCosts, totalCost };
};

// Skill check difficulty modifiers
export const getDifficultyModifier = (difficulty: string): number => {
  switch (difficulty.toLowerCase()) {
    case 'simple':
    case 'routine': return 4;
    case 'easy': return 2;
    case 'average': return 0;
    case 'difficult': return -2;
    case 'very difficult':
    case 'formidable': return -4;
    case 'impossible': return -6;
    default: return 0;
  }
};

// Calculate skill check target number (2d6 + skill level + characteristic modifier + difficulty modifier)
export const calculateSkillCheckTarget = (
  skill: CharacterSheetSkill,
  characteristics: CharacterCharacteristics,
  difficulty: string = 'average',
  additionalModifiers: number = 0
): {
  skillDM: number;
  characteristicDM: number;
  difficultyDM: number;
  totalDM: number;
  targetNumber: number; // What you need to roll on 2d6
} => {
  const skillDM = skill.level;
  const characteristicValue = characteristics[skill.characteristic];
  const characteristicDM = Math.floor((characteristicValue - 6) / 3);
  const difficultyDM = getDifficultyModifier(difficulty);
  const totalDM = skillDM + characteristicDM + difficultyDM + additionalModifiers;
  
  // Standard Traveller target number is 8+ on 2d6
  const targetNumber = Math.max(2, 8 - totalDM);
  
  return {
    skillDM,
    characteristicDM,
    difficultyDM,
    totalDM,
    targetNumber
  };
};

// Calculate success probability for a skill check
export const calculateSuccessProbability = (
  skill: CharacterSheetSkill,
  characteristics: CharacterCharacteristics,
  difficulty: string = 'average',
  additionalModifiers: number = 0
): number => {
  const { targetNumber } = calculateSkillCheckTarget(skill, characteristics, difficulty, additionalModifiers);
  
  // Calculate probability of rolling targetNumber or higher on 2d6
  let successfulOutcomes = 0;
  for (let die1 = 1; die1 <= 6; die1++) {
    for (let die2 = 1; die2 <= 6; die2++) {
      if (die1 + die2 >= targetNumber) {
        successfulOutcomes++;
      }
    }
  }
  
  return successfulOutcomes / 36; // 36 total possible outcomes on 2d6
};

// Experience gain calculation for skill usage
export const calculateExperienceGain = (
  skillLevel: number,
  wasSuccessful: boolean,
  difficulty: string = 'average',
  isTraining: boolean = false
): number => {
  let baseGain = 0;
  
  // Base experience gain
  if (wasSuccessful) {
    baseGain = isTraining ? 2 : 1; // Training provides more XP
  } else {
    // Learn from failure - actually more valuable
    baseGain = isTraining ? 3 : 2;
  }
  
  // Difficulty modifier
  const difficultyMultiplier = {
    'simple': 0.25,
    'routine': 0.5,
    'easy': 0.75,
    'average': 1,
    'difficult': 1.5,
    'very difficult': 2,
    'formidable': 2,
    'impossible': 2.5
  }[difficulty.toLowerCase()] || 1;
  
  // Higher level skills gain experience slower
  const levelModifier = Math.max(0.1, 1 - (skillLevel * 0.15));
  
  return Math.ceil(baseGain * difficultyMultiplier * levelModifier);
};

// Update skill usage tracker
export const updateSkillUsage = (
  currentUsage: SkillUsageTracker | undefined,
  wasSuccessful: boolean,
  difficulty: string = 'average',
  sessionId?: string
): SkillUsageTracker => {
  const usage = currentUsage || {
    timesUsed: 0,
    successfulUses: 0,
    failedUses: 0,
    experienceGained: 0,
    averageDifficultyFaced: 0,
    consecutiveSuccesses: 0,
    consecutiveFailures: 0,
    sessionUsage: []
  };
  
  const difficultyValue = getDifficultyModifier(difficulty);
  const newTimesUsed = usage.timesUsed + 1;
  
  // Update difficulty average
  const newAverageDifficulty = (usage.averageDifficultyFaced * usage.timesUsed + difficultyValue) / newTimesUsed;
  
  // Update session usage if sessionId provided
  let newSessionUsage = [...usage.sessionUsage];
  if (sessionId) {
    const currentSession = newSessionUsage.find(s => s.sessionId === sessionId);
    if (currentSession) {
      currentSession.uses += 1;
      if (wasSuccessful) {
        currentSession.successes += 1;
      } else {
        currentSession.failures += 1;
      }
    } else {
      newSessionUsage.push({
        sessionId,
        date: new Date().toISOString(),
        uses: 1,
        successes: wasSuccessful ? 1 : 0,
        failures: wasSuccessful ? 0 : 1
      });
    }
  }
  
  return {
    timesUsed: newTimesUsed,
    successfulUses: wasSuccessful ? usage.successfulUses + 1 : usage.successfulUses,
    failedUses: wasSuccessful ? usage.failedUses : usage.failedUses + 1,
    lastUsed: new Date().toISOString(),
    experienceGained: usage.experienceGained,
    averageDifficultyFaced: newAverageDifficulty,
    consecutiveSuccesses: wasSuccessful ? usage.consecutiveSuccesses + 1 : 0,
    consecutiveFailures: wasSuccessful ? 0 : usage.consecutiveFailures + 1,
    sessionUsage: newSessionUsage
  };
};

// Get skill effectiveness rating
export const getSkillEffectiveness = (skill: CharacterSheetSkill, characteristics: CharacterCharacteristics): {
  rating: 'Poor' | 'Fair' | 'Good' | 'Excellent' | 'Legendary';
  totalDM: number;
  description: string;
} => {
  const totalDM = skill.level + Math.floor((characteristics[skill.characteristic] - 6) / 3);
  
  let rating: 'Poor' | 'Fair' | 'Good' | 'Excellent' | 'Legendary';
  let description: string;
  
  if (totalDM <= -2) {
    rating = 'Poor';
    description = 'Struggles with basic tasks';
  } else if (totalDM <= 0) {
    rating = 'Fair';
    description = 'Can handle routine tasks';
  } else if (totalDM <= 2) {
    rating = 'Good';
    description = 'Competent and reliable';
  } else if (totalDM <= 4) {
    rating = 'Excellent';
    description = 'Expert level performance';
  } else {
    rating = 'Legendary';
    description = 'Master of the craft';
  }
  
  return { rating, totalDM, description };
};

// Calculate skill synergy bonuses (cascade skills)
export const calculateSkillSynergy = (
  primarySkill: CharacterSheetSkill,
  allSkills: CharacterSheetSkill[]
): number => {
  const skillDefinition = getSkillById(primarySkill.name.toLowerCase().replace(/\s+/g, '-'));
  if (!skillDefinition?.cascade) {
    return 0;
  }
  
  // Example synergy calculations (these would be defined per skill)
  let synergyBonus = 0;
  
  // Jack-of-all-Trades provides a +1 bonus to all unskilled tasks
  const jackOfAllTrades = allSkills.find(s => s.name.toLowerCase() === 'jack-of-all-trades');
  if (jackOfAllTrades && primarySkill.level === 0) {
    synergyBonus += Math.min(jackOfAllTrades.level, 3); // Max +3 from Jack-of-all-Trades
  }
  
  // Specific skill synergies (would be expanded based on Traveller rules)
  switch (primarySkill.name.toLowerCase()) {
    case 'pilot':
      const navigation = allSkills.find(s => s.name.toLowerCase() === 'navigation');
      if (navigation) {
        synergyBonus += Math.floor(navigation.level / 2); // +1 per 2 levels of Navigation
      }
      break;
      
    case 'engineer':
      const mechanic = allSkills.find(s => s.name.toLowerCase() === 'mechanic');
      if (mechanic) {
        synergyBonus += Math.floor(mechanic.level / 3); // +1 per 3 levels of Mechanic
      }
      break;
      
    case 'medic':
      const biology = allSkills.find(s => s.name.toLowerCase() === 'science' && s.specialty?.toLowerCase() === 'biology');
      if (biology) {
        synergyBonus += Math.floor(biology.level / 2);
      }
      break;
  }
  
  return Math.min(synergyBonus, 3); // Cap synergy bonuses at +3
};

// Get recommended skill improvements
export const getRecommendedSkillImprovements = (
  skills: CharacterSheetSkill[],
  availableExperience: number,
  careerFocus?: string[]
): Array<{
  skill: CharacterSheetSkill;
  priority: 'High' | 'Medium' | 'Low';
  reason: string;
  cost: number;
}> => {
  const recommendations: Array<{
    skill: CharacterSheetSkill;
    priority: 'High' | 'Medium' | 'Low';
    reason: string;
    cost: number;
  }> = [];
  
  skills.forEach(skill => {
    if (skill.level >= 6) return; // Already at maximum
    
    const cost = calculateSkillImprovementCost(skill.level, skill.level + 1, skill.isCareerSkill);
    if (cost > availableExperience) return; // Can't afford
    
    let priority: 'High' | 'Medium' | 'Low' = 'Low';
    let reason = 'General improvement';
    
    // High priority for level 0 career skills
    if (skill.level === 0 && skill.isCareerSkill) {
      priority = 'High';
      reason = 'Career skill at level 0 - cheap to improve and removes unskilled penalty';
    }
    // High priority for frequently used skills
    else if (skill.usage && skill.usage.timesUsed > 10) {
      priority = 'High';
      reason = `Frequently used skill (${skill.usage.timesUsed} times)`;
    }
    // Medium priority for career skills
    else if (skill.isCareerSkill) {
      priority = 'Medium';
      reason = 'Career skill - lower improvement cost';
    }
    // Medium priority for skills matching career focus
    else if (careerFocus && careerFocus.some(focus => 
      skill.name.toLowerCase().includes(focus.toLowerCase()) ||
      skill.category.toLowerCase().includes(focus.toLowerCase())
    )) {
      priority = 'Medium';
      reason = 'Matches career focus';
    }
    
    recommendations.push({ skill, priority, reason, cost });
  });
  
  // Sort by priority and cost
  return recommendations.sort((a, b) => {
    const priorityOrder = { 'High': 3, 'Medium': 2, 'Low': 1 };
    const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
    if (priorityDiff !== 0) return priorityDiff;
    return a.cost - b.cost; // Lower cost first within same priority
  });
};

// Validate skill data integrity
export const validateSkillIntegrity = (skill: CharacterSheetSkill): string[] => {
  const errors: string[] = [];
  
  // Check usage data consistency
  if (skill.usage) {
    const { timesUsed, successfulUses, failedUses } = skill.usage;
    if (successfulUses + failedUses > timesUsed) {
      errors.push('Usage data inconsistent: successes + failures > total uses');
    }
    
    if (timesUsed > 0 && !skill.lastUsed) {
      errors.push('Skill has usage data but no last used date');
    }
  }
  
  // Check improvement history consistency
  if (skill.improvementHistory) {
    const totalLevelsGained = skill.improvementHistory.reduce((sum, improvement) => 
      sum + (improvement.toLevel - improvement.fromLevel), 0
    );
    
    const startingLevel = skill.improvementHistory.length > 0 
      ? skill.improvementHistory[0].fromLevel 
      : skill.level;
    
    if (startingLevel + totalLevelsGained !== skill.level) {
      errors.push('Improvement history does not match current skill level');
    }
  }
  
  return errors;
};

export default {
  calculateSkillImprovementCost,
  calculateMultiLevelImprovementCost,
  getDifficultyModifier,
  calculateSkillCheckTarget,
  calculateSuccessProbability,
  calculateExperienceGain,
  updateSkillUsage,
  getSkillEffectiveness,
  calculateSkillSynergy,
  getRecommendedSkillImprovements,
  validateSkillIntegrity
};