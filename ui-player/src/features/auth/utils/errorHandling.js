/**
 * Maps AWS Cognito error codes to user-friendly messages
 * @param {Error} error - The error object from AWS Amplify/Cognito
 * @returns {Object} Object containing user-friendly message and recovery actions
 */
export const mapCognitoError = (error) => {
  const errorCode = error.code || error.name || '';
  const errorMessage = error.message || '';
  
  // Default error response
  const defaultError = {
    userMessage: 'An unexpected error occurred. Please try again.',
    technicalMessage: errorMessage,
    recoveryActions: ['Try again later', 'Contact support if the problem persists'],
    isRetryable: true,
    severity: 'error'
  };

  // Map specific Cognito error codes to user-friendly messages
  const errorMap = {
    // User registration errors
    'UsernameExistsException': {
      userMessage: 'An account with this email already exists.',
      technicalMessage: 'Username already exists',
      recoveryActions: [
        'Try signing in instead',
        'Use the "Forgot Password" option if you don\'t remember your password',
        'Use a different email address'
      ],
      isRetryable: false,
      severity: 'warning'
    },
    
    'InvalidPasswordException': {
      userMessage: 'Password does not meet security requirements.',
      technicalMessage: 'Password policy violation',
      recoveryActions: [
        'Use at least 8 characters',
        'Include uppercase and lowercase letters',
        'Add numbers and special characters',
        'Avoid common words or personal information'
      ],
      isRetryable: true,
      severity: 'warning'
    },
    
    'InvalidParameterException': {
      userMessage: 'Please check your input and try again.',
      technicalMessage: 'Invalid parameter provided',
      recoveryActions: [
        'Verify email format is correct',
        'Check password requirements',
        'Ensure all required fields are filled'
      ],
      isRetryable: true,
      severity: 'warning'
    },

    // Email verification errors
    'CodeMismatchException': {
      userMessage: 'The verification code is incorrect. Please check and try again.',
      technicalMessage: 'Verification code mismatch',
      recoveryActions: [
        'Double-check the code in your email',
        'Try copying and pasting the code',
        'Request a new verification code'
      ],
      isRetryable: true,
      severity: 'warning'
    },
    
    'ExpiredCodeException': {
      userMessage: 'The verification code has expired. Please request a new one.',
      technicalMessage: 'Verification code expired',
      recoveryActions: [
        'Request a new verification code',
        'Complete verification within 15 minutes of receiving the code'
      ],
      isRetryable: true,
      severity: 'warning'
    },
    
    'CodeDeliveryFailureException': {
      userMessage: 'Unable to send verification code. Please check your email address.',
      technicalMessage: 'Failed to deliver verification code',
      recoveryActions: [
        'Check your email address is correct',
        'Check your spam/junk folder',
        'Try again in a few minutes',
        'Contact support if the problem persists'
      ],
      isRetryable: true,
      severity: 'error'
    },

    // Authentication errors
    'NotAuthorizedException': {
      userMessage: 'Email or password is incorrect.',
      technicalMessage: 'Authentication failed',
      recoveryActions: [
        'Double-check your email and password',
        'Use "Forgot Password" if you don\'t remember your password',
        'Ensure your account is verified'
      ],
      isRetryable: true,
      severity: 'warning'
    },
    
    'UserNotConfirmedException': {
      userMessage: 'Please verify your email address before signing in.',
      technicalMessage: 'User account not confirmed',
      recoveryActions: [
        'Check your email for a verification link',
        'Click "Resend verification code" if needed',
        'Check your spam/junk folder'
      ],
      isRetryable: false,
      severity: 'info'
    },
    
    'UserNotFoundException': {
      userMessage: 'No account found with this email address.',
      technicalMessage: 'User not found',
      recoveryActions: [
        'Check your email address is correct',
        'Create a new account if you haven\'t registered',
        'Try a different email address'
      ],
      isRetryable: false,
      severity: 'warning'
    },

    'PasswordResetRequiredException': {
      userMessage: 'You must reset your password before signing in.',
      technicalMessage: 'Password reset required',
      recoveryActions: [
        'Use the "Forgot Password" option',
        'Follow the password reset instructions in your email'
      ],
      isRetryable: false,
      severity: 'info'
    },

    // Rate limiting and security
    'TooManyRequestsException': {
      userMessage: 'Too many attempts. Please wait a few minutes before trying again.',
      technicalMessage: 'Rate limit exceeded',
      recoveryActions: [
        'Wait 5-15 minutes before trying again',
        'Avoid rapid repeated attempts',
        'Contact support if you continue to have issues'
      ],
      isRetryable: true,
      severity: 'warning'
    },
    
    'TooManyFailedAttemptsException': {
      userMessage: 'Account temporarily locked due to too many failed attempts.',
      technicalMessage: 'Account locked due to failed attempts',
      recoveryActions: [
        'Wait 15-30 minutes before trying again',
        'Use "Forgot Password" to reset your password',
        'Contact support if you continue to have issues'
      ],
      isRetryable: true,
      severity: 'error'
    },

    // Network and service errors
    'NetworkException': {
      userMessage: 'Connection problem. Please check your internet and try again.',
      technicalMessage: 'Network error',
      recoveryActions: [
        'Check your internet connection',
        'Try again in a few moments',
        'Contact support if the problem persists'
      ],
      isRetryable: true,
      severity: 'error'
    },
    
    'ServiceException': {
      userMessage: 'Service temporarily unavailable. Please try again later.',
      technicalMessage: 'AWS service error',
      recoveryActions: [
        'Try again in a few minutes',
        'Check system status',
        'Contact support if the problem persists'
      ],
      isRetryable: true,
      severity: 'error'
    },

    // MFA errors
    'EnableSoftwareTokenMFAException': {
      userMessage: 'Two-factor authentication setup required.',
      technicalMessage: 'MFA setup required',
      recoveryActions: [
        'Complete MFA setup using an authenticator app',
        'Scan the QR code or enter the setup key manually'
      ],
      isRetryable: false,
      severity: 'info'
    },
    
    'SoftwareTokenMFANotFoundException': {
      userMessage: 'Two-factor authentication not set up. Please complete setup.',
      technicalMessage: 'MFA token not found',
      recoveryActions: [
        'Set up two-factor authentication',
        'Use an authenticator app like Google Authenticator or Authy'
      ],
      isRetryable: false,
      severity: 'info'
    }
  };

  // Look for exact match first
  if (errorMap[errorCode]) {
    return errorMap[errorCode];
  }

  // Try to match partial error codes or messages
  for (const [code, errorInfo] of Object.entries(errorMap)) {
    if (errorCode.includes(code) || errorMessage.includes(code)) {
      return errorInfo;
    }
  }

  // Check for common error message patterns
  if (errorMessage.toLowerCase().includes('already exists')) {
    return errorMap['UsernameExistsException'];
  }
  
  if (errorMessage.toLowerCase().includes('password') && errorMessage.toLowerCase().includes('requirements')) {
    return errorMap['InvalidPasswordException'];
  }
  
  if (errorMessage.toLowerCase().includes('verification') && errorMessage.toLowerCase().includes('code')) {
    if (errorMessage.toLowerCase().includes('expired')) {
      return errorMap['ExpiredCodeException'];
    } else if (errorMessage.toLowerCase().includes('invalid') || errorMessage.toLowerCase().includes('incorrect')) {
      return errorMap['CodeMismatchException'];
    }
  }
  
  if (errorMessage.toLowerCase().includes('network') || errorMessage.toLowerCase().includes('connection')) {
    return errorMap['NetworkException'];
  }

  // Return default error if no specific match found
  return defaultError;
};

