/**
 * Error handling utilities for character creation system
 */

export class CharacterCreationError extends Error {
  constructor(
    message: string,
    public code: string,
    public context?: any
  ) {
    super(message);
    this.name = 'CharacterCreationError';
  }
}

export class ValidationError extends CharacterCreationError {
  constructor(message: string, public field?: string, context?: any) {
    super(message, 'VALIDATION_ERROR', context);
    this.name = 'ValidationError';
  }
}

export class StorageError extends CharacterCreationError {
  constructor(message: string, public operation: string, context?: any) {
    super(message, 'STORAGE_ERROR', context);
    this.name = 'StorageError';
  }
}

export class PDFGenerationError extends CharacterCreationError {
  constructor(message: string, public layout?: string, context?: any) {
    super(message, 'PDF_GENERATION_ERROR', context);
    this.name = 'PDFGenerationError';
  }
}

/**
 * Error handler for async operations with user notifications
 */
export const handleAsyncError = async <T>(
  operation: () => Promise<T>,
  errorContext: {
    operationName: string;
    showNotification?: (notification: {
      type: 'error' | 'warning' | 'info' | 'success';
      title: string;
      message: string;
    }) => void;
    fallbackMessage?: string;
  }
): Promise<T | null> => {
  try {
    return await operation();
  } catch (error) {
    console.error(`Error in ${errorContext.operationName}:`, error);
    
    let message = errorContext.fallbackMessage || 'An unexpected error occurred';
    let title = 'Error';

    if (error instanceof ValidationError) {
      title = 'Validation Error';
      message = error.message;
    } else if (error instanceof StorageError) {
      title = 'Storage Error';
      message = error.message;
    } else if (error instanceof PDFGenerationError) {
      title = 'PDF Generation Error';
      message = error.message;
    } else if (error instanceof Error) {
      message = error.message;
    }

    if (errorContext.showNotification) {
      errorContext.showNotification({
        type: 'error',
        title,
        message,
      });
    }

    return null;
  }
};

/**
 * Validation helper for character data
 */
export const validateCharacterData = (data: any): ValidationError[] => {
  const errors: ValidationError[] = [];

  // Basic info validation
  if (!data.name?.trim()) {
    errors.push(new ValidationError('Character name is required', 'name'));
  }

  if (data.name?.length > 100) {
    errors.push(new ValidationError('Character name must be 100 characters or less', 'name'));
  }

  if (!data.species) {
    errors.push(new ValidationError('Species is required', 'species'));
  }

  if (!data.gender?.trim()) {
    errors.push(new ValidationError('Gender is required', 'gender'));
  }

  if (data.age < 18 || data.age > 100) {
    errors.push(new ValidationError('Age must be between 18 and 100', 'age'));
  }

  // Characteristics validation
  if (data.characteristics) {
    const chars = data.characteristics;
    const charNames = ['strength', 'dexterity', 'endurance', 'intelligence', 'education', 'social'];
    
    charNames.forEach(charName => {
      const value = chars[charName];
      if (typeof value !== 'number' || value < 1 || value > 15) {
        errors.push(new ValidationError(
          `${charName} must be between 1 and 15`,
          `characteristics.${charName}`
        ));
      }
    });
  } else {
    errors.push(new ValidationError('Characteristics are required', 'characteristics'));
  }

  // Background validation
  if (!data.background?.homeworld?.trim()) {
    errors.push(new ValidationError('Homeworld is required', 'background.homeworld'));
  }

  if (!data.background?.socialClass) {
    errors.push(new ValidationError('Social class is required', 'background.socialClass'));
  }

  // Skills validation
  if (data.skills && Array.isArray(data.skills)) {
    data.skills.forEach((skill: any, index: number) => {
      if (!skill.name?.trim()) {
        errors.push(new ValidationError(
          `Skill ${index + 1} name is required`,
          `skills.${index}.name`
        ));
      }
      
      if (typeof skill.level !== 'number' || skill.level < 0 || skill.level > 10) {
        errors.push(new ValidationError(
          `Skill ${index + 1} level must be between 0 and 10`,
          `skills.${index}.level`
        ));
      }
    });
  }

  // Equipment validation
  if (data.equipment && Array.isArray(data.equipment)) {
    data.equipment.forEach((item: any, index: number) => {
      if (!item.name?.trim()) {
        errors.push(new ValidationError(
          `Equipment ${index + 1} name is required`,
          `equipment.${index}.name`
        ));
      }
      
      if (typeof item.quantity !== 'number' || item.quantity < 1) {
        errors.push(new ValidationError(
          `Equipment ${index + 1} quantity must be at least 1`,
          `equipment.${index}.quantity`
        ));
      }
      
      if (item.weight && (typeof item.weight !== 'number' || item.weight < 0)) {
        errors.push(new ValidationError(
          `Equipment ${index + 1} weight must be non-negative`,
          `equipment.${index}.weight`
        ));
      }
      
      if (item.cost && (typeof item.cost !== 'number' || item.cost < 0)) {
        errors.push(new ValidationError(
          `Equipment ${index + 1} cost must be non-negative`,
          `equipment.${index}.cost`
        ));
      }
    });
  }

  // Credits validation
  if (typeof data.startingCredits !== 'number' || data.startingCredits < 0) {
    errors.push(new ValidationError('Starting credits must be non-negative', 'startingCredits'));
  }

  return errors;
};

