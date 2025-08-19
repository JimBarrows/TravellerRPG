/**
 * Healing and Recovery System for Traveller RPG
 * Handles natural healing, medical treatment, and condition recovery
 */

import type { 
  StatusCondition, 
  CharacterCharacteristics,
  CharacterSheetData,
  TravellerConditionSeverity,
  RecoveryCondition
} from '../types/characterSheet';
import { getCharacteristicModifier } from '../types/characterSheet';

// Natural healing rates based on Traveller rules
export const NATURAL_HEALING_RATES = {
  // Characteristic healing (points per period)
  characteristic: {
    withMedicalCare: 2, // per day with medical care
    withRest: 1, // per day with complete rest
    withActivity: 0, // no healing with normal activity
    withStrenuous: -1 // further damage with strenuous activity
  },
  
  // Condition healing (severity reduction)
  condition: {
    minor: { days: 1, restRequired: false },
    moderate: { days: 3, restRequired: true },
    major: { days: 7, restRequired: true },
    critical: { days: 14, restRequired: true, medicalCareRequired: true },
    terminal: { days: 0, restRequired: false, medicalCareRequired: true } // requires treatment
  }
};

// Medical treatment effectiveness
export const MEDICAL_TREATMENT = {
  // First aid (immediate treatment)
  firstAid: {
    timeLimit: 60, // minutes after injury
    maxHealing: 3, // maximum characteristic points restored
    difficulty: 8,
    skillRequired: 'Medic'
  },
  
  // Medical care (daily treatment)
  medicalCare: {
    healingBonus: 1, // additional healing per day
    difficulty: 6,
    skillRequired: 'Medic',
    equipmentRequired: ['Medical Kit']
  },
  
  // Surgery (major treatment)
  surgery: {
    maxHealing: 10, // maximum characteristic points restored
    difficulty: 12,
    skillRequired: 'Medic',
    equipmentRequired: ['Hospital', 'Surgery'],
    timeRequired: 6, // hours
    costCredits: 1000
  },
  
  // Augmentation (advanced treatment)
  augmentation: {
    maxHealing: 'full', // can restore to original or enhance
    difficulty: 15,
    skillRequired: 'Medic',
    equipmentRequired: ['Advanced Medical Facility'],
    timeRequired: 168, // hours (1 week)
    costCredits: 50000
  }
};

// Activity levels and their effects on healing
export type ActivityLevel = 'bedRest' | 'lightActivity' | 'normalActivity' | 'strenuousActivity';

export const ACTIVITY_EFFECTS = {
  bedRest: {
    healingMultiplier: 2,
    conditionProgressMultiplier: 2,
    description: 'Complete bed rest - maximum healing'
  },
  lightActivity: {
    healingMultiplier: 1.5,
    conditionProgressMultiplier: 1.5,
    description: 'Light activity - good healing'
  },
  normalActivity: {
    healingMultiplier: 1,
    conditionProgressMultiplier: 1,
    description: 'Normal activity - standard healing'
  },
  strenuousActivity: {
    healingMultiplier: 0.5,
    conditionProgressMultiplier: 0.5,
    description: 'Strenuous activity - impaired healing'
  }
};

/**
 * Calculate natural healing for characteristics
 */
export const calculateCharacteristicHealing = (
  currentValue: number,
  originalValue: number,
  enduranceModifier: number,
  hasMedicalCare: boolean,
  activityLevel: ActivityLevel,
  hoursElapsed: number
): number => {
  if (currentValue >= originalValue) {
    return 0; // Already at full health
  }
  
  const daysElapsed = hoursElapsed / 24;
  const activityEffect = ACTIVITY_EFFECTS[activityLevel];
  
  // Base healing rate
  let baseHealing = hasMedicalCare 
    ? NATURAL_HEALING_RATES.characteristic.withMedicalCare
    : NATURAL_HEALING_RATES.characteristic.withRest;
    
  // Apply activity modifier
  baseHealing *= activityEffect.healingMultiplier;
  
  // Apply endurance modifier (represents constitution)
  const enduranceMod = getCharacteristicModifier(Math.max(1, currentValue)); // Use current END
  baseHealing += enduranceMod * 0.5; // Endurance helps with healing
  
  // Calculate total healing
  const totalHealing = Math.floor(baseHealing * daysElapsed);
  
  // Don't heal beyond original value
  return Math.min(totalHealing, originalValue - currentValue);
};