/**
 * Creates a user-friendly error message component data
 * @param {Error} error - The error object
 * @param {Object} options - Additional options for error display
 * @returns {Object} Error display data for UI components
 */
export const createErrorDisplay = (error, options = {}) => {
  const errorInfo = mapCognitoError(error);
  const {
    showTechnicalDetails = false,
    showRecoveryActions = true,
    maxRecoveryActions = 3
  } = options;

  return {
    message: errorInfo.userMessage,
    technicalMessage: showTechnicalDetails ? errorInfo.technicalMessage : null,
    recoveryActions: showRecoveryActions 
      ? errorInfo.recoveryActions.slice(0, maxRecoveryActions)
      : [],
    isRetryable: errorInfo.isRetryable,
    severity: errorInfo.severity,
    canRetry: errorInfo.isRetryable,
    timestamp: new Date().toISOString()
  };
};

/**
 * Determines if an error is retryable after a delay
 * @param {Error} error - The error object
 * @returns {Object} Retry information
 */
export const getRetryInfo = (error) => {
  const errorInfo = mapCognitoError(error);
  const errorCode = error.code || error.name || '';
  
  // Determine retry delay based on error type
  let retryDelay = 0; // in seconds
  
  if (errorCode.includes('TooManyRequests') || errorCode.includes('TooManyFailedAttempts')) {
    retryDelay = 900; // 15 minutes
  } else if (errorCode.includes('Network') || errorCode.includes('Service')) {
    retryDelay = 30; // 30 seconds
  } else if (errorInfo.isRetryable) {
    retryDelay = 5; // 5 seconds for general retryable errors
  }
  
  return {
    isRetryable: errorInfo.isRetryable,
    retryDelay,
    retryDelayText: retryDelay > 0 ? formatRetryDelay(retryDelay) : null
  };
};

/**
 * Formats retry delay into human-readable text
 * @param {number} seconds - Delay in seconds
 * @returns {string} Formatted delay text
 */
const formatRetryDelay = (seconds) => {
  if (seconds < 60) {
    return `${seconds} seconds`;
  } else if (seconds < 3600) {
    const minutes = Math.floor(seconds / 60);
    return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
  } else {
    const hours = Math.floor(seconds / 3600);
    return `${hours} hour${hours !== 1 ? 's' : ''}`;
  }
};

/**
 * Logs error information for debugging and monitoring
 * @param {Error} error - The error object
 * @param {Object} context - Additional context information
 */
export const logAuthError = (error, context = {}) => {
  const errorInfo = mapCognitoError(error);
  const logData = {
    timestamp: new Date().toISOString(),
    errorCode: error.code || error.name,
    errorMessage: error.message,
    userMessage: errorInfo.userMessage,
    severity: errorInfo.severity,
    isRetryable: errorInfo.isRetryable,
    context,
    stackTrace: error.stack
  };
  
  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.group('🔐 Authentication Error');
    console.error('Error Details:', logData);
    console.groupEnd();
  }
  
  // TODO: Send to error monitoring service in production
  // Example: Sentry, LogRocket, DataDog, etc.
  // errorMonitoringService.captureException(error, { extra: logData });
  
  return logData;
};