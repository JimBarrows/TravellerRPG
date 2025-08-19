/**
 * Condition Management Hook for Traveller RPG
 * Handles condition application, tracking, effects calculation, and recovery
 */

import { useCallback, useMemo } from 'react';
import type { 
  StatusCondition, 
  ConditionStatus, 
  TravellerConditionTemplate,
  CharacterCharacteristics,
  CharacterSheetData,
  ConditionEffect
} from '../types/characterSheet';
import { TRAVELLER_CONDITIONS, SEVERITY_INFO } from '../data/conditions';
import { getCharacteristicModifier } from '../types/characterSheet';

export interface UseConditionsReturn {
  // Condition status and analysis
  conditionStatus: ConditionStatus;
  activeConditions: StatusCondition[];
  expiredConditions: StatusCondition[];
  
  // Condition effects
  totalPenalties: {
    characteristics: Partial<CharacterCharacteristics>;
    skills: Array<{ name: string; modifier: number }>;
    initiative: number;
    movement: number;
    endurance: number;
    healing: number;
    other: string[];
  };
  
  // Condition management
  addCondition: (template: string | TravellerConditionTemplate, customizations?: Partial<StatusCondition>) => StatusCondition;
  updateCondition: (conditionId: string, updates: Partial<StatusCondition>) => void;
  removeCondition: (conditionId: string) => void;
  
  // Recovery and healing
  attemptRecovery: (conditionId: string, skillModifier?: number, equipmentBonus?: number) => {
    success: boolean;
    result: string;
    conditionRemoved: boolean;
    conditionImproved: boolean;
  };
  progressNaturalHealing: (hoursElapsed: number) => StatusCondition[];
  
  // Condition queries
  getConditionsByType: (type: string) => StatusCondition[];
  getConditionsBySeverity: (severity: string) => StatusCondition[];
  hasCondition: (conditionName: string) => boolean;
  getCondition: (conditionId: string) => StatusCondition | undefined;
  
  // Validation and warnings
  getConditionWarnings: () => string[];
  validateConditionCompatibility: (newCondition: StatusCondition) => { compatible: boolean; warnings: string[] };
}

