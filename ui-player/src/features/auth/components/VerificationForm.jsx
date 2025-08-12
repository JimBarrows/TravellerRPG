import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { createErrorDisplay } from '../utils/errorHandling';

export const VerificationForm = ({ 
  email, 
  password, 
  onBack, 
  onSuccess,
  autoRedirect = true 
}) => {
  const navigate = useNavigate();
  const { confirmSignUp, sendPasswordResetEmail, loading, errorDisplay, clearError } = useAuth();
  
  const [verificationCode, setVerificationCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localError, setLocalError] = useState(null);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [resendAttempts, setResendAttempts] = useState(0);
  const [isResending, setIsResending] = useState(false);

  // Cooldown timer for resend button
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => {
        setResendCooldown(prev => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const validateVerificationCode = (code) => {
    const errors = {};
    
    if (!code) {
      errors.code = 'Verification code is required';
    } else if (code.length !== 6) {
      errors.code = 'Please enter a valid 6-digit code';
    } else if (!/^\d{6}$/.test(code)) {
      errors.code = 'Verification code must contain only numbers';
    }
    
    return errors;
  };

  const handleCodeChange = useCallback((e) => {
    const value = e.target.value.replace(/\D/g, '').substring(0, 6);
    setVerificationCode(value);
    
    // Clear errors when user starts typing
    if (localError) {
      setLocalError(null);
    }
    if (errorDisplay) {
      clearError();
    }
  }, [localError, errorDisplay, clearError]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const validationErrors = validateVerificationCode(verificationCode);
    if (Object.keys(validationErrors).length > 0) {
      setLocalError(validationErrors.code);
      return;
    }
    
    setIsSubmitting(true);
    setLocalError(null);
    
    try {
      const result = await confirmSignUp(email, verificationCode, password);
      
      if (result.isSignUpComplete) {
        if (onSuccess) {
          onSuccess(result);
        }
        
        if (autoRedirect) {
          // Navigate to dashboard or intended destination
          navigate('/dashboard');
        }
      }
    } catch (error) {
      // Error is handled by AuthContext, but we can add local handling if needed
      const errorInfo = createErrorDisplay(error);
      
      // Focus back to input for easy retry
      const codeInput = document.getElementById('verification-code');
      if (codeInput) {
        codeInput.focus();
        codeInput.select();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendCode = async () => {
    if (resendCooldown > 0 || isResending) {
      return;
    }
    
    setIsResending(true);
    setLocalError(null);
    
    try {
      // Calculate cooldown based on attempts (progressive delay)
      const cooldownTime = Math.min(30 + (resendAttempts * 30), 300); // Max 5 minutes
      
      // TODO: Implement actual resend logic with authService.resendConfirmationCode
      // For now, we'll simulate the resend
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setResendAttempts(prev => prev + 1);
      setResendCooldown(cooldownTime);
      
      // Show success message
      setLocalError(null);
      
    } catch (error) {
      const errorInfo = createErrorDisplay(error);
      setLocalError(errorInfo.message);
    } finally {
      setIsResending(false);
    }
  };

  const handleKeyPress = (e) => {
    // Only allow numbers
    if (!/\d/.test(e.key) && !['Backspace', 'Delete', 'Tab', 'Enter'].includes(e.key)) {
      e.preventDefault();
    }
    
    // Submit on Enter
    if (e.key === 'Enter' && verificationCode.length === 6) {
      handleSubmit(e);
    }
  };

  const formatCodeDisplay = (code) => {
    // Format as XXX-XXX for better readability
    if (code.length > 3) {
      return `${code.substring(0, 3)}-${code.substring(3)}`;
    }
    return code;
  };

  const getResendButtonText = () => {
    if (isResending) {
      return 'Sending...';
    } else if (resendCooldown > 0) {
      return `Resend in ${resendCooldown}s`;
    } else if (resendAttempts === 0) {
      return 'Resend Code';
    } else {
      return `Resend Code (${resendAttempts})`;
    }
  };

  return (
    <div className="auth-form-container">
      <form onSubmit={handleSubmit} className="auth-form verification-form">
        <h2>Verify Your Email</h2>
        
        <div className="verification-info">
          <p>
            We've sent a 6-digit verification code to{' '}
            <strong>{email}</strong>
          </p>
          <p className="help-text">
            Please check your email and enter the code below. 
            The code will expire in 15 minutes.
          </p>
        </div>
        
        <div className="form-group">
          <label htmlFor="verification-code">Verification Code</label>
          <input
            id="verification-code"
            type="text"
            inputMode="numeric"
            pattern="\d{6}"
            value={verificationCode}
            onChange={handleCodeChange}
            onKeyPress={handleKeyPress}
            placeholder="Enter 6-digit code"
            maxLength="6"
            disabled={isSubmitting}
            aria-invalid={!!(localError || errorDisplay)}
            aria-describedby={
              localError || errorDisplay ? 'code-error' : 'code-help'
            }
            className={`code-input ${verificationCode.length === 6 ? 'complete' : ''}`}
            autoComplete="one-time-code"
            autoFocus
          />
          
          <div id="code-help" className="form-help">
            {verificationCode && (
              <span className="code-preview">
                Code: {formatCodeDisplay(verificationCode)}
              </span>
            )}
          </div>
          
          {(localError || errorDisplay) && (
            <span id="code-error" className="field-error" role="alert">
              {localError || errorDisplay?.message}
            </span>
          )}
        </div>
        
        {errorDisplay && errorDisplay.recoveryActions.length > 0 && (
          <div className="error-recovery" role="region" aria-label="Error recovery suggestions">
            <h4>Suggestions:</h4>
            <ul>
              {errorDisplay.recoveryActions.map((action, index) => (
                <li key={index}>{action}</li>
              ))}
            </ul>
          </div>
        )}
        
        <button 
          type="submit" 
          disabled={isSubmitting || verificationCode.length !== 6}
          className="btn-primary"
        >
          {isSubmitting ? 'Verifying...' : 'Verify Email'}
        </button>
        
        <div className="form-actions">
          <button 
            type="button"
            onClick={handleResendCode}
            disabled={resendCooldown > 0 || isResending}
            className="btn-secondary"
          >
            {getResendButtonText()}
          </button>
          
          {onBack && (
            <button 
              type="button"
              onClick={onBack}
              disabled={isSubmitting}
              className="btn-link"
            >
              Back to Registration
            </button>
          )}
        </div>
        
        <div className="form-help">
          <p>
            Didn't receive the email? Check your spam/junk folder or try resending the code.
          </p>
          {resendAttempts >= 3 && (
            <p className="warning">
              Having trouble? Contact support if you continue to have issues.
            </p>
          )}
        </div>
      </form>
    </div>
  );
};

export default VerificationForm;