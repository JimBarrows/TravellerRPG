import type { 
  ExperienceRecord,
  ExperienceSource,
  ExperienceMilestone,
  CharacterAdvancement,
  TrainingSession,
  AdvancementCosts,
  CharacterCharacteristics,
  CharacterSheetSkill,
  CharacterSnapshot,
  CharacterSheetData
} from '../types/characterSheet';

/**
 * Traveller RPG Experience and Advancement System
 * Implements the core rules for character progression
 */

// Default Traveller RPG advancement costs
export const TRAVELLER_ADVANCEMENT_COSTS: AdvancementCosts = {
  skillImprovement: {
    baseCost: (currentLevel: number, isCareerSkill: boolean) => {
      // Traveller Core Rules: Skill improvement costs
      // Career skills: 2x level, Other skills: 4x level
      const multiplier = isCareerSkill ? 2 : 4;
      return (currentLevel + 1) * multiplier;
    },
    trainingTime: (currentLevel: number) => {
      // Training time in weeks: 4 + current level
      return 4 + currentLevel;
    },
    agePenalty: (age: number) => {
      // Age penalty per decade over 30: +1 week per decade
      return Math.max(0, Math.floor((age - 30) / 10));
    }
  },
  characteristicImprovement: {
    baseCost: (currentValue: number, characteristic: keyof CharacterCharacteristics) => {
      // Characteristic improvement: Current value x 5
      // Physical characteristics cost more after age 30
      const baseCost = currentValue * 5;
      return baseCost;
    },
    trainingTime: (currentValue: number) => {
      // Training time in weeks: current value
      return currentValue;
    },
    ageLimit: (characteristic: keyof CharacterCharacteristics, age: number) => {
      const physicalCharacteristics: (keyof CharacterCharacteristics)[] = [
        'strength', 'dexterity', 'endurance'
      ];
      
      // Physical characteristics become very difficult to improve after age 50
      if (physicalCharacteristics.includes(characteristic) && age > 50) {
        return false;
      }
      
      // All characteristics become difficult after age 70
      if (age > 70) {
        return false;
      }
      
      return true;
    }
  },
  newSkill: {
    baseCost: (isCareerSkill: boolean) => {
      // New skill at level 0: 2 XP for career skills, 4 XP for others
      return isCareerSkill ? 2 : 4;
    },
    trainingTime: () => {
      // Base training time for new skill: 2 weeks
      return 2;
    }
  }
};

// Experience sources and base rewards
export const EXPERIENCE_REWARDS: Record<ExperienceSource, (params?: any) => number> = {
  'skill_use_success': (difficulty = 0) => Math.max(1, difficulty - 6), // Difficulty 8+ tasks give XP
  'skill_use_critical': (difficulty = 0) => Math.max(2, (difficulty - 6) * 2), // Double XP for criticals
  'combat_survival': () => 2, // Surviving combat encounter
  'exploration_discovery': () => 3, // Discovering new locations/phenomena
  'social_success': (difficulty = 0) => Math.max(1, difficulty - 8), // Difficulty 10+ social tasks
  'training_completion': () => 1, // Completing formal training
  'mission_completion': (importance = 1) => importance * 3, // Mission difficulty multiplier
  'research_breakthrough': () => 5, // Major research discoveries
  'teaching_others': () => 2, // Teaching skills to other characters
  'milestone_achievement': (tier = 1) => tier * 10, // Major story milestones
  'gm_award': (amount = 1) => amount, // GM discretionary awards
  'other': (amount = 1) => amount // Custom awards
};

// Default milestones for character progression
export const DEFAULT_MILESTONES: Omit<ExperienceMilestone, 'id' | 'achieved' | 'achievedAt'>[] = [
  {
    name: 'First Steps',
    description: 'Gain your first 10 experience points',
    experienceThreshold: 10,
    rewards: [
      { type: 'bonus_xp', description: '+5 bonus XP', value: 5 }
    ]
  },
  {
    name: 'Experienced Traveller',
    description: 'Accumulate 50 total experience points',
    experienceThreshold: 50,
    rewards: [
      { type: 'skill_discount', description: '25% discount on next skill improvement', value: 0.25 }
    ]
  },
  {
    name: 'Veteran Adventurer',
    description: 'Accumulate 100 total experience points',
    experienceThreshold: 100,
    rewards: [
      { type: 'characteristic_discount', description: '20% discount on characteristic improvement', value: 0.20 },
      { type: 'bonus_xp', description: '+10 bonus XP', value: 10 }
    ]
  },
  {
    name: 'Legendary Figure',
    description: 'Accumulate 200 total experience points',
    experienceThreshold: 200,
    rewards: [
      { type: 'special_ability', description: 'Choose a unique character trait', value: 1 },
      { type: 'bonus_xp', description: '+20 bonus XP', value: 20 }
    ]
  },
  {
    name: 'Master of Their Craft',
    description: 'Accumulate 500 total experience points',
    experienceThreshold: 500,
    rewards: [
      { type: 'skill_discount', description: '50% discount on all skill improvements', value: 0.50 },
      { type: 'bonus_xp', description: '+50 bonus XP', value: 50 }
    ]
  }
];