/**
 * Calculate condition recovery progress
 */
export const calculateConditionRecovery = (
  condition: StatusCondition,
  activityLevel: ActivityLevel,
  hasMedicalCare: boolean,
  hoursElapsed: number
): {
  isHealed: boolean;
  isImproved: boolean;
  newSeverity?: TravellerConditionSeverity;
  timeRemaining: number;
} => {
  const healingInfo = NATURAL_HEALING_RATES.condition[condition.severity];
  
  // Terminal conditions don't heal naturally
  if (condition.severity === 'terminal') {
    return {
      isHealed: false,
      isImproved: false,
      timeRemaining: Infinity
    };
  }
  
  // Check if medical care is required
  if (healingInfo.medicalCareRequired && !hasMedicalCare) {
    return {
      isHealed: false,
      isImproved: false,
      timeRemaining: Infinity
    };
  }
  
  // Check if rest is required
  if (healingInfo.restRequired && activityLevel === 'strenuousActivity') {
    return {
      isHealed: false,
      isImproved: false,
      timeRemaining: Infinity
    };
  }
  
  const activityEffect = ACTIVITY_EFFECTS[activityLevel];
  const effectiveTime = hoursElapsed * activityEffect.conditionProgressMultiplier;
  const requiredTime = healingInfo.days * 24; // Convert to hours
  
  const timeRemaining = Math.max(0, requiredTime - effectiveTime);
  
  if (effectiveTime >= requiredTime) {
    // Condition is healed
    return {
      isHealed: true,
      isImproved: false,
      timeRemaining: 0
    };
  }
  
  // Check for improvement (severity reduction)
  if (effectiveTime >= requiredTime * 0.5 && condition.severity !== 'minor') {
    const severityLevels: TravellerConditionSeverity[] = ['minor', 'moderate', 'major', 'critical', 'terminal'];
    const currentIndex = severityLevels.indexOf(condition.severity);
    
    if (currentIndex > 0) {
      return {
        isHealed: false,
        isImproved: true,
        newSeverity: severityLevels[currentIndex - 1],
        timeRemaining
      };
    }
  }
  
  return {
    isHealed: false,
    isImproved: false,
    timeRemaining
  };
};

/**
 * Attempt medical treatment
 */
export const attemptMedicalTreatment = (
  treatmentType: 'firstAid' | 'medicalCare' | 'surgery' | 'augmentation',
  medicSkill: number,
  characteristicModifier: number,
  equipmentBonus: number,
  additionalModifiers: number = 0
): {
  success: boolean;
  roll: number;
  target: number;
  result: string;
  healingAmount?: number;
  cost?: number;
} => {
  const treatment = MEDICAL_TREATMENT[treatmentType];
  const target = treatment.difficulty;
  
  // Roll 2d6
  const die1 = Math.floor(Math.random() * 6) + 1;
  const die2 = Math.floor(Math.random() * 6) + 1;
  const roll = die1 + die2;
  
  const totalModifier = medicSkill + characteristicModifier + equipmentBonus + additionalModifiers;
  const finalResult = roll + totalModifier;
  
  const success = finalResult >= target;
  const effectOfSuccess = Math.max(0, finalResult - target);
  
  let healingAmount = 0;
  let result = '';
  
  if (success) {
    switch (treatmentType) {
      case 'firstAid':
        healingAmount = Math.min(1 + effectOfSuccess, treatment.maxHealing);
        result = `First aid successful! Restored ${healingAmount} characteristic points.`;
        break;
        
      case 'medicalCare':
        healingAmount = 1 + Math.floor(effectOfSuccess / 2);
        result = `Medical care successful! Healing rate increased by ${healingAmount} per day.`;
        break;
        
      case 'surgery':
        healingAmount = Math.min(3 + effectOfSuccess * 2, treatment.maxHealing);
        result = `Surgery successful! Restored ${healingAmount} characteristic points.`;
        break;
        
      case 'augmentation':
        healingAmount = 10 + effectOfSuccess; // Can exceed original values
        result = `Augmentation successful! Enhanced characteristic by ${healingAmount} points.`;
        break;
    }
  } else {
    result = `Treatment failed. Roll: ${roll} + ${totalModifier} = ${finalResult} vs ${target}+`;
    
    // Critical failure consequences
    if (roll === 2) {
      result += ' Critical failure - patient takes 1d3 additional damage!';
    }
  }
  
  return {
    success,
    roll,
    target,
    result,
    healingAmount: success ? healingAmount : undefined,
    cost: 'costCredits' in treatment ? treatment.costCredits : undefined
  };
};

