/**
 * Condition Utilities for Traveller RPG
 * Helper functions for condition management, calculations, and rule enforcement
 */

import type { 
  StatusCondition, 
  CharacterCharacteristics,
  TravellerConditionSeverity,
  TravellerConditionType,
  ConditionEffect
} from '../types/characterSheet';
import { SEVERITY_INFO, DURATION_INFO } from '../data/conditions';

/**
 * Calculate the effective DM penalty from a condition based on Traveller rules
 */
export const getConditionDMPenalty = (condition: StatusCondition): number => {
  const severityPenalties = {
    minor: -1,
    moderate: -2, 
    major: -3,
    critical: -4,
    terminal: -5
  };
  
  return severityPenalties[condition.severity] || 0;
};

/**
 * Determine if a condition affects a specific task or skill
 */
export const conditionAffectsTask = (
  condition: StatusCondition, 
  taskType: 'physical' | 'mental' | 'social', 
  specificSkill?: string
): boolean => {
  return condition.effects.some(effect => {
    switch (effect.type) {
      case 'characteristic':
        if (effect.target === 'all') return true;
        if (taskType === 'physical' && effect.target === 'all_physical') return true;
        if (taskType === 'mental' && effect.target === 'all_mental') return true;
        if (taskType === 'social' && effect.target === 'social') return true;
        break;
        
      case 'skill':
        return specificSkill && effect.target === specificSkill;
        
      case 'special':
        // Special effects might affect various tasks - would need more specific logic
        return effect.description.toLowerCase().includes(taskType);
        
      default:
        return false;
    }
  });
};

/**
 * Calculate characteristic damage from injury conditions
 */
export const calculateCharacteristicDamage = (
  conditions: StatusCondition[],
  characteristic: keyof CharacterCharacteristics
): number => {
  return conditions.reduce((damage, condition) => {
    const effect = condition.effects.find(e => 
      e.type === 'characteristic' && 
      (e.target === characteristic || e.target === 'all' || 
       (characteristic === 'strength' || characteristic === 'dexterity' || characteristic === 'endurance') && e.target === 'all_physical' ||
       (characteristic === 'intelligence' || characteristic === 'education') && e.target === 'all_mental')
    );
    
    return damage + (effect ? Math.abs(effect.modifier) : 0);
  }, 0);
};

/**
 * Determine unconsciousness risk based on conditions and characteristics
 */
export const getUnconsciousnessRisk = (
  characteristics: CharacterCharacteristics,
  conditions: StatusCondition[]
): { risk: 'none' | 'low' | 'moderate' | 'high' | 'imminent'; reason: string } => {
  // Check for unconscious condition
  if (conditions.some(c => c.name === 'Unconscious')) {
    return { risk: 'imminent', reason: 'Already unconscious' };
  }
  
  // Check characteristic levels (0 = unconscious in Traveller)
  const minCharacteristic = Math.min(
    characteristics.strength,
    characteristics.dexterity, 
    characteristics.endurance
  );
  
  if (minCharacteristic <= 0) {
    return { risk: 'imminent', reason: 'Physical characteristic at 0' };
  }
  
  if (minCharacteristic <= 1) {
    return { risk: 'high', reason: 'Physical characteristic critically low' };
  }
  
  if (minCharacteristic <= 3) {
    return { risk: 'moderate', reason: 'Physical characteristic dangerously low' };
  }
  
  // Check for conditions that can cause unconsciousness
  const dangerousConditions = conditions.filter(c => 
    c.severity === 'critical' || c.severity === 'terminal' ||
    c.name === 'Bleeding' || c.name === 'Vacuum Exposure'
  );
  
  if (dangerousConditions.length > 0) {
    return { risk: 'moderate', reason: 'Critical conditions present' };
  }
  
  if (minCharacteristic <= 5) {
    return { risk: 'low', reason: 'Physical characteristics somewhat low' };
  }
  
  return { risk: 'none', reason: 'No immediate risk' };
};

/**
 * Calculate recovery time for a condition
 */
export const calculateRecoveryTime = (condition: StatusCondition): string => {
  if (!condition.recovery) {
    return 'No recovery method';
  }
  
  const recovery = condition.recovery;
  const timeInfo = DURATION_INFO[recovery.timeUnit];
  
  let baseTime = `${recovery.timeRequired} ${timeInfo.label.toLowerCase()}`;
  
  // Adjust for severity
  const severityMultipliers = {
    minor: 1,
    moderate: 1.5,
    major: 2,
    critical: 3,
    terminal: 5
  };
  
  const multiplier = severityMultipliers[condition.severity] || 1;
  if (multiplier > 1) {
    const adjustedTime = Math.ceil(recovery.timeRequired * multiplier);
    baseTime = `${adjustedTime} ${timeInfo.label.toLowerCase()}`;
  }
  
  return baseTime;
};

