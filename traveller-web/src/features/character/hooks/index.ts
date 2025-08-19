// Export all character hooks
export { useCharacterForm } from './useCharacterForm';
export { useCharacterStorage } from './useCharacterStorage';
export { useUndoRedo } from './useUndoRedo';
export { useAccessibility } from './useAccessibility';

// Notes management hooks
export { useNotes } from './useNotes';

// Condition management hooks
export { useConditions } from './useConditions';
export { 
  useCharacteristicsWithConditions, 
  useVitalityChecks,
  type EffectiveCharacteristics,
  type UseCharacteristicsWithConditionsReturn
} from './useCharacteristicsWithConditions';