/**
 * Calculate the cost to improve a skill including all modifiers
 */
export const calculateSkillImprovementCost = (
  skill: CharacterSheetSkill,
  character: { age: number; advancement: CharacterAdvancement },
  advancementCosts = TRAVELLER_ADVANCEMENT_COSTS
): {
  baseCost: number;
  agePenalty: number;
  totalCost: number;
  trainingWeeks: number;
  canImprove: boolean;
  restrictions: string[];
} => {
  const baseCost = advancementCosts.skillImprovement.baseCost(skill.level, skill.isCareerSkill);
  const agePenalty = advancementCosts.skillImprovement.agePenalty(character.age);
  const trainingWeeks = advancementCosts.skillImprovement.trainingTime(skill.level) + agePenalty;
  
  // Check for milestone bonuses
  let discountMultiplier = 1;
  const achievedMilestones = character.advancement.milestones.filter(m => m.achieved);
  achievedMilestones.forEach(milestone => {
    milestone.rewards?.forEach(reward => {
      if (reward.type === 'skill_discount') {
        discountMultiplier = Math.min(discountMultiplier, 1 - (reward.value || 0));
      }
    });
  });
  
  const totalCost = Math.ceil(baseCost * discountMultiplier);
  
  const restrictions: string[] = [];
  let canImprove = true;
  
  // Check age restrictions for physical skills
  if (character.age > 50 && isPhysicalSkill(skill.name)) {
    restrictions.push('Physical skills are difficult to improve after age 50');
  }
  
  // Check if character has enough XP
  if (totalCost > character.advancement.availableExperience) {
    restrictions.push(`Requires ${totalCost} XP (${character.advancement.availableExperience} available)`);
    canImprove = false;
  }
  
  return {
    baseCost,
    agePenalty,
    totalCost,
    trainingWeeks,
    canImprove,
    restrictions
  };
};

/**
 * Calculate the cost to improve a characteristic
 */
export const calculateCharacteristicImprovementCost = (
  characteristic: keyof CharacterCharacteristics,
  currentValue: number,
  character: { age: number; advancement: CharacterAdvancement },
  advancementCosts = TRAVELLER_ADVANCEMENT_COSTS
): {
  baseCost: number;
  totalCost: number;
  trainingWeeks: number;
  canImprove: boolean;
  restrictions: string[];
} => {
  const baseCost = advancementCosts.characteristicImprovement.baseCost(currentValue, characteristic);
  const trainingWeeks = advancementCosts.characteristicImprovement.trainingTime(currentValue);
  
  // Check for milestone bonuses
  let discountMultiplier = 1;
  const achievedMilestones = character.advancement.milestones.filter(m => m.achieved);
  achievedMilestones.forEach(milestone => {
    milestone.rewards?.forEach(reward => {
      if (reward.type === 'characteristic_discount') {
        discountMultiplier = Math.min(discountMultiplier, 1 - (reward.value || 0));
      }
    });
  });
  
  const totalCost = Math.ceil(baseCost * discountMultiplier);
  
  const restrictions: string[] = [];
  let canImprove = true;
  
  // Check age restrictions
  if (!advancementCosts.characteristicImprovement.ageLimit(characteristic, character.age)) {
    restrictions.push(`Characteristic improvements difficult at age ${character.age}`);
    canImprove = false;
  }
  
  // Check if already at maximum
  if (currentValue >= 15) {
    restrictions.push('Already at maximum characteristic value');
    canImprove = false;
  }
  
  // Check if character has enough XP
  if (totalCost > character.advancement.availableExperience) {
    restrictions.push(`Requires ${totalCost} XP (${character.advancement.availableExperience} available)`);
    canImprove = false;
  }
  
  return {
    baseCost,
    totalCost,
    trainingWeeks,
    canImprove,
    restrictions
  };
};