/**
 * Helper to check if character data is valid for a specific step
 */
export const validateStep = (data: any, step: number): ValidationError[] => {
  const errors: ValidationError[] = [];

  switch (step) {
    case 0: // Basic Info
      if (!data.name?.trim()) {
        errors.push(new ValidationError('Character name is required', 'name'));
      }
      if (!data.species) {
        errors.push(new ValidationError('Species is required', 'species'));
      }
      if (!data.gender?.trim()) {
        errors.push(new ValidationError('Gender is required', 'gender'));
      }
      if (data.age < 18 || data.age > 100) {
        errors.push(new ValidationError('Age must be between 18 and 100', 'age'));
      }
      break;

    case 1: // Characteristics
      if (!data.characteristics) {
        errors.push(new ValidationError('Characteristics are required', 'characteristics'));
      } else {
        const chars = data.characteristics;
        const charNames = ['strength', 'dexterity', 'endurance', 'intelligence', 'education', 'social'];
        
        charNames.forEach(charName => {
          const value = chars[charName];
          if (typeof value !== 'number' || value < 1 || value > 15) {
            errors.push(new ValidationError(
              `${charName} must be between 1 and 15`,
              `characteristics.${charName}`
            ));
          }
        });
      }
      break;

    case 2: // Background
      if (!data.background?.homeworld?.trim()) {
        errors.push(new ValidationError('Homeworld is required', 'background.homeworld'));
      }
      if (!data.background?.socialClass) {
        errors.push(new ValidationError('Social class is required', 'background.socialClass'));
      }
      break;

    case 3: // Career
      // Career validation is complex and handled by the career step component
      break;

    case 4: // Skills
      // Skills are generated during career progression
      break;

    case 5: // Equipment
      // Equipment validation
      if (data.equipment && Array.isArray(data.equipment)) {
        data.equipment.forEach((item: any, index: number) => {
          if (!item.name?.trim()) {
            errors.push(new ValidationError(
              `Equipment ${index + 1} name is required`,
              `equipment.${index}.name`
            ));
          }
        });
      }
      break;

    case 6: // Portrait
      // Portrait is optional
      break;

    case 7: // Review
      // Full validation
      return validateCharacterData(data);
  }

  return errors;
};

/**
 * Format validation errors for display
 */
export const formatValidationErrors = (errors: ValidationError[]): string => {
  if (errors.length === 0) return '';
  
  if (errors.length === 1) {
    return errors[0].message;
  }

  return `Please fix the following issues:\n${errors.map(e => `• ${e.message}`).join('\n')}`;
};

/**
 * Retry helper for failed operations
 */
export const withRetry = async <T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> => {
  let lastError: Error;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;
      
      if (attempt === maxRetries) {
        break;
      }

      // Wait before retry
      await new Promise(resolve => setTimeout(resolve, delay * attempt));
    }
  }

  throw lastError!;
};

/**
 * Network error detection and handling
 */
export const isNetworkError = (error: any): boolean => {
  return (
    error?.name === 'NetworkError' ||
    error?.message?.includes('network') ||
    error?.message?.includes('offline') ||
    error?.code === 'ENOTFOUND' ||
    error?.code === 'ECONNREFUSED'
  );
};

/**
 * Graceful degradation helper
 */
export const withFallback = async <T>(
  primaryOperation: () => Promise<T>,
  fallbackOperation: () => Promise<T> | T,
  errorContext?: string
): Promise<T> => {
  try {
    return await primaryOperation();
  } catch (error) {
    console.warn(`Primary operation failed${errorContext ? ` (${errorContext})` : ''}, using fallback:`, error);
    return await fallbackOperation();
  }
};