export const useConditions = (
  character: CharacterSheetData,
  onUpdate: (updates: Partial<CharacterSheetData>) => void
): UseConditionsReturn => {

  const conditions = character.conditions || [];

  // Calculate current condition status
  const conditionStatus = useMemo((): ConditionStatus => {
    const now = new Date();
    const activeConditions = conditions.filter(condition => 
      !condition.expiresAt || new Date(condition.expiresAt) > now
    );

    // Count by type
    const byType = activeConditions.reduce((acc, condition) => {
      acc[condition.type] = (acc[condition.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Count by severity
    const bySeverity = activeConditions.reduce((acc, condition) => {
      acc[condition.severity] = (acc[condition.severity] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Calculate total penalties
    const totalPenalties = calculateConditionEffects(activeConditions);

    // Categorize conditions
    const requiresImmediateAttention = activeConditions.filter(c => 
      c.severity === 'critical' || c.severity === 'terminal'
    );

    const treatable = activeConditions.filter(c => 
      c.recovery?.method === 'medical' || c.recovery?.method === 'surgery'
    );

    const naturallyHealing = activeConditions.filter(c =>
      c.recovery?.method === 'natural' && c.improvingNaturally
    );

    return {
      totalActive: activeConditions.length,
      byType: byType as Record<any, number>,
      bySeverity: bySeverity as Record<any, number>,
      totalPenalties,
      requiresImmediateAttention,
      treatable,
      naturallyHealing
    };
  }, [conditions]);

  // Separate active and expired conditions
  const activeConditions = useMemo(() => {
    const now = new Date();
    return conditions.filter(condition => 
      !condition.expiresAt || new Date(condition.expiresAt) > now
    );
  }, [conditions]);

  const expiredConditions = useMemo(() => {
    const now = new Date();
    return conditions.filter(condition => 
      condition.expiresAt && new Date(condition.expiresAt) <= now
    );
  }, [conditions]);

  // Calculate total condition effects
  const totalPenalties = useMemo(() => calculateConditionEffects(activeConditions), [activeConditions]);

  // Add a new condition
  const addCondition = useCallback((
    template: string | TravellerConditionTemplate, 
    customizations: Partial<StatusCondition> = {}
  ): StatusCondition => {
    const conditionTemplate = typeof template === 'string' 
      ? TRAVELLER_CONDITIONS[template.toUpperCase()]
      : template;
    
    if (!conditionTemplate) {
      throw new Error(`Unknown condition template: ${template}`);
    }

    const now = new Date().toISOString();
    const conditionId = crypto.randomUUID();

    // Calculate expiration if duration is specified
    let expiresAt: string | undefined;
    if (customizations.durationValue && conditionTemplate.defaultDuration !== 'permanent') {
      const expiration = new Date();
      switch (conditionTemplate.defaultDuration) {
        case 'rounds':
          expiration.setSeconds(expiration.getSeconds() + (customizations.durationValue * 6));
          break;
        case 'minutes':
          expiration.setMinutes(expiration.getMinutes() + customizations.durationValue);
          break;
        case 'hours':
          expiration.setHours(expiration.getHours() + customizations.durationValue);
          break;
        case 'days':
          expiration.setDate(expiration.getDate() + customizations.durationValue);
          break;
        case 'weeks':
          expiration.setDate(expiration.getDate() + (customizations.durationValue * 7));
          break;
      }
      expiresAt = expiration.toISOString();
    }

    const newCondition: StatusCondition = {
      id: conditionId,
      name: conditionTemplate.name,
      description: conditionTemplate.description,
      type: conditionTemplate.type,
      severity: customizations.severity || conditionTemplate.defaultSeverity,
      duration: customizations.duration || conditionTemplate.defaultDuration,
      effects: conditionTemplate.effects,
      appliedAt: now,
      expiresAt,
      recovery: conditionTemplate.recovery ? {
        method: conditionTemplate.recovery.method || 'natural',
        timeRequired: conditionTemplate.recovery.timeRequired || 1,
        timeUnit: conditionTemplate.recovery.timeUnit || 'days',
        difficulty: conditionTemplate.recovery.difficulty,
        skillRequired: conditionTemplate.recovery.skillRequired,
        equipmentRequired: conditionTemplate.recovery.equipmentRequired,
        costCredits: conditionTemplate.recovery.costCredits,
        successChance: conditionTemplate.recovery.successChance,
        criticalFailureEffect: conditionTemplate.recovery.criticalFailureEffect,
        notes: conditionTemplate.recovery.notes
      } : undefined,
      canWorsen: conditionTemplate.canWorsen,
      canImprove: conditionTemplate.canImprove,
      icon: conditionTemplate.icon,
      colorClass: conditionTemplate.colorClass,
      ...customizations,
      durationValue: customizations.durationValue
    };

    const updatedConditions = [...conditions, newCondition];
    onUpdate({ conditions: updatedConditions });

    return newCondition;
  }, [conditions, onUpdate]);

  // Update an existing condition
  const updateCondition = useCallback((conditionId: string, updates: Partial<StatusCondition>) => {
    const updatedConditions = conditions.map(condition =>
      condition.id === conditionId
        ? { ...condition, ...updates }
        : condition
    );
    onUpdate({ conditions: updatedConditions });
  }, [conditions, onUpdate]);

  // Remove a condition
  const removeCondition = useCallback((conditionId: string) => {
    const updatedConditions = conditions.filter(condition => condition.id !== conditionId);
    onUpdate({ conditions: updatedConditions });
  }, [conditions, onUpdate]);

  // Attempt recovery from a condition
  const attemptRecovery = useCallback((
    conditionId: string, 
    skillModifier: number = 0, 
    equipmentBonus: number = 0
  ) => {
    const condition = conditions.find(c => c.id === conditionId);
    if (!condition?.recovery) {
      return {
        success: false,
        result: 'No recovery method available for this condition',
        conditionRemoved: false,
        conditionImproved: false
      };
    }

    const recovery = condition.recovery;
    let success = false;
    let conditionRemoved = false;
    let conditionImproved = false;
    let result = '';

    // Calculate success chance
    if (recovery.difficulty) {
      // Skill-based recovery
      const skillValue = 0; // Would get from character skills
      const characteristicMod = recovery.skillRequired === 'Medic' 
        ? getCharacteristicModifier(character.characteristics.intelligence)
        : 0;
      
      const totalMod = skillValue + characteristicMod + skillModifier + equipmentBonus;
      const roll = Math.floor(Math.random() * 6) + Math.floor(Math.random() * 6) + 2; // 2d6
      const taskResult = roll + totalMod;
      
      success = taskResult >= recovery.difficulty;
      result = `Recovery attempt: ${roll} + ${totalMod} = ${taskResult} vs difficulty ${recovery.difficulty}. ${success ? 'Success!' : 'Failed.'}`;
    } else if (recovery.successChance) {
      // Percentage-based recovery
      const roll = Math.random() * 100;
      success = roll < recovery.successChance;
      result = `Recovery attempt: ${roll.toFixed(1)}% vs ${recovery.successChance}% chance. ${success ? 'Success!' : 'Failed.'}`;
    } else {
      // Automatic success for natural healing
      success = true;
      result = 'Natural healing progresses.';
    }

    if (success) {
      if (recovery.method === 'natural' || condition.severity === 'minor') {
        // Remove condition completely
        removeCondition(conditionId);
        conditionRemoved = true;
        result += ' Condition fully recovered.';
      } else {
        // Improve condition severity
        const severityLevels = ['minor', 'moderate', 'major', 'critical', 'terminal'];
        const currentIndex = severityLevels.indexOf(condition.severity);
        if (currentIndex > 0) {
          const newSeverity = severityLevels[currentIndex - 1] as any;
          updateCondition(conditionId, { severity: newSeverity });
          conditionImproved = true;
          result += ` Condition improved to ${newSeverity}.`;
        } else {
          removeCondition(conditionId);
          conditionRemoved = true;
          result += ' Condition fully recovered.';
        }
      }
    } else {
      // Handle failure
      if (recovery.criticalFailureEffect && roll === 2) {
        result += ` Critical failure: ${recovery.criticalFailureEffect}`;
        // Could worsen condition here
      }
      
      // Increment treatment attempts
      updateCondition(conditionId, { 
        treatmentAttempts: (condition.treatmentAttempts || 0) + 1 
      });
    }

    return {
      success,
      result,
      conditionRemoved,
      conditionImproved
    };
  }, [conditions, character.characteristics, removeCondition, updateCondition]);

  // Progress natural healing over time
  const progressNaturalHealing = useCallback((hoursElapsed: number): StatusCondition[] => {
    const healedConditions: StatusCondition[] = [];
    
    conditions.forEach(condition => {
      if (condition.recovery?.method === 'natural' && condition.improvingNaturally) {
        const recovery = condition.recovery;
        let timeUnitInHours = 1;
        
        switch (recovery.timeUnit) {
          case 'rounds': timeUnitInHours = 1/600; break; // 6 seconds
          case 'minutes': timeUnitInHours = 1/60; break;
          case 'hours': timeUnitInHours = 1; break;
          case 'days': timeUnitInHours = 24; break;
          case 'weeks': timeUnitInHours = 168; break;
        }
        
        const healingTime = recovery.timeRequired * timeUnitInHours;
        if (hoursElapsed >= healingTime) {
          // Natural healing completed
          removeCondition(condition.id);
          healedConditions.push(condition);
        }
      }
    });
    
    return healedConditions;
  }, [conditions, removeCondition]);

  // Query conditions by type
  const getConditionsByType = useCallback((type: string): StatusCondition[] => {
    return activeConditions.filter(condition => condition.type === type);
  }, [activeConditions]);

  // Query conditions by severity
  const getConditionsBySeverity = useCallback((severity: string): StatusCondition[] => {
    return activeConditions.filter(condition => condition.severity === severity);
  }, [activeConditions]);

  // Check if character has a specific condition
  const hasCondition = useCallback((conditionName: string): boolean => {
    return activeConditions.some(condition => 
      condition.name.toLowerCase() === conditionName.toLowerCase()
    );
  }, [activeConditions]);

  // Get specific condition by ID
  const getCondition = useCallback((conditionId: string): StatusCondition | undefined => {
    return conditions.find(condition => condition.id === conditionId);
  }, [conditions]);

  // Get warnings about dangerous conditions
  const getConditionWarnings = useCallback((): string[] => {
    const warnings: string[] = [];
    
    // Check for critical/terminal conditions
    const criticalConditions = activeConditions.filter(c => 
      c.severity === 'critical' || c.severity === 'terminal'
    );
    if (criticalConditions.length > 0) {
      warnings.push(`${criticalConditions.length} critical condition(s) require immediate attention!`);
    }
    
    // Check for bleeding
    if (hasCondition('Bleeding')) {
      warnings.push('Character is bleeding and losing Endurance!');
    }
    
    // Check for unconsciousness risk
    if (character.characteristics.endurance <= 2) {
      warnings.push('Low Endurance - risk of unconsciousness!');
    }
    
    // Check for condition interactions
    if (hasCondition('Exhausted') && hasCondition('Wounded')) {
      warnings.push('Exhaustion + wounds greatly increase recovery time!');
    }
    
    return warnings;
  }, [activeConditions, hasCondition, character.characteristics.endurance]);

  // Validate condition compatibility
  const validateConditionCompatibility = useCallback((
    newCondition: StatusCondition
  ): { compatible: boolean; warnings: string[] } => {
    const warnings: string[] = [];
    let compatible = true;
    
    // Check for conflicting conditions
    if (newCondition.name === 'Unconscious' && hasCondition('Panicked')) {
      warnings.push('Cannot be both unconscious and panicked');
      compatible = false;
    }
    
    // Check for redundant conditions
    if (hasCondition(newCondition.name)) {
      warnings.push('Character already has this condition');
      compatible = false;
    }
    
    // Check for condition limits
    const sameTypeConditions = getConditionsByType(newCondition.type);
    if (sameTypeConditions.length >= 5) {
      warnings.push(`Too many ${newCondition.type} conditions (max 5)`);
      compatible = false;
    }
    
    return { compatible, warnings };
  }, [hasCondition, getConditionsByType]);

  return {
    conditionStatus,
    activeConditions,
    expiredConditions,
    totalPenalties,
    addCondition,
    updateCondition,
    removeCondition,
    attemptRecovery,
    progressNaturalHealing,
    getConditionsByType,
    getConditionsBySeverity,
    hasCondition,
    getCondition,
    getConditionWarnings,
    validateConditionCompatibility
  };
};

// Helper function to calculate combined effects of all active conditions
function calculateConditionEffects(conditions: StatusCondition[]) {
  const result = {
    characteristics: {} as Partial<CharacterCharacteristics>,
    skills: [] as Array<{ name: string; modifier: number }>,
    initiative: 0,
    movement: 0,
    endurance: 0,
    healing: 0,
    other: [] as string[]
  };

  conditions.forEach(condition => {
    condition.effects.forEach(effect => {
      switch (effect.type) {
        case 'characteristic':
          if (effect.target === 'all') {
            // Apply to all characteristics
            const charKeys: (keyof CharacterCharacteristics)[] = [
              'strength', 'dexterity', 'endurance', 'intelligence', 'education', 'social'
            ];
            charKeys.forEach(key => {
              result.characteristics[key] = (result.characteristics[key] || 0) + effect.modifier;
            });
          } else if (effect.target === 'all_physical') {
            // Apply to physical characteristics
            ['strength', 'dexterity', 'endurance'].forEach(key => {
              const charKey = key as keyof CharacterCharacteristics;
              result.characteristics[charKey] = (result.characteristics[charKey] || 0) + effect.modifier;
            });
          } else if (effect.target === 'all_mental') {
            // Apply to mental characteristics
            ['intelligence', 'education'].forEach(key => {
              const charKey = key as keyof CharacterCharacteristics;
              result.characteristics[charKey] = (result.characteristics[charKey] || 0) + effect.modifier;
            });
          } else if (effect.target) {
            // Apply to specific characteristic
            const charKey = effect.target as keyof CharacterCharacteristics;
            if (charKey in result.characteristics) {
              result.characteristics[charKey] = (result.characteristics[charKey] || 0) + effect.modifier;
            }
          }
          break;

        case 'skill':
          if (effect.target) {
            const existingSkill = result.skills.find(s => s.name === effect.target);
            if (existingSkill && effect.stackable) {
              existingSkill.modifier += effect.modifier;
            } else if (!existingSkill) {
              result.skills.push({ name: effect.target, modifier: effect.modifier });
            }
          }
          break;

        case 'initiative':
          result.initiative += effect.modifier;
          break;

        case 'movement':
          if (effect.percentage) {
            // Percentage reduction
            result.movement = Math.min(result.movement, 100 - effect.percentage);
          } else {
            result.movement += effect.modifier;
          }
          break;

        case 'endurance':
          result.endurance += effect.modifier;
          break;

        case 'healing':
          result.healing += effect.modifier;
          break;

        case 'special':
          result.other.push(effect.description);
          break;
      }
    });
  });

  return result;
}

export default useConditions;