/**
 * Award experience points for an activity
 */
export const awardExperience = (
  source: ExperienceSource,
  description: string,
  params: any = {},
  advancement: CharacterAdvancement,
  sessionId?: string,
  sessionName?: string
): { 
  newRecord: ExperienceRecord;
  updatedAdvancement: CharacterAdvancement;
  newMilestones: ExperienceMilestone[];
} => {
  const amount = EXPERIENCE_REWARDS[source](params);
  
  const newRecord: ExperienceRecord = {
    id: crypto.randomUUID(),
    type: 'other',
    source,
    description,
    amount,
    date: new Date().toISOString(),
    sessionId,
    sessionName,
    difficulty: params.difficulty,
    circumstance: params.circumstance,
    rollResult: params.rollResult,
    witnesses: params.witnesses
  };
  
  const newTotalEarned = advancement.totalExperienceEarned + amount;
  const newAvailable = advancement.availableExperience + amount;
  
  // Check for new milestones
  const newMilestones: ExperienceMilestone[] = [];
  const updatedMilestones = advancement.milestones.map(milestone => {
    if (!milestone.achieved && newTotalEarned >= milestone.experienceThreshold) {
      const achievedMilestone = {
        ...milestone,
        achieved: true,
        achievedAt: new Date().toISOString()
      };
      newMilestones.push(achievedMilestone);
      
      // Apply milestone rewards
      if (milestone.rewards) {
        milestone.rewards.forEach(reward => {
          if (reward.type === 'bonus_xp' && reward.value) {
            // Add bonus XP (will be applied separately)
          }
        });
      }
      
      return achievedMilestone;
    }
    return milestone;
  });
  
  // Calculate bonus XP from milestones
  const bonusXP = newMilestones.reduce((total, milestone) => {
    return total + (milestone.rewards?.find(r => r.type === 'bonus_xp')?.value || 0);
  }, 0);
  
  const updatedAdvancement: CharacterAdvancement = {
    ...advancement,
    totalExperienceEarned: newTotalEarned + bonusXP,
    availableExperience: newAvailable + bonusXP,
    records: [...advancement.records, newRecord],
    milestones: updatedMilestones,
    activityTracking: {
      ...advancement.activityTracking,
      lastActivityDate: new Date().toISOString()
    }
  };
  
  return {
    newRecord,
    updatedAdvancement,
    newMilestones
  };
};

/**
 * Spend experience points on improvements
 */
export const spendExperience = (
  type: 'skill' | 'characteristic' | 'new_skill',
  target: string,
  cost: number,
  description: string,
  advancement: CharacterAdvancement,
  sessionId?: string
): {
  newRecord: ExperienceRecord;
  updatedAdvancement: CharacterAdvancement;
} => {
  if (cost > advancement.availableExperience) {
    throw new Error(`Insufficient experience points. Required: ${cost}, Available: ${advancement.availableExperience}`);
  }
  
  const newRecord: ExperienceRecord = {
    id: crypto.randomUUID(),
    type: type === 'skill' ? 'skill_improvement' : 
          type === 'characteristic' ? 'characteristic_improvement' : 'new_skill',
    description,
    amount: -cost, // Negative for spending
    skillName: type === 'skill' || type === 'new_skill' ? target : undefined,
    characteristicName: type === 'characteristic' ? target as keyof CharacterCharacteristics : undefined,
    date: new Date().toISOString(),
    sessionId
  };
  
  const updatedAdvancement: CharacterAdvancement = {
    ...advancement,
    totalExperienceSpent: advancement.totalExperienceSpent + cost,
    availableExperience: advancement.availableExperience - cost,
    records: [...advancement.records, newRecord]
  };
  
  return {
    newRecord,
    updatedAdvancement
  };
};

/**
 * Create a character snapshot for version history
 */
export const createCharacterSnapshot = (
  character: CharacterSheetData,
  type: CharacterSnapshot['snapshotType'] = 'manual',
  description?: string,
  metadata?: Partial<CharacterSnapshot['metadata']>
): CharacterSnapshot => {
  return {
    id: crypto.randomUUID(),
    characterId: character.id,
    version: character.version,
    snapshotDate: new Date().toISOString(),
    description,
    snapshotType: type,
    characterData: JSON.parse(JSON.stringify(character)), // Deep clone
    metadata: {
      changesSummary: [],
      ...metadata
    }
  };
};

