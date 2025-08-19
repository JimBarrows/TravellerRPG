import React, { useState, useEffect, useCallback, useRef } from 'react';
import { z } from 'zod';
import Input from '../../../../shared/components/atoms/Input';

interface EditableTextProps {
  value: string;
  onChange: (value: string) => void;
  onValidation?: (isValid: boolean, errors: string[]) => void;
  validation?: z.ZodSchema<string>;
  placeholder?: string;
  disabled?: boolean;
  readonly?: boolean;
  maxLength?: number;
  className?: string;
  autoSave?: boolean;
  debounceMs?: number;
  onFocus?: () => void;
  onBlur?: () => void;
  required?: boolean;
  label?: string;
  id?: string;
  'aria-describedby'?: string;
}

const EditableText: React.FC<EditableTextProps> = ({
  value,
  onChange,
  onValidation,
  validation,
  placeholder,
  disabled = false,
  readonly = false,
  maxLength,
  className,
  autoSave = true,
  debounceMs = 300,
  onFocus,
  onBlur,
  required = false,
  label,
  id,
  'aria-describedby': ariaDescribedBy,
}) => {
  const [localValue, setLocalValue] = useState(value);
  const [errors, setErrors] = useState<string[]>([]);
  const [isValid, setIsValid] = useState(true);
  const [isDirty, setIsDirty] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const debounceRef = useRef<NodeJS.Timeout>();
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync external value changes
  useEffect(() => {
    if (value !== localValue && !isDirty) {
      setLocalValue(value);
    }
  }, [value, localValue, isDirty]);

  // Validation function
  const validateValue = useCallback((val: string) => {
    if (!validation) {
      setErrors([]);
      setIsValid(true);
      onValidation?.(true, []);
      return;
    }

    setIsValidating(true);
    
    try {
      validation.parse(val);
      setErrors([]);
      setIsValid(true);
      onValidation?.(true, []);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errorMessages = error.errors.map(e => e.message);
        setErrors(errorMessages);
        setIsValid(false);
        onValidation?.(false, errorMessages);
      }
    } finally {
      setIsValidating(false);
    }
  }, [validation, onValidation]);

  // Debounced validation and auto-save
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      validateValue(localValue);
      
      if (autoSave && isDirty && localValue !== value) {
        onChange(localValue);
        setIsDirty(false);
      }
    }, debounceMs);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [localValue, autoSave, isDirty, value, onChange, debounceMs, validateValue]);

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setLocalValue(newValue);
    setIsDirty(true);
  };

  // Handle blur - force save if auto-save is disabled
  const handleBlur = () => {
    if (!autoSave && isDirty) {
      onChange(localValue);
      setIsDirty(false);
    }
    onBlur?.();
  };

  // Handle Enter key - force save
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      onChange(localValue);
      setIsDirty(false);
      inputRef.current?.blur();
    }
    
    if (e.key === 'Escape') {
      e.preventDefault();
      setLocalValue(value);
      setIsDirty(false);
      inputRef.current?.blur();
    }
  };

  // Generate unique IDs for accessibility
  const inputId = id || `editable-text-${Math.random().toString(36).substr(2, 9)}`;
  const errorId = `${inputId}-error`;
  const helpTextId = ariaDescribedBy || `${inputId}-help`;

  // Combine class names for styling
  const inputClassName = `
    ${className || ''}
    ${errors.length > 0 ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}
    ${isDirty ? 'border-yellow-400' : ''}
    ${isValidating ? 'animate-pulse' : ''}
  `.trim();

  return (
    <div className="space-y-1">
      {label && (
        <label 
          htmlFor={inputId}
          className={`block text-sm font-medium ${required ? 'after:content-["*"] after:text-red-500' : ''}`}
        >
          {label}
        </label>
      )}
      
      <div className="relative">
        <Input
          ref={inputRef}
          id={inputId}
          value={localValue}
          onChange={handleInputChange}
          onFocus={onFocus}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          readOnly={readonly}
          maxLength={maxLength}
          className={inputClassName}
          aria-invalid={!isValid}
          aria-describedby={`${errors.length > 0 ? errorId : ''} ${helpTextId}`.trim()}
          aria-required={required}
        />
        
        {/* Validation status indicator */}
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
          {isValidating && (
            <div 
              className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"
              aria-label="Validating"
            />
          )}
          {!isValidating && isDirty && isValid && (
            <div 
              className="w-4 h-4 text-green-500"
              aria-label="Valid"
            >
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          )}
          {!isValidating && errors.length > 0 && (
            <div 
              className="w-4 h-4 text-red-500"
              aria-label="Invalid"
            >
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
          )}
        </div>
      </div>

      {/* Error messages */}
      {errors.length > 0 && (
        <div 
          id={errorId}
          className="space-y-1"
          role="alert"
          aria-live="polite"
        >
          {errors.map((error, index) => (
            <p key={index} className="text-sm text-red-600">
              {error}
            </p>
          ))}
        </div>
      )}

      {/* Help text */}
      {maxLength && (
        <p 
          id={helpTextId}
          className="text-xs text-muted-foreground"
        >
          {localValue.length}/{maxLength} characters
          {isDirty && !autoSave && ' (Press Enter to save, Esc to cancel)'}
        </p>
      )}
    </div>
  );
};

export default EditableText;