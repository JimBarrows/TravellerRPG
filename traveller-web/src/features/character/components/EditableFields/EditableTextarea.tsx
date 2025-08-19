import React, { useState, useEffect, useCallback, useRef } from 'react';
import { z } from 'zod';

interface EditableTextareaProps {
  value: string;
  onChange: (value: string) => void;
  onValidation?: (isValid: boolean, errors: string[]) => void;
  validation?: z.ZodSchema<string>;
  placeholder?: string;
  disabled?: boolean;
  readonly?: boolean;
  maxLength?: number;
  minLength?: number;
  rows?: number;
  className?: string;
  autoSave?: boolean;
  debounceMs?: number;
  onFocus?: () => void;
  onBlur?: () => void;
  required?: boolean;
  label?: string;
  id?: string;
  'aria-describedby'?: string;
  autoResize?: boolean;
  showWordCount?: boolean;
}

const EditableTextarea: React.FC<EditableTextareaProps> = ({
  value,
  onChange,
  onValidation,
  validation,
  placeholder,
  disabled = false,
  readonly = false,
  maxLength,
  minLength,
  rows = 3,
  className,
  autoSave = true,
  debounceMs = 300,
  onFocus,
  onBlur,
  required = false,
  label,
  id,
  'aria-describedby': ariaDescribedBy,
  autoResize = true,
  showWordCount = false,
}) => {
  const [localValue, setLocalValue] = useState(value);
  const [errors, setErrors] = useState<string[]>([]);
  const [isValid, setIsValid] = useState(true);
  const [isDirty, setIsDirty] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const debounceRef = useRef<NodeJS.Timeout>();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Sync external value changes
  useEffect(() => {
    if (value !== localValue && !isDirty) {
      setLocalValue(value);
    }
  }, [value, localValue, isDirty]);

  // Auto-resize textarea
  useEffect(() => {
    if (autoResize && textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [localValue, autoResize]);

  // Calculate word count
  const getWordCount = useCallback((text: string) => {
    return text.trim() === '' ? 0 : text.trim().split(/\s+/).length;
  }, []);

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
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    
    // Enforce max length
    if (maxLength && newValue.length > maxLength) {
      return;
    }
    
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

  // Handle keyboard shortcuts
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Ctrl/Cmd + Enter to save
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      onChange(localValue);
      setIsDirty(false);
      textareaRef.current?.blur();
    }
    
    // Escape to cancel
    if (e.key === 'Escape') {
      e.preventDefault();
      setLocalValue(value);
      setIsDirty(false);
      textareaRef.current?.blur();
    }
  };

  // Generate unique IDs for accessibility
  const textareaId = id || `editable-textarea-${Math.random().toString(36).substr(2, 9)}`;
  const errorId = `${textareaId}-error`;
  const helpTextId = ariaDescribedBy || `${textareaId}-help`;

  // Combine class names for styling
  const textareaClassName = `
    w-full px-3 py-2 border border-border rounded-md bg-background text-foreground
    focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent
    disabled:opacity-50 disabled:cursor-not-allowed
    ${errors.length > 0 ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}
    ${isDirty ? 'border-yellow-400' : ''}
    ${isValidating ? 'animate-pulse' : ''}
    ${autoResize ? 'resize-none' : 'resize-y'}
    ${className || ''}
  `.trim();

  return (
    <div className="space-y-1">
      {label && (
        <label 
          htmlFor={textareaId}
          className={`block text-sm font-medium ${required ? 'after:content-["*"] after:text-red-500' : ''}`}
        >
          {label}
        </label>
      )}
      
      <div className="relative">
        <textarea
          ref={textareaRef}
          id={textareaId}
          value={localValue}
          onChange={handleInputChange}
          onFocus={onFocus}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          readOnly={readonly}
          maxLength={maxLength}
          minLength={minLength}
          rows={rows}
          className={textareaClassName}
          aria-invalid={!isValid}
          aria-describedby={`${errors.length > 0 ? errorId : ''} ${helpTextId}`.trim()}
          aria-required={required}
        />
        
        {/* Validation status indicator */}
        <div className="absolute top-2 right-2 flex items-center pointer-events-none">
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

      {/* Help text and counters */}
      <div 
        id={helpTextId}
        className="flex justify-between items-center text-xs text-muted-foreground"
      >
        <div>
          {isDirty && !autoSave && (
            <span>Ctrl/Cmd + Enter to save, Esc to cancel</span>
          )}
          {!isDirty && autoSave && (
            <span>Changes save automatically</span>
          )}
        </div>
        
        <div className="flex items-center space-x-4">
          {showWordCount && (
            <span>
              {getWordCount(localValue)} words
            </span>
          )}
          
          {maxLength && (
            <span className={localValue.length > maxLength * 0.9 ? 'text-yellow-600' : ''}>
              {localValue.length}/{maxLength} characters
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default EditableTextarea;