/**
 * Get condition priority for display sorting
 */
export const getConditionPriority = (condition: StatusCondition): number => {
  const severityPriorities = SEVERITY_INFO;
  let priority = severityPriorities[condition.severity].priority * 1000;
  
  // Add type priorities
  const typePriorities = {
    physical: 100,
    medical: 90,
    environmental: 80,
    mental: 70,
    fatigue: 60,
    social: 50,
    aging: 40,
    augmentation: 30
  };
  
  priority += typePriorities[condition.type] || 0;
  
  // Boost priority for certain conditions
  if (condition.name === 'Unconscious') priority += 10000;
  if (condition.name === 'Bleeding') priority += 5000;
  if (condition.name === 'Vacuum Exposure') priority += 5000;
  
  return priority;
};

/**
 * Sort conditions by priority (most urgent first)
 */
export const sortConditionsByPriority = (conditions: StatusCondition[]): StatusCondition[] => {
  return [...conditions].sort((a, b) => getConditionPriority(b) - getConditionPriority(a));
};

/**
 * Check if two conditions are compatible
 */
export const areConditionsCompatible = (condition1: StatusCondition, condition2: StatusCondition): boolean => {
  // Incompatible condition pairs
  const incompatiblePairs = [
    ['Unconscious', 'Panicked'],
    ['Unconscious', 'Confused'],
    ['Extreme Cold', 'Extreme Heat'],
  ];
  
  return !incompatiblePairs.some(pair =>
    (pair.includes(condition1.name) && pair.includes(condition2.name))
  );
};

/**
 * Generate condition warnings and alerts
 */
export const generateConditionAlerts = (
  conditions: StatusCondition[],
  characteristics: CharacterCharacteristics
): { type: 'danger' | 'warning' | 'info'; message: string }[] => {
  const alerts: { type: 'danger' | 'warning' | 'info'; message: string }[] = [];
  
  // Critical conditions
  const critical = conditions.filter(c => c.severity === 'critical' || c.severity === 'terminal');
  if (critical.length > 0) {
    alerts.push({
      type: 'danger',
      message: `${critical.length} critical condition(s) require immediate medical attention!`
    });
  }
  
  // Bleeding condition
  if (conditions.some(c => c.name === 'Bleeding')) {
    alerts.push({
      type: 'danger',
      message: 'Character is bleeding and losing Endurance - stabilize immediately!'
    });
  }
  
  // Low characteristics warning
  const lowCharacteristic = Object.entries(characteristics).find(([_, value]) => value <= 2);
  if (lowCharacteristic) {
    alerts.push({
      type: 'danger',
      message: `${lowCharacteristic[0]} is critically low (${lowCharacteristic[1]}) - unconsciousness risk!`
    });
  }
  
  // Multiple conditions warning
  if (conditions.length >= 5) {
    alerts.push({
      type: 'warning',
      message: `Character has ${conditions.length} active conditions - consider recovery time`
    });
  }
  
  // Fatigue conditions
  const fatigue = conditions.filter(c => c.type === 'fatigue');
  if (fatigue.length >= 2) {
    alerts.push({
      type: 'warning',
      message: 'Multiple fatigue conditions - extended rest required'
    });
  }
  
  // Environmental hazards
  const environmental = conditions.filter(c => c.type === 'environmental');
  if (environmental.length > 0) {
    alerts.push({
      type: 'warning',
      message: 'Environmental hazard conditions - remove from danger source'
    });
  }
  
  return alerts;
};

/**
 * Calculate the total medical treatment cost for all conditions
 */
export const calculateTotalTreatmentCost = (conditions: StatusCondition[]): number => {
  return conditions.reduce((total, condition) => {
    return total + (condition.recovery?.costCredits || 0);
  }, 0);
};

/**
 * Get suggested treatment order for multiple conditions
 */
