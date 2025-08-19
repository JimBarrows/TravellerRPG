import React, { useState, useEffect, useCallback, useRef } from 'react';
import { z } from 'zod';
import Input from '../../../../shared/components/atoms/Input';
import Button from '../../../../shared/components/atoms/Button';

interface EditableNumberProps {
  value: number;
  onChange: (value: number) => void;
  onValidation?: (isValid: boolean, errors: string[]) => void;
  validation?: z.ZodSchema<number>;
  placeholder?: string;
  disabled?: boolean;
  readonly?: boolean;
  min?: number;
  max?: number;
  step?: number;
  className?: string;
  autoSave?: boolean;
  debounceMs?: number;
  onFocus?: () => void;
  onBlur?: () => void;
  required?: boolean;
  label?: string;
  id?: string;
  'aria-describedby'?: string;
  showSteppers?: boolean;
  allowDecimals?: boolean;
  currency?: boolean;
  suffix?: string;
}

const EditableNumber: React.FC<EditableNumberProps> = ({
  value,
  onChange,
  onValidation,
  validation,
  placeholder,
  disabled = false,
  readonly = false,
  min,
  max,
  step = 1,
  className,
  autoSave = true,
  debounceMs = 300,
  onFocus,
  onBlur,
  required = false,
  label,
  id,
  'aria-describedby': ariaDescribedBy,
  showSteppers = false,
  allowDecimals = false,
  currency = false,
  suffix,
}) => {
  const [localValue, setLocalValue] = useState(value.toString());
  const [errors, setErrors] = useState<string[]>([]);
  const [isValid, setIsValid] = useState(true);
  const [isDirty, setIsDirty] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const debounceRef = useRef<NodeJS.Timeout>();
  const inputRef = useRef<HTMLInputElement>(null);

  // Format number for display
  const formatNumber = useCallback((num: number): string => {
    if (currency) {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: allowDecimals ? 2 : 0,
        maximumFractionDigits: allowDecimals ? 2 : 0,
      }).format(num).replace('$', ''); // Remove $ since we'll show "Cr" for credits
    }
    
    if (allowDecimals) {
      return num.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
    }
    
    return num.toLocaleString('en-US');
  }, [currency, allowDecimals]);

  // Parse number from string
  const parseNumber = useCallback((str: string): number | null => {
    // Remove commas and currency symbols
    const cleanStr = str.replace(/[,\s$]/g, '');
    
    if (cleanStr === '' || cleanStr === '-') {
      return null;
    }
    
    const parsed = allowDecimals ? parseFloat(cleanStr) : parseInt(cleanStr, 10);
    return isNaN(parsed) ? null : parsed;
  }, [allowDecimals]);

  // Sync external value changes
  useEffect(() => {
    if (!isDirty) {
      setLocalValue(formatNumber(value));
    }
  }, [value, isDirty, formatNumber]);

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
      const numVal = parseNumber(val);
      if (numVal === null && val.trim() !== '') {
        throw new z.ZodError([{
          code: 'invalid_type',
          expected: 'number',
          received: 'nan',
          path: [],
          message: 'Must be a valid number'
        }]);
      }
      
      if (numVal !== null) {
        validation.parse(numVal);
      }
      
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
  }, [validation, onValidation, parseNumber]);

  // Debounced validation and auto-save
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      validateValue(localValue);
      
      if (autoSave && isDirty) {
        const numValue = parseNumber(localValue);
        if (numValue !== null && numValue !== value) {
          onChange(numValue);
          setIsDirty(false);
          setLocalValue(formatNumber(numValue)); // Reformat after save
        }
      }
    }, debounceMs);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [localValue, autoSave, isDirty, value, onChange, debounceMs, validateValue, parseNumber, formatNumber]);

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setLocalValue(newValue);
    setIsDirty(true);
  };

  // Handle blur - force save if auto-save is disabled
  const handleBlur = () => {
    if (!autoSave && isDirty) {
      const numValue = parseNumber(localValue);
      if (numValue !== null) {
        onChange(numValue);
        setIsDirty(false);
        setLocalValue(formatNumber(numValue));
      }
    } else if (!isDirty) {
      // Reformat on blur even if not dirty
      setLocalValue(formatNumber(value));
    }
    onBlur?.();
  };

  // Handle focus - show raw number for editing
  const handleFocus = () => {
    if (!isDirty) {
      setLocalValue(value.toString());
    }
    onFocus?.();
  };

  // Handle Enter key - force save
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const numValue = parseNumber(localValue);
      if (numValue !== null) {
        onChange(numValue);
        setIsDirty(false);
        setLocalValue(formatNumber(numValue));
      }
      inputRef.current?.blur();
    }
    
    if (e.key === 'Escape') {
      e.preventDefault();
      setLocalValue(formatNumber(value));
      setIsDirty(false);
      inputRef.current?.blur();
    }
  };

  // Handle stepper buttons
  const handleIncrement = () => {
    const current = parseNumber(localValue) ?? value;
    const newValue = Math.min(current + step, max ?? Infinity);
    onChange(newValue);
    setLocalValue(formatNumber(newValue));
    setIsDirty(false);
  };

  const handleDecrement = () => {
    const current = parseNumber(localValue) ?? value;
    const newValue = Math.max(current - step, min ?? -Infinity);
    onChange(newValue);
    setLocalValue(formatNumber(newValue));
    setIsDirty(false);
  };

  // Generate unique IDs for accessibility
  const inputId = id || `editable-number-${Math.random().toString(36).substr(2, 9)}`;
  const errorId = `${inputId}-error`;
  const helpTextId = ariaDescribedBy || `${inputId}-help`;

  // Combine class names for styling
  const inputClassName = `
    ${className || ''}
    ${errors.length > 0 ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}
    ${isDirty ? 'border-yellow-400' : ''}
    ${isValidating ? 'animate-pulse' : ''}
    ${showSteppers ? 'pr-16' : ''}
    ${currency ? 'pl-8' : ''}
    ${suffix ? 'pr-12' : ''}
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
        {/* Currency prefix */}
        {currency && (
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <span className="text-muted-foreground text-sm">Cr</span>
          </div>
        )}
        
        <Input
          ref={inputRef}
          id={inputId}
          type="text"
          value={localValue}
          onChange={handleInputChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          readOnly={readonly}
          min={min}
          max={max}
          step={step}
          className={inputClassName}
          aria-invalid={!isValid}
          aria-describedby={`${errors.length > 0 ? errorId : ''} ${helpTextId}`.trim()}
          aria-required={required}
        />
        
        {/* Suffix */}
        {suffix && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            <span className="text-muted-foreground text-sm">{suffix}</span>
          </div>
        )}
        
        {/* Stepper buttons */}
        {showSteppers && !readonly && !disabled && (
          <div className="absolute inset-y-0 right-0 flex flex-col">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleIncrement}
              disabled={max !== undefined && value >= max}
              className="h-1/2 px-2 py-0 border-0 rounded-none rounded-tr-md"
              aria-label="Increase value"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
              </svg>
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleDecrement}
              disabled={min !== undefined && value <= min}
              className="h-1/2 px-2 py-0 border-0 rounded-none rounded-br-md"
              aria-label="Decrease value"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </Button>
          </div>
        )}
        
        {/* Validation status indicator */}
        {!showSteppers && (
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
        )}
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
      {(min !== undefined || max !== undefined) && (
        <p 
          id={helpTextId}
          className="text-xs text-muted-foreground"
        >
          {min !== undefined && max !== undefined && `Range: ${min} - ${max}`}
          {min !== undefined && max === undefined && `Minimum: ${min}`}
          {min === undefined && max !== undefined && `Maximum: ${max}`}
          {isDirty && !autoSave && ' (Press Enter to save, Esc to cancel)'}
        </p>
      )}
    </div>
  );
};

export default EditableNumber;