/**
 * Calculate recovery time for a condition with treatment
 */
export const calculateTreatmentTime = (
  condition: StatusCondition,
  treatmentMethod: 'natural' | 'medical' | 'surgery' | 'augmentation'
): {
  timeRequired: number;
  timeUnit: 'hours' | 'days' | 'weeks';
  requirements: string[];
  successChance: number;
} => {
  let timeRequired = 0;
  let timeUnit: 'hours' | 'days' | 'weeks' = 'days';
  const requirements: string[] = [];
  let successChance = 100;
  
  switch (treatmentMethod) {
    case 'natural':
      const healingInfo = NATURAL_HEALING_RATES.condition[condition.severity];
      timeRequired = healingInfo.days;
      timeUnit = 'days';
      
      if (healingInfo.restRequired) {
        requirements.push('Complete rest required');
      }
      if (healingInfo.medicalCareRequired) {
        requirements.push('Medical care required');
        successChance = 50; // Natural healing less certain for critical conditions
      }
      break;
      
    case 'medical':
      timeRequired = Math.ceil(NATURAL_HEALING_RATES.condition[condition.severity].days / 2);
      timeUnit = 'days';
      requirements.push('Medic skill', 'Medical Kit');
      successChance = 80;
      break;
      
    case 'surgery':
      timeRequired = 1;
      timeUnit = 'days';
      requirements.push('Medic skill 2+', 'Hospital facility', 'Surgery equipment');
      successChance = 70;
      break;
      
    case 'augmentation':
      timeRequired = 1;
      timeUnit = 'weeks';
      requirements.push('Medic skill 3+', 'Advanced medical facility', '50,000 credits');
      successChance = 90;
      break;
  }
  
  return {
    timeRequired,
    timeUnit,
    requirements,
    successChance
  };
};

/**
 * Check for condition worsening due to neglect or poor conditions
 */
export const checkConditionWorsening = (
  condition: StatusCondition,
  hoursWithoutTreatment: number,
  environmentalFactors: {
    hasCleanWater: boolean;
    hasFood: boolean;
    hasWarmth: boolean;
    hasCleanAir: boolean;
  }
): {
  hasWorsened: boolean;
  newSeverity?: TravellerConditionSeverity;
  reason: string;
} => {
  if (!condition.canWorsen) {
    return { hasWorsened: false, reason: 'Condition cannot worsen naturally' };
  }
  
  const { hasCleanWater, hasFood, hasWarmth, hasCleanAir } = environmentalFactors;
  const environmentalScore = [hasCleanWater, hasFood, hasWarmth, hasCleanAir].filter(Boolean).length;
  
  // Calculate worsening risk based on condition and environment
  let worseningThreshold = 72; // hours
  
  switch (condition.severity) {
    case 'critical':
      worseningThreshold = 12;
      break;
    case 'major':
      worseningThreshold = 24;
      break;
    case 'moderate':
      worseningThreshold = 48;
      break;
    case 'minor':
      worseningThreshold = 96;
      break;
  }
  
  // Environmental factors affect worsening
  if (environmentalScore < 2) {
    worseningThreshold *= 0.5; // Poor conditions worsen faster
  } else if (environmentalScore === 4) {
    worseningThreshold *= 1.5; // Good conditions slow worsening
  }
  
  if (hoursWithoutTreatment > worseningThreshold) {
    const severityLevels: TravellerConditionSeverity[] = ['minor', 'moderate', 'major', 'critical', 'terminal'];
    const currentIndex = severityLevels.indexOf(condition.severity);
    
    if (currentIndex < severityLevels.length - 1) {
      return {
        hasWorsened: true,
        newSeverity: severityLevels[currentIndex + 1],
        reason: `Condition worsened due to lack of treatment (${hoursWithoutTreatment} hours) and poor conditions`
      };
    }
  }
  
  return { hasWorsened: false, reason: 'Condition stable' };
};

export default {
  calculateCharacteristicHealing,
  calculateConditionRecovery,
  attemptMedicalTreatment,
  calculateTreatmentTime,
  checkConditionWorsening,
  NATURAL_HEALING_RATES,
  MEDICAL_TREATMENT,
  ACTIVITY_EFFECTS
};