/**
 * Centralized form validation utilities for authentication forms
 * Provides consistent validation rules and error messages across the application
 */

import { evaluatePasswordStrength } from './passwordStrength';

/**
 * Email validation
 */
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (!email) {
    return { isValid: false, error: 'Email is required' };
  }
  
  if (!emailRegex.test(email)) {
    return { isValid: false, error: 'Please enter a valid email' };
  }
  
  return { isValid: true, error: null };
};

/**
 * Password validation with strength checking
 */
export const validatePassword = (password, userInputs = []) => {
  if (!password) {
    return { 
      isValid: false, 
      error: 'Password is required',
      strength: null
    };
  }
  
  const analysis = evaluatePasswordStrength(password, userInputs);
  
  if (!analysis.isValid) {
    // Build error message from unmet requirements
    const requirements = [];
    if (!analysis.requirements.hasMinLength) {
      requirements.push('at least 8 characters');
    }
    if (!analysis.requirements.hasUpperCase) {
      requirements.push('one uppercase letter');
    }
    if (!analysis.requirements.hasLowerCase) {
      requirements.push('one lowercase letter');
    }
    if (!analysis.requirements.hasNumbers) {
      requirements.push('one number');
    }
    if (!analysis.requirements.hasSpecialChar) {
      requirements.push('one special character');
    }
    
    // Always use requirements-based message for consistency with tests
    let errorMessage = '';
    if (requirements.length > 0) {
      errorMessage = `Password must contain ${requirements.join(', ')}`;
    } else {
      errorMessage = 'Password does not meet security requirements';
    }
    
    return {
      isValid: false,
      error: errorMessage,
      strength: analysis
    };
  }
  
  return {
    isValid: true,
    error: null,
    strength: analysis
  };
};

/**
 * Password confirmation validation
 */
export const validatePasswordConfirmation = (password, confirmPassword) => {
  if (!confirmPassword) {
    return { isValid: false, error: 'Please confirm your password' };
  }
  
  if (password !== confirmPassword) {
    return { isValid: false, error: 'Passwords do not match' };
  }
  
  return { isValid: true, error: null };
};

/**
 * Display name validation
 */
export const validateDisplayName = (displayName) => {
  if (!displayName) {
    return { isValid: false, error: 'Display name is required' };
  }
  
  if (displayName.length < 2) {
    return { isValid: false, error: 'Display name must be at least 2 characters' };
  }
  
  if (displayName.length > 50) {
    return { isValid: false, error: 'Display name must be less than 50 characters' };
  }
  
  // Check for valid characters (alphanumeric, spaces, hyphens, underscores)
  const validNameRegex = /^[a-zA-Z0-9\s\-_]+$/;
  if (!validNameRegex.test(displayName)) {
    return { isValid: false, error: 'Display name can only contain letters, numbers, spaces, hyphens, and underscores' };
  }
  
  return { isValid: true, error: null };
};

/**
 * Verification code validation
 */
export const validateVerificationCode = (code) => {
  if (!code) {
    return { isValid: false, error: 'Verification code is required' };
  }
  
  if (code.length !== 6) {
    return { isValid: false, error: 'Verification code must be 6 digits' };
  }
  
  if (!/^\d{6}$/.test(code)) {
    return { isValid: false, error: 'Verification code must contain only numbers' };
  }
  
  return { isValid: true, error: null };
};

/**
 * Terms acceptance validation
 */
export const validateTermsAcceptance = (accepted) => {
  if (!accepted) {
    return { isValid: false, error: 'You must accept the terms and conditions' };
  }
  
  return { isValid: true, error: null };
};

/**
 * Phone number validation (optional, for future use)
 */
export const validatePhoneNumber = (phoneNumber, required = false) => {
  if (!phoneNumber && !required) {
    return { isValid: true, error: null };
  }
  
  if (!phoneNumber && required) {
    return { isValid: false, error: 'Phone number is required' };
  }
  
  // Basic international phone number regex
  const phoneRegex = /^[\+]?[(]?[0-9]{1,4}[)]?[-\s\.]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,9}$/;
  if (!phoneRegex.test(phoneNumber.replace(/\s/g, ''))) {
    return { isValid: false, error: 'Please enter a valid phone number' };
  }
  
  return { isValid: true, error: null };
};

/**
 * Validate entire registration form
 */
export const validateRegistrationForm = (formData) => {
  const errors = {};
  
  // Email validation
  const emailResult = validateEmail(formData.email);
  if (!emailResult.isValid) {
    errors.email = emailResult.error;
  }
  
  // Display name validation
  const displayNameResult = validateDisplayName(formData.displayName);
  if (!displayNameResult.isValid) {
    errors.displayName = displayNameResult.error;
  }
  
  // Password validation
  const userInputs = [formData.email, formData.displayName].filter(Boolean);
  const passwordResult = validatePassword(formData.password, userInputs);
  if (!passwordResult.isValid) {
    errors.password = passwordResult.error;
  }
  
  // Password confirmation validation
  const confirmResult = validatePasswordConfirmation(formData.password, formData.confirmPassword);
  if (!confirmResult.isValid) {
    errors.confirmPassword = confirmResult.error;
  }
  
  // Terms acceptance validation
  const termsResult = validateTermsAcceptance(formData.acceptTerms);
  if (!termsResult.isValid) {
    errors.acceptTerms = termsResult.error;
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    passwordStrength: passwordResult.strength
  };
};

/**
 * Validate entire login form
 */
export const validateLoginForm = (formData) => {
  const errors = {};
  
  // Email validation
  const emailResult = validateEmail(formData.email);
  if (!emailResult.isValid) {
    errors.email = emailResult.error;
  }
  
  // Basic password check (just required, no strength validation for login)
  if (!formData.password) {
    errors.password = 'Password is required';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Validate password reset form
 */
export const validatePasswordResetForm = (email) => {
  const errors = {};
  
  const emailResult = validateEmail(email);
  if (!emailResult.isValid) {
    errors.email = emailResult.error;
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Clear validation error for a specific field
 */
export const clearFieldError = (errors, fieldName) => {
  const newErrors = { ...errors };
  delete newErrors[fieldName];
  return newErrors;
};

/**
 * Check if a field has an error
 */
export const hasFieldError = (errors, fieldName) => {
  return errors && errors[fieldName] && errors[fieldName].length > 0;
};

/**
 * Get field error message
 */
export const getFieldError = (errors, fieldName) => {
  return errors && errors[fieldName] ? errors[fieldName] : null;
};

/**
 * Format validation errors for display
 */
export const formatValidationErrors = (errors) => {
  if (!errors || Object.keys(errors).length === 0) {
    return null;
  }
  
  return Object.entries(errors)
    .map(([field, error]) => error)
    .filter(Boolean);
};