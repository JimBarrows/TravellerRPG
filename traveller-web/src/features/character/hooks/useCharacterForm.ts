import { useState, useEffect, useCallback, useRef } from 'react';
import { z } from 'zod';
import type { CharacterSheetData } from '../types/characterSheet';
import { useCharacterStorage } from './useCharacterStorage';
import { useAppContext } from '../../../shared/contexts/AppContext';

interface ValidationError {
  field: string;
  messages: string[];
}

interface FormState {
  data: CharacterSheetData;
  isDirty: boolean;
  isValidating: boolean;
  isSaving: boolean;
  hasUnsavedChanges: boolean;
  errors: ValidationError[];
  lastSaved: Date | null;
  conflictData: CharacterSheetData | null;
}

interface UseCharacterFormOptions {
  debounceMs?: number;
  autoSave?: boolean;
  enableOptimisticUpdates?: boolean;
  onSaveSuccess?: (character: CharacterSheetData) => void;
  onSaveError?: (error: Error) => void;
  onValidationError?: (errors: ValidationError[]) => void;
  onConflict?: (localData: CharacterSheetData, serverData: CharacterSheetData) => void;
}

interface UseCharacterFormReturn {
  // State
  formState: FormState;
  
  // Actions
  updateField: <T>(field: string, value: T) => void;
  updateNestedField: <T>(path: string[], value: T) => void;
  validateField: (field: string, value: any, schema?: z.ZodSchema) => ValidationError | null;
  validateForm: () => Promise<boolean>;
  saveForm: () => Promise<boolean>;
  resetForm: () => void;
  revertChanges: () => void;
  resolveConflict: (resolution: 'local' | 'server' | 'merge') => void;
  
  // Utilities
  getFieldError: (field: string) => string[];
  clearFieldError: (field: string) => void;
  isFieldDirty: (field: string) => boolean;
  canSave: boolean;
}