export const getSuggestedTreatmentOrder = (conditions: StatusCondition[]): {
  condition: StatusCondition;
  reason: string;
  urgency: 'immediate' | 'urgent' | 'moderate' | 'low';
}[] => {
  const treatmentPlan = conditions.map(condition => {
    let urgency: 'immediate' | 'urgent' | 'moderate' | 'low' = 'low';
    let reason = 'Standard treatment';
    
    if (condition.severity === 'terminal') {
      urgency = 'immediate';
      reason = 'Life-threatening condition';
    } else if (condition.severity === 'critical' || condition.name === 'Bleeding') {
      urgency = 'immediate';
      reason = 'Critical condition requiring immediate intervention';
    } else if (condition.name === 'Vacuum Exposure' || condition.name === 'Poisoned') {
      urgency = 'urgent';
      reason = 'Condition will worsen without treatment';
    } else if (condition.canWorsen) {
      urgency = 'urgent';
      reason = 'Condition may deteriorate over time';
    } else if (condition.severity === 'major') {
      urgency = 'moderate';
      reason = 'Significant impairment to character function';
    }
    
    return { condition, reason, urgency };
  });
  
  // Sort by urgency
  const urgencyOrder = { immediate: 4, urgent: 3, moderate: 2, low: 1 };
  return treatmentPlan.sort((a, b) => urgencyOrder[b.urgency] - urgencyOrder[a.urgency]);
};

/**
 * Format condition duration for display
 */
export const formatConditionDuration = (condition: StatusCondition): string => {
  if (condition.duration === 'permanent') {
    return 'Permanent';
  }
  
  if (condition.expiresAt) {
    const now = new Date();
    const expires = new Date(condition.expiresAt);
    const diff = expires.getTime() - now.getTime();
    
    if (diff <= 0) {
      return 'Expired';
    }
    
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (days > 0) {
      return `${days} day${days !== 1 ? 's' : ''} remaining`;
    } else if (hours > 0) {
      return `${hours} hour${hours !== 1 ? 's' : ''} remaining`;
    } else {
      return `${minutes} minute${minutes !== 1 ? 's' : ''} remaining`;
    }
  }
  
  if (condition.durationValue) {
    const durationInfo = DURATION_INFO[condition.duration];
    return `${condition.durationValue} ${durationInfo.label.toLowerCase()}`;
  }
  
  return DURATION_INFO[condition.duration].label;
};

/**
 * Check if a condition can be treated with available resources
 */
export const canTreatCondition = (
  condition: StatusCondition,
  availableSkills: string[],
  availableEquipment: string[],
  availableCredits: number
): { canTreat: boolean; missing: string[] } => {
  if (!condition.recovery) {
    return { canTreat: false, missing: ['No treatment method available'] };
  }
  
  const missing: string[] = [];
  const recovery = condition.recovery;
  
  // Check skill requirement
  if (recovery.skillRequired && !availableSkills.includes(recovery.skillRequired)) {
    missing.push(`${recovery.skillRequired} skill`);
  }
  
  // Check equipment requirements
  if (recovery.equipmentRequired) {
    recovery.equipmentRequired.forEach(equipment => {
      if (!availableEquipment.includes(equipment)) {
        missing.push(equipment);
      }
    });
  }
  
  // Check credit cost
  if (recovery.costCredits && availableCredits < recovery.costCredits) {
    missing.push(`${recovery.costCredits - availableCredits} additional credits`);
  }
  
  return { canTreat: missing.length === 0, missing };
};

/**
 * Generate condition summary for character overview
 */
export const generateConditionSummary = (conditions: StatusCondition[]): string => {
  if (conditions.length === 0) {
    return 'Healthy - no active conditions';
  }
  
  const bySeverity = conditions.reduce((acc, condition) => {
    acc[condition.severity] = (acc[condition.severity] || 0) + 1;
    return acc;
  }, {} as Record<TravellerConditionSeverity, number>);
  
  const parts: string[] = [];
  
  if (bySeverity.terminal) parts.push(`${bySeverity.terminal} terminal`);
  if (bySeverity.critical) parts.push(`${bySeverity.critical} critical`);
  if (bySeverity.major) parts.push(`${bySeverity.major} major`);
  if (bySeverity.moderate) parts.push(`${bySeverity.moderate} moderate`);
  if (bySeverity.minor) parts.push(`${bySeverity.minor} minor`);
  
  return `${conditions.length} active condition${conditions.length !== 1 ? 's' : ''}: ${parts.join(', ')}`;
};

export default {
  getConditionDMPenalty,
  conditionAffectsTask,
  calculateCharacteristicDamage,
  getUnconsciousnessRisk,
  calculateRecoveryTime,
  getConditionPriority,
  sortConditionsByPriority,
  areConditionsCompatible,
  generateConditionAlerts,
  calculateTotalTreatmentCost,
  getSuggestedTreatmentOrder,
  formatConditionDuration,
  canTreatCondition,
  generateConditionSummary
};