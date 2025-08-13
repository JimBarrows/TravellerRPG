import zxcvbn from 'zxcvbn';

/**
 * Evaluates password strength using zxcvbn library
 * @param {string} password - The password to evaluate
 * @param {string[]} userInputs - User-specific inputs (email, name, etc.) to check against
 * @returns {Object} Password strength analysis
 */
export const evaluatePasswordStrength = (password, userInputs = []) => {
  if (!password) {
    return {
      score: 0,
      strength: 'empty',
      feedback: { warning: '', suggestions: [] },
      isValid: false,
      requirements: {
        hasMinLength: false,
        hasUpperCase: false,
        hasLowerCase: false,
        hasNumbers: false,
        hasSpecialChar: false
      }
    };
  }

  // Use zxcvbn for sophisticated password strength analysis
  const result = zxcvbn(password, userInputs);
  
  // Check basic requirements
  const requirements = {
    hasMinLength: password.length >= 8,
    hasUpperCase: /[A-Z]/.test(password),
    hasLowerCase: /[a-z]/.test(password),
    hasNumbers: /\d/.test(password),
    hasSpecialChar: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`]/.test(password)
  };

  // Calculate basic requirements score
  const basicScore = Object.values(requirements).filter(Boolean).length;
  
  // Combine zxcvbn score with basic requirements
  // zxcvbn scores: 0 (very weak) to 4 (very strong)
  // We want at least score 2 AND all basic requirements met
  const meetsBasicRequirements = Object.values(requirements).every(Boolean);
  const isValid = result.score >= 2 && meetsBasicRequirements;
  
  // Map zxcvbn score to strength levels
  const strengthLevels = {
    0: 'very-weak',
    1: 'weak', 
    2: 'fair',
    3: 'good',
    4: 'strong'
  };

  // Enhance feedback with basic requirement messages
  const enhancedSuggestions = [...result.feedback.suggestions];
  
  if (!requirements.hasMinLength) {
    enhancedSuggestions.unshift('Use at least 8 characters');
  }
  if (!requirements.hasUpperCase) {
    enhancedSuggestions.push('Add an uppercase letter');
  }
  if (!requirements.hasLowerCase) {
    enhancedSuggestions.push('Add a lowercase letter');
  }
  if (!requirements.hasNumbers) {
    enhancedSuggestions.push('Add a number');
  }
  if (!requirements.hasSpecialChar) {
    enhancedSuggestions.push('Add a special character');
  }

  return {
    score: result.score,
    strength: strengthLevels[result.score],
    feedback: {
      warning: result.feedback.warning,
      suggestions: enhancedSuggestions
    },
    isValid,
    requirements,
    basicScore,
    crackTime: result.crack_times_display.offline_slow_hashing_1e4_per_second,
    guesses: result.guesses
  };
};

/**
 * Gets CSS class name for password strength indicator
 * @param {string} strength - Strength level from evaluatePasswordStrength
 * @returns {string} CSS class name
 */
export const getStrengthClass = (strength) => {
  const classMap = {
    'empty': '',
    'very-weak': 'strength-very-weak',
    'weak': 'strength-weak',
    'fair': 'strength-fair', 
    'good': 'strength-good',
    'strong': 'strength-strong'
  };
  
  return classMap[strength] || '';
};

/**
 * Gets human-readable strength text
 * @param {string} strength - Strength level from evaluatePasswordStrength
 * @returns {string} Human-readable strength text
 */
export const getStrengthText = (strength) => {
  const textMap = {
    'empty': '',
    'very-weak': 'Very Weak',
    'weak': 'Weak',
    'fair': 'Fair',
    'good': 'Good', 
    'strong': 'Strong'
  };
  
  return textMap[strength] || '';
};

/**
 * Calculates password strength percentage for progress bars
 * @param {number} score - zxcvbn score (0-4)
 * @param {number} basicScore - Number of basic requirements met (0-5)
 * @returns {number} Percentage (0-100)
 */
export const getStrengthPercentage = (score, basicScore) => {
  // Combine zxcvbn score (weighted 60%) with basic requirements (weighted 40%)
  const zxcvbnWeight = 0.6;
  const basicWeight = 0.4;
  
  const zxcvbnPercent = (score / 4) * 100;
  const basicPercent = (basicScore / 5) * 100;
  
  return Math.round((zxcvbnPercent * zxcvbnWeight) + (basicPercent * basicWeight));
};