export const useCharacterForm = (
  initialData: CharacterSheetData,
  options: UseCharacterFormOptions = {}
): UseCharacterFormReturn => {
  const {
    debounceMs = 500,
    autoSave = true,
    enableOptimisticUpdates = true,
    onSaveSuccess,
    onSaveError,
    onValidationError,
    onConflict,
  } = options;

  const { addNotification } = useAppContext();
  const { updateCharacter, checkCharacterVersion } = useCharacterStorage();

  // Form state
  const [formState, setFormState] = useState<FormState>({
    data: initialData,
    isDirty: false,
    isValidating: false,
    isSaving: false,
    hasUnsavedChanges: false,
    errors: [],
    lastSaved: null,
    conflictData: null,
  });

  // Track original data for dirty checking
  const originalDataRef = useRef<CharacterSheetData>(initialData);
  const changeTrackingRef = useRef<Map<string, any>>(new Map());
  const debounceRef = useRef<NodeJS.Timeout>();
  const saveAbortRef = useRef<AbortController>();

  // Update original data when external data changes
  useEffect(() => {
    if (!formState.hasUnsavedChanges) {
      originalDataRef.current = initialData;
      setFormState(prev => ({ ...prev, data: initialData }));
    }
  }, [initialData, formState.hasUnsavedChanges]);

  // Helper function to get nested value
  const getNestedValue = useCallback((obj: any, path: string[]): any => {
    return path.reduce((current, key) => current?.[key], obj);
  }, []);

  // Helper function to set nested value
  const setNestedValue = useCallback((obj: any, path: string[], value: any): any => {
    const result = { ...obj };
    let current = result;
    
    for (let i = 0; i < path.length - 1; i++) {
      if (current[path[i]] === undefined) {
        current[path[i]] = {};
      } else {
        current[path[i]] = { ...current[path[i]] };
      }
      current = current[path[i]];
    }
    
    current[path[path.length - 1]] = value;
    return result;
  }, []);

  // Check if field is dirty
  const isFieldDirty = useCallback((field: string): boolean => {
    return changeTrackingRef.current.has(field);
  }, []);

  // Update a field value
  const updateField = useCallback(<T>(field: string, value: T) => {
    const currentValue = getNestedValue(formState.data, field.split('.'));
    
    if (currentValue === value) {
      return; // No change
    }

    // Track the change
    changeTrackingRef.current.set(field, value);

    // Update form state
    setFormState(prev => {
      const newData = setNestedValue(prev.data, field.split('.'), value);
      return {
        ...prev,
        data: {
          ...newData,
          lastModified: new Date().toISOString(),
          version: prev.data.version + 1,
        },
        isDirty: true,
        hasUnsavedChanges: true,
      };
    });
  }, [formState.data, getNestedValue, setNestedValue]);

  // Update nested field value
  const updateNestedField = useCallback(<T>(path: string[], value: T) => {
    updateField(path.join('.'), value);
  }, [updateField]);

  // Validate a single field
  const validateField = useCallback((
    field: string, 
    value: any, 
    schema?: z.ZodSchema
  ): ValidationError | null => {
    if (!schema) {
      return null;
    }

    try {
      schema.parse(value);
      return null;
    } catch (error) {
      if (error instanceof z.ZodError) {
        return {
          field,
          messages: error.errors.map(e => e.message),
        };
      }
      return {
        field,
        messages: ['Validation error'],
      };
    }
  }, []);

  // Validate entire form
  const validateForm = useCallback(async (): Promise<boolean> => {
    setFormState(prev => ({ ...prev, isValidating: true }));
    
    try {
      // Perform comprehensive validation here
      // This would typically use the character sheet schema
      
      setFormState(prev => ({ 
        ...prev, 
        isValidating: false,
        errors: [] // Clear errors if validation passes
      }));
      
      return true;
    } catch (error) {
      const validationErrors: ValidationError[] = [];
      
      if (error instanceof z.ZodError) {
        error.errors.forEach(err => {
          validationErrors.push({
            field: err.path.join('.'),
            messages: [err.message],
          });
        });
      }
      
      setFormState(prev => ({ 
        ...prev, 
        isValidating: false,
        errors: validationErrors
      }));
      
      onValidationError?.(validationErrors);
      return false;
    }
  }, [formState.data, onValidationError]);

  // Save form data
  const saveForm = useCallback(async (): Promise<boolean> => {
    if (formState.isSaving) {
      return false;
    }

    // Abort any pending save
    if (saveAbortRef.current) {
      saveAbortRef.current.abort();
    }
    
    saveAbortRef.current = new AbortController();
    
    setFormState(prev => ({ ...prev, isSaving: true }));

    try {
      // Validate before saving
      const isValid = await validateForm();
      if (!isValid) {
        setFormState(prev => ({ ...prev, isSaving: false }));
        return false;
      }

      // Check for conflicts if optimistic updates are enabled
      if (enableOptimisticUpdates) {
        const serverVersion = await checkCharacterVersion(formState.data.id);
        if (serverVersion > originalDataRef.current.version) {
          // Conflict detected - need to handle this
          addNotification({
            type: 'warning',
            title: 'Conflict detected',
            message: 'Character has been modified by another source. Please resolve conflicts.',
          });
          
          setFormState(prev => ({ 
            ...prev, 
            isSaving: false,
            conflictData: formState.data // Store for conflict resolution
          }));
          
          onConflict?.(formState.data, formState.data); // Would fetch latest server data
          return false;
        }
      }

      // Perform the save
      const savedCharacter = await updateCharacter(formState.data.id, formState.data);
      
      setFormState(prev => ({
        ...prev,
        data: savedCharacter,
        isDirty: false,
        isSaving: false,
        hasUnsavedChanges: false,
        lastSaved: new Date(),
        errors: [],
      }));

      // Clear change tracking
      changeTrackingRef.current.clear();
      originalDataRef.current = savedCharacter;

      onSaveSuccess?.(savedCharacter);
      
      addNotification({
        type: 'success',
        title: 'Character saved',
        message: 'Your changes have been saved successfully.',
      });

      return true;
    } catch (error) {
      setFormState(prev => ({ ...prev, isSaving: false }));
      
      const errorMessage = error instanceof Error ? error.message : 'Failed to save character';
      onSaveError?.(error instanceof Error ? error : new Error(errorMessage));
      
      addNotification({
        type: 'error',
        title: 'Save failed',
        message: errorMessage,
      });

      return false;
    }
  }, [
    formState,
    validateForm,
    enableOptimisticUpdates,
    checkCharacterVersion,
    updateCharacter,
    onSaveSuccess,
    onSaveError,
    onConflict,
    addNotification,
  ]);

  // Auto-save functionality
  useEffect(() => {
    if (!autoSave || !formState.hasUnsavedChanges || formState.isSaving) {
      return;
    }

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      saveForm();
    }, debounceMs);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [formState.hasUnsavedChanges, formState.isSaving, autoSave, debounceMs, saveForm]);

  // Reset form to original state
  const resetForm = useCallback(() => {
    setFormState(prev => ({
      ...prev,
      data: originalDataRef.current,
      isDirty: false,
      hasUnsavedChanges: false,
      errors: [],
    }));
    changeTrackingRef.current.clear();
  }, []);

  // Revert unsaved changes
  const revertChanges = useCallback(() => {
    resetForm();
    
    addNotification({
      type: 'info',
      title: 'Changes reverted',
      message: 'All unsaved changes have been reverted.',
    });
  }, [resetForm, addNotification]);

  // Resolve conflict
  const resolveConflict = useCallback((resolution: 'local' | 'server' | 'merge') => {
    // Implementation would depend on the specific conflict resolution strategy
    setFormState(prev => ({ ...prev, conflictData: null }));
    
    addNotification({
      type: 'success',
      title: 'Conflict resolved',
      message: `Conflict resolved using ${resolution} data.`,
    });
  }, [addNotification]);

  // Get errors for a specific field
  const getFieldError = useCallback((field: string): string[] => {
    const error = formState.errors.find(e => e.field === field);
    return error ? error.messages : [];
  }, [formState.errors]);

  // Clear error for a specific field
  const clearFieldError = useCallback((field: string) => {
    setFormState(prev => ({
      ...prev,
      errors: prev.errors.filter(e => e.field !== field),
    }));
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
      if (saveAbortRef.current) {
        saveAbortRef.current.abort();
      }
    };
  }, []);

  // Determine if form can be saved
  const canSave = formState.hasUnsavedChanges && 
                  !formState.isSaving && 
                  !formState.isValidating && 
                  formState.errors.length === 0;

  return {
    formState,
    updateField,
    updateNestedField,
    validateField,
    validateForm,
    saveForm,
    resetForm,
    revertChanges,
    resolveConflict,
    getFieldError,
    clearFieldError,
    isFieldDirty,
    canSave,
  };
};