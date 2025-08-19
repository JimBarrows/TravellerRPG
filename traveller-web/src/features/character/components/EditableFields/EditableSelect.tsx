import React, { useState, useEffect, useCallback, useRef } from 'react';
import { z } from 'zod';

interface Option {
  value: string;
  label: string;
  disabled?: boolean;
  description?: string;
}

interface EditableSelectProps {
  value: string;
  onChange: (value: string) => void;
  onValidation?: (isValid: boolean, errors: string[]) => void;
  validation?: z.ZodSchema<string>;
  options: Option[];
  placeholder?: string;
  disabled?: boolean;
  readonly?: boolean;
  className?: string;
  autoSave?: boolean;
  debounceMs?: number;
  onFocus?: () => void;
  onBlur?: () => void;
  required?: boolean;
  label?: string;
  id?: string;
  'aria-describedby'?: string;
  allowCustom?: boolean;
  searchable?: boolean;
}

const EditableSelect: React.FC<EditableSelectProps> = ({
  value,
  onChange,
  onValidation,
  validation,
  options,
  placeholder = 'Select an option...',
  disabled = false,
  readonly = false,
  className,
  autoSave = true,
  debounceMs = 300,
  onFocus,
  onBlur,
  required = false,
  label,
  id,
  'aria-describedby': ariaDescribedBy,
  allowCustom = false,
  searchable = false,
}) => {
  const [localValue, setLocalValue] = useState(value);
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [errors, setErrors] = useState<string[]>([]);
  const [isValid, setIsValid] = useState(true);
  const [isDirty, setIsDirty] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const debounceRef = useRef<NodeJS.Timeout>();
  const selectRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync external value changes
  useEffect(() => {
    if (value !== localValue && !isDirty) {
      setLocalValue(value);
    }
  }, [value, localValue, isDirty]);

  // Filter options based on search term
  const filteredOptions = options.filter(option => 
    option.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
    option.value.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

  // Handle option selection
  const handleOptionSelect = (optionValue: string) => {
    setLocalValue(optionValue);
    setIsDirty(true);
    setIsOpen(false);
    setSearchTerm('');
    
    if (autoSave) {
      onChange(optionValue);
      setIsDirty(false);
    }
  };

  // Handle custom input (if allowed)
  const handleCustomInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setLocalValue(newValue);
    setIsDirty(true);
  };

  // Handle blur - force save if auto-save is disabled
  const handleBlur = (e: React.FocusEvent) => {
    // Check if focus is moving to another element within the select
    if (selectRef.current?.contains(e.relatedTarget as Node)) {
      return;
    }

    setIsOpen(false);
    setSearchTerm('');
    
    if (!autoSave && isDirty) {
      onChange(localValue);
      setIsDirty(false);
    }
    onBlur?.();
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled || readonly) return;

    switch (e.key) {
      case 'Enter':
        e.preventDefault();
        if (isOpen && filteredOptions.length > 0) {
          handleOptionSelect(filteredOptions[0].value);
        } else if (!isOpen) {
          setIsOpen(true);
        }
        break;
        
      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        setSearchTerm('');
        if (isDirty) {
          setLocalValue(value);
          setIsDirty(false);
        }
        break;
        
      case 'ArrowDown':
        e.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
        }
        break;
        
      case 'ArrowUp':
        e.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
        }
        break;
        
      case 'Tab':
        if (isOpen) {
          setIsOpen(false);
          setSearchTerm('');
        }
        break;
    }
  };

  // Get display value
  const getDisplayValue = () => {
    const option = options.find(opt => opt.value === localValue);
    return option ? option.label : (allowCustom ? localValue : '');
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Generate unique IDs for accessibility
  const selectId = id || `editable-select-${Math.random().toString(36).substr(2, 9)}`;
  const errorId = `${selectId}-error`;
  const helpTextId = ariaDescribedBy || `${selectId}-help`;
  const listboxId = `${selectId}-listbox`;

  // Combine class names for styling
  const selectClassName = `
    relative w-full bg-background border border-border rounded-md shadow-sm
    ${errors.length > 0 ? 'border-red-500' : ''}
    ${isDirty ? 'border-yellow-400' : ''}
    ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
    ${readonly ? 'cursor-default' : ''}
    ${className || ''}
  `.trim();

  return (
    <div className="space-y-1">
      {label && (
        <label 
          htmlFor={selectId}
          className={`block text-sm font-medium ${required ? 'after:content-["*"] after:text-red-500' : ''}`}
        >
          {label}
        </label>
      )}
      
      <div 
        ref={selectRef}
        className={selectClassName}
        onKeyDown={handleKeyDown}
      >
        {/* Select trigger */}
        <div
          className="flex items-center justify-between px-3 py-2 cursor-pointer"
          onClick={() => !disabled && !readonly && setIsOpen(!isOpen)}
          onFocus={onFocus}
          onBlur={handleBlur}
          tabIndex={disabled || readonly ? -1 : 0}
          role="combobox"
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          aria-controls={listboxId}
          aria-invalid={!isValid}
          aria-describedby={`${errors.length > 0 ? errorId : ''} ${helpTextId}`.trim()}
          aria-required={required}
          id={selectId}
        >
          <span className={`block truncate ${!localValue ? 'text-muted-foreground' : ''}`}>
            {getDisplayValue() || placeholder}
          </span>
          
          <div className="flex items-center space-x-2">
            {/* Validation status indicator */}
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
            
            {/* Dropdown arrow */}
            <svg
              className={`w-5 h-5 text-muted-foreground transition-transform ${
                isOpen ? 'rotate-180' : ''
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>

        {/* Dropdown content */}
        {isOpen && (
          <div className="absolute z-50 w-full mt-1 bg-background border border-border rounded-md shadow-lg max-h-60 overflow-y-auto">
            {searchable && (
              <div className="p-2 border-b border-border">
                <input
                  ref={inputRef}
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search options..."
                  className="w-full px-2 py-1 text-sm border border-border rounded focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  autoFocus
                />
              </div>
            )}
            
            {allowCustom && searchTerm && !filteredOptions.some(opt => opt.value === searchTerm) && (
              <div
                className="px-3 py-2 text-sm cursor-pointer hover:bg-muted"
                onClick={() => handleOptionSelect(searchTerm)}
              >
                Use "{searchTerm}"
              </div>
            )}
            
            <ul
              id={listboxId}
              role="listbox"
              aria-multiselectable={false}
              className="py-1"
            >
              {filteredOptions.length === 0 ? (
                <li className="px-3 py-2 text-sm text-muted-foreground">
                  No options found
                </li>
              ) : (
                filteredOptions.map((option) => (
                  <li
                    key={option.value}
                    role="option"
                    aria-selected={option.value === localValue}
                    className={`
                      px-3 py-2 text-sm cursor-pointer
                      ${option.value === localValue ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}
                      ${option.disabled ? 'opacity-50 cursor-not-allowed' : ''}
                    `}
                    onClick={() => !option.disabled && handleOptionSelect(option.value)}
                  >
                    <div className="flex items-center justify-between">
                      <span>{option.label}</span>
                      {option.value === localValue && (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                    {option.description && (
                      <div className="text-xs text-muted-foreground mt-1">
                        {option.description}
                      </div>
                    )}
                  </li>
                ))
              )}
            </ul>
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
      <p 
        id={helpTextId}
        className="text-xs text-muted-foreground"
      >
        {isDirty && !autoSave && 'Changes will be saved automatically'}
        {allowCustom && ' • You can enter a custom value'}
        {searchable && ' • Type to search options'}
      </p>
    </div>
  );
};

export default EditableSelect;