/**
 * Initialize default advancement data for a new character
 */
export const initializeCharacterAdvancement = (): CharacterAdvancement => {
  return {
    totalExperienceEarned: 0,
    totalExperienceSpent: 0,
    availableExperience: 0,
    records: [],
    milestones: DEFAULT_MILESTONES.map(milestone => ({
      ...milestone,
      id: crypto.randomUUID(),
      achieved: false
    })),
    trainingHistory: [],
    goals: [],
    activityTracking: {
      skillUsageSessionCount: 0,
      combatEncountersCount: 0,
      explorationHours: 0,
      socialEncountersCount: 0,
      researchHours: 0,
      teachingHours: 0
    },
    preferences: {
      autoTrackSkillUsage: true,
      showAdvancementSuggestions: true,
      preferredTrainingFacilities: [],
      maxTrainingCostPerSession: 1000
    }
  };
};

/**
 * Check if a skill is considered physical (affected by aging)
 */
export const isPhysicalSkill = (skillName: string): boolean => {
  const physicalSkills = [
    'Athletics', 'Gun Combat', 'Melee', 'Pilot', 'Drive',
    'Vacc Suit', 'Zero-G', 'Survival', 'Stealth'
  ];
  return physicalSkills.some(ps => skillName.toLowerCase().includes(ps.toLowerCase()));
};

/**
 * Generate advancement suggestions based on character data
 */
export const generateAdvancementSuggestions = (
  character: CharacterSheetData
): Array<{
  type: 'skill' | 'characteristic' | 'new_skill';
  target: string;
  reason: string;
  cost: number;
  priority: 'high' | 'medium' | 'low';
}> => {
  const suggestions: Array<{
    type: 'skill' | 'characteristic' | 'new_skill';
    target: string;
    reason: string;
    cost: number;
    priority: 'high' | 'medium' | 'low';
  }> = [];
  
  // Suggest improving frequently used skills
  character.skills
    .filter(skill => skill.usage && skill.usage.timesUsed > 5)
    .sort((a, b) => (b.usage?.timesUsed || 0) - (a.usage?.timesUsed || 0))
    .slice(0, 3)
    .forEach(skill => {
      const costInfo = calculateSkillImprovementCost(skill, character);
      if (costInfo.canImprove) {
        suggestions.push({
          type: 'skill',
          target: skill.name,
          reason: `Frequently used skill (${skill.usage?.timesUsed} uses)`,
          cost: costInfo.totalCost,
          priority: skill.usage!.timesUsed > 10 ? 'high' : 'medium'
        });
      }
    });
  
  // Suggest improving low characteristics that affect many skills
  const characteristics = character.characteristics;
  Object.entries(characteristics).forEach(([charName, value]) => {
    if (value < 8) {
      const costInfo = calculateCharacteristicImprovementCost(
        charName as keyof CharacterCharacteristics,
        value,
        character
      );
      if (costInfo.canImprove) {
        suggestions.push({
          type: 'characteristic',
          target: charName,
          reason: `Below average ${charName} affects many skill checks`,
          cost: costInfo.totalCost,
          priority: value < 6 ? 'high' : 'medium'
        });
      }
    }
  });
  
  return suggestions.sort((a, b) => {
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    return priorityOrder[b.priority] - priorityOrder[a.priority];
  });
};

/**
 * Track activity for experience gain
 */
export const trackActivity = (
  activityType: keyof CharacterAdvancement['activityTracking'],
  amount: number,
  advancement: CharacterAdvancement
): CharacterAdvancement => {
  const updated = { ...advancement };
  
  switch (activityType) {
    case 'skillUsageSessionCount':
      updated.activityTracking.skillUsageSessionCount += amount;
      break;
    case 'combatEncountersCount':
      updated.activityTracking.combatEncountersCount += amount;
      break;
    case 'explorationHours':
      updated.activityTracking.explorationHours += amount;
      break;
    case 'socialEncountersCount':
      updated.activityTracking.socialEncountersCount += amount;
      break;
    case 'researchHours':
      updated.activityTracking.researchHours += amount;
      break;
    case 'teachingHours':
      updated.activityTracking.teachingHours += amount;
      break;
  }
  
  updated.activityTracking.lastActivityDate = new Date().toISOString();
  return updated;
};