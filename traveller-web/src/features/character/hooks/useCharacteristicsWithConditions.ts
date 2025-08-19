/**
 * Hook for calculating effective characteristics with condition modifiers
 * Automatically applies condition penalties to character characteristics
 */

import { useMemo } from 'react';
import type { 
  CharacterCharacteristics, 
  StatusCondition,
  CharacteristicModifier 
} from '../types/characterSheet';
import { getConditionModifiers, calculateEffectiveCharacteristic } from '../types/characterSheet';

export interface EffectiveCharacteristics extends CharacterCharacteristics {
  // Original unmodified values
  original: CharacterCharacteristics;
  
  // Condition modifiers applied
  conditionModifiers: Partial<CharacterCharacteristics>;
  
  // Total modifiers from all sources
  totalModifiers: Partial<CharacterCharacteristics>;
  
  // Warning flags
  hasUnconsciousnessRisk: boolean;
  hasDeathRisk: boolean;
  criticallyLowCharacteristics: Array<keyof CharacterCharacteristics>;
}

export interface UseCharacteristicsWithConditionsReturn {
  effectiveCharacteristics: EffectiveCharacteristics;
  getEffectiveValue: (characteristic: keyof CharacterCharacteristics) => number;
  getConditionPenalty: (characteristic: keyof CharacterCharacteristics) => number;
  getTotalModifier: (characteristic: keyof CharacterCharacteristics) => number;
  isCharacteristicCritical: (characteristic: keyof CharacterCharacteristics) => boolean;
  getCharacteristicStatus: (characteristic: keyof CharacterCharacteristics) => {
    value: number;
    modifier: number;
    status: 'normal' | 'low' | 'critical' | 'unconscious' | 'dead';
    warning?: string;
  };
}

export const useCharacteristicsWithConditions = (
  baseCharacteristics: CharacterCharacteristics,
  conditions: StatusCondition[],
  additionalModifiers: Partial<CharacterCharacteristics> = {}
): UseCharacteristicsWithConditionsReturn => {

  // Calculate condition modifiers
  const conditionEffects = useMemo(() => 
    getConditionModifiers(conditions), 
    [conditions]
  );

  // Calculate effective characteristics
  const effectiveCharacteristics = useMemo((): EffectiveCharacteristics => {
    const conditionModifiers = conditionEffects.characteristics;
    const totalModifiers: Partial<CharacterCharacteristics> = {};
    const result = { ...baseCharacteristics } as EffectiveCharacteristics;
    
    // Combine all modifiers
    const characteristicKeys: Array<keyof CharacterCharacteristics> = [
      'strength', 'dexterity', 'endurance', 'intelligence', 'education', 'social'
    ];
    
    characteristicKeys.forEach(key => {
      const conditionMod = conditionModifiers[key] || 0;
      const additionalMod = additionalModifiers[key] || 0;
      const totalMod = conditionMod + additionalMod;
      
      totalModifiers[key] = totalMod;
      result[key] = Math.max(0, baseCharacteristics[key] + totalMod);
    });

    // Analyze for warnings
    const criticallyLowCharacteristics: Array<keyof CharacterCharacteristics> = [];
    let hasUnconsciousnessRisk = false;
    let hasDeathRisk = false;

    characteristicKeys.forEach(key => {
      const value = result[key];
      
      if (value <= 0) {
        hasDeathRisk = true;
        criticallyLowCharacteristics.push(key);
      } else if (value <= 1) {
        hasUnconsciousnessRisk = true;
        criticallyLowCharacteristics.push(key);
      } else if (value <= 3) {
        criticallyLowCharacteristics.push(key);
      }
    });

    // Physical characteristics at 0 = unconscious, any at 0 = potential death
    const physicalChars = ['strength', 'dexterity', 'endurance'] as const;
    if (physicalChars.some(char => result[char] <= 0)) {
      hasDeathRisk = true;
    }
    if (physicalChars.some(char => result[char] <= 1)) {
      hasUnconsciousnessRisk = true;
    }

    return {
      ...result,
      original: { ...baseCharacteristics },
      conditionModifiers,
      totalModifiers,
      hasUnconsciousnessRisk,
      hasDeathRisk,
      criticallyLowCharacteristics
    };
  }, [baseCharacteristics, conditionEffects.characteristics, additionalModifiers]);

  // Helper functions
  const getEffectiveValue = (characteristic: keyof CharacterCharacteristics): number => {
    return effectiveCharacteristics[characteristic];
  };

  const getConditionPenalty = (characteristic: keyof CharacterCharacteristics): number => {
    return effectiveCharacteristics.conditionModifiers[characteristic] || 0;
  };

  const getTotalModifier = (characteristic: keyof CharacterCharacteristics): number => {
    return effectiveCharacteristics.totalModifiers[characteristic] || 0;
  };

  const isCharacteristicCritical = (characteristic: keyof CharacterCharacteristics): boolean => {
    return effectiveCharacteristics.criticallyLowCharacteristics.includes(characteristic);
  };

  const getCharacteristicStatus = (characteristic: keyof CharacterCharacteristics) => {
    const value = getEffectiveValue(characteristic);
    const modifier = getTotalModifier(characteristic);
    
    let status: 'normal' | 'low' | 'critical' | 'unconscious' | 'dead' = 'normal';
    let warning: string | undefined;

    if (value <= 0) {
      status = 'dead';
      warning = 'Character death - characteristic reduced to 0 or below';
    } else if (value === 1) {
      status = 'unconscious';
      warning = 'Unconsciousness risk - characteristic critically low';
    } else if (value <= 3) {
      status = 'critical';
      warning = 'Critical condition - characteristic dangerously low';
    } else if (value <= 5) {
      status = 'low';
      warning = 'Low characteristic value may affect performance';
    }

    return {
      value,
      modifier,
      status,
      warning
    };
  };

  return {
    effectiveCharacteristics,
    getEffectiveValue,
    getConditionPenalty,
    getTotalModifier,
    isCharacteristicCritical,
    getCharacteristicStatus
  };
};

// Hook specifically for calculating unconsciousness and death checks
export const useVitalityChecks = (
  effectiveCharacteristics: EffectiveCharacteristics
) => {
  return useMemo(() => {
    const { strength, dexterity, endurance } = effectiveCharacteristics;
    
    // Traveller rules: Unconscious if any physical characteristic is 0
    // Dead if all three physical characteristics total 0 or less
    const isUnconscious = strength <= 0 || dexterity <= 0 || endurance <= 0;
    const isDead = (strength + dexterity + endurance) <= 0;
    
    // Risk assessment
    const unconsciousnessRisk = Math.min(strength, dexterity, endurance);
    const vitalityTotal = strength + dexterity + endurance;
    
    let riskLevel: 'none' | 'low' | 'moderate' | 'high' | 'critical' = 'none';
    
    if (isDead) {
      riskLevel = 'critical';
    } else if (isUnconscious) {
      riskLevel = 'critical';
    } else if (unconsciousnessRisk <= 1) {
      riskLevel = 'high';
    } else if (unconsciousnessRisk <= 3 || vitalityTotal <= 10) {
      riskLevel = 'moderate';
    } else if (unconsciousnessRisk <= 5 || vitalityTotal <= 15) {
      riskLevel = 'low';
    }
    
    return {
      isUnconscious,
      isDead,
      unconsciousnessRisk,
      vitalityTotal,
      riskLevel,
      needsImmediateAttention: riskLevel === 'critical' || riskLevel === 'high'
    };
  }, [effectiveCharacteristics]);
};

export default useCharacteristicsWithConditions;