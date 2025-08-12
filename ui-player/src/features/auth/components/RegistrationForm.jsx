import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const RegistrationForm = () => {
  const navigate = useNavigate();
  const { signUp, confirmSignUp, loading } = useAuth();
  
  const [step, setStep] = useState('register'); // 'register' or 'verify'
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    displayName: '',
    acceptTerms: false
  });
  
  const [verificationCode, setVerificationCode] = useState('');
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [generalError, setGeneralError] = useState('');

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password) => {
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*]/.test(password);
    const isLongEnough = password.length >= 8;
    
    return {
      isValid: hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChar && isLongEnough,
      hasUpperCase,
      hasLowerCase,
      hasNumbers,
      hasSpecialChar,
      isLongEnough
    };
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    
    if (!formData.displayName) {
      newErrors.displayName = 'Display name is required';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else {
      const passwordValidation = validatePassword(formData.password);
      if (!passwordValidation.isValid) {
        const requirements = [];
        if (!passwordValidation.isLongEnough) requirements.push('at least 8 characters');
        if (!passwordValidation.hasUpperCase) requirements.push('one uppercase letter');
        if (!passwordValidation.hasLowerCase) requirements.push('one lowercase letter');
        if (!passwordValidation.hasNumbers) requirements.push('one number');
        if (!passwordValidation.hasSpecialChar) requirements.push('one special character');
        newErrors.password = `Password must contain ${requirements.join(', ')}`;
      }
    }
    
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    if (!formData.acceptTerms) {
      newErrors.acceptTerms = 'You must accept the terms and conditions';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear field error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
    setGeneralError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    setGeneralError('');
    
    try {
      const result = await signUp({
        email: formData.email,
        password: formData.password,
        displayName: formData.displayName
      });
      
      if (result.codeDeliveryDetails) {
        setStep('verify');
      } else if (result.isSignUpComplete) {
        navigate('/login');
      }
    } catch (error) {
      if (error.message.includes('already exists')) {
        setGeneralError('An account with this email already exists');
      } else {
        setGeneralError(error.message || 'Registration failed');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerification = async (e) => {
    e.preventDefault();
    
    if (!verificationCode || verificationCode.length !== 6) {
      setErrors({ verificationCode: 'Please enter a valid 6-digit code' });
      return;
    }
    
    setIsSubmitting(true);
    setGeneralError('');
    
    try {
      await confirmSignUp(formData.email, verificationCode, formData.password);
      navigate('/dashboard');
    } catch (error) {
      setGeneralError(error.message || 'Verification failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendCode = async () => {
    setIsSubmitting(true);
    try {
      // This would be implemented based on your resend verification logic
      console.log('Resending verification code to:', formData.email);
      setGeneralError('');
      // Show success message
    } catch (error) {
      setGeneralError('Failed to resend code');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSocialSignUp = (provider) => {
    // This would be implemented based on your social login configuration
    console.log('Signing up with:', provider);
  };

  const PasswordStrengthIndicator = () => {
    if (!formData.password) return null;
    
    const validation = validatePassword(formData.password);
    const strength = [
      validation.isLongEnough,
      validation.hasUpperCase,
      validation.hasLowerCase,
      validation.hasNumbers,
      validation.hasSpecialChar
    ].filter(Boolean).length;
    
    const strengthLevel = strength <= 2 ? 'weak' : strength <= 4 ? 'medium' : 'strong';
    const strengthText = strength <= 2 ? 'Weak' : strength <= 4 ? 'Medium' : 'Strong';
    
    return (
      <div className="password-strength">
        <div className={`strength-meter strength-${strengthLevel}`}>
          <div className="strength-bar" style={{ width: `${(strength / 5) * 100}%` }} />
        </div>
        <span className="strength-text">{strengthText}</span>
        <ul className="password-requirements">
          <li className={validation.isLongEnough ? 'met' : ''}>At least 8 characters</li>
          <li className={validation.hasUpperCase ? 'met' : ''}>One uppercase letter</li>
          <li className={validation.hasLowerCase ? 'met' : ''}>One lowercase letter</li>
          <li className={validation.hasNumbers ? 'met' : ''}>One number</li>
          <li className={validation.hasSpecialChar ? 'met' : ''}>One special character</li>
        </ul>
      </div>
    );
  };

  if (step === 'verify') {
    return (
      <div className="auth-form-container">
        <form onSubmit={handleVerification} className="auth-form">
          <h2>Verify Your Email</h2>
          <p>We've sent a verification code to {formData.email}</p>
          
          <div className="form-group">
            <label htmlFor="verification-code">Verification Code</label>
            <input
              id="verification-code"
              type="text"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              placeholder="Enter 6-digit code"
              maxLength="6"
              disabled={isSubmitting}
              aria-invalid={!!errors.verificationCode}
              aria-describedby={errors.verificationCode ? 'code-error' : undefined}
            />
            {errors.verificationCode && (
              <span id="code-error" className="field-error">
                {errors.verificationCode}
              </span>
            )}
          </div>
          
          {generalError && (
            <div className="error-message">{generalError}</div>
          )}
          
          <button 
            type="submit" 
            disabled={isSubmitting}
            className="btn-primary"
          >
            {isSubmitting ? 'Verifying...' : 'Verify Email'}
          </button>
          
          <div className="form-links">
            <button 
              type="button"
              onClick={handleResendCode}
              disabled={isSubmitting}
              className="btn-link"
            >
              Resend Code
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="auth-form-container">
      <form onSubmit={handleSubmit} className="auth-form">
        <h2>Create Account</h2>
        
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Enter your email"
            disabled={isSubmitting}
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? 'email-error' : undefined}
          />
          {errors.email && (
            <span id="email-error" className="field-error">
              {errors.email}
            </span>
          )}
        </div>
        
        <div className="form-group">
          <label htmlFor="displayName">Display Name</label>
          <input
            id="displayName"
            name="displayName"
            type="text"
            value={formData.displayName}
            onChange={handleChange}
            placeholder="Choose a display name"
            disabled={isSubmitting}
            aria-invalid={!!errors.displayName}
            aria-describedby={errors.displayName ? 'name-error' : undefined}
          />
          {errors.displayName && (
            <span id="name-error" className="field-error">
              {errors.displayName}
            </span>
          )}
        </div>
        
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Create a password"
            disabled={isSubmitting}
            aria-invalid={!!errors.password}
            aria-describedby={errors.password ? 'password-error' : undefined}
          />
          <PasswordStrengthIndicator />
          {errors.password && (
            <span id="password-error" className="field-error">
              {errors.password}
            </span>
          )}
        </div>
        
        <div className="form-group">
          <label htmlFor="confirmPassword">Confirm Password</label>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder="Confirm your password"
            disabled={isSubmitting}
            aria-invalid={!!errors.confirmPassword}
            aria-describedby={errors.confirmPassword ? 'confirm-error' : undefined}
          />
          {errors.confirmPassword && (
            <span id="confirm-error" className="field-error">
              {errors.confirmPassword}
            </span>
          )}
        </div>
        
        <div className="form-group checkbox-group">
          <label>
            <input
              type="checkbox"
              name="acceptTerms"
              checked={formData.acceptTerms}
              onChange={handleChange}
              disabled={isSubmitting}
              aria-invalid={!!errors.acceptTerms}
            />
            I accept the <Link to="/terms">Terms and Conditions</Link>
          </label>
          {errors.acceptTerms && (
            <span className="field-error">
              {errors.acceptTerms}
            </span>
          )}
        </div>
        
        {generalError && (
          <div className="error-message">{generalError}</div>
        )}
        
        <button 
          type="submit" 
          disabled={isSubmitting || loading}
          className="btn-primary"
        >
          {isSubmitting ? 'Creating Account...' : 'Sign Up'}
        </button>
        
        <div className="divider">
          <span>OR</span>
        </div>
        
        <div className="social-login">
          <button
            type="button"
            onClick={() => handleSocialSignUp('google')}
            className="btn-social btn-google"
            disabled={isSubmitting}
          >
            Sign up with Google
          </button>
          <button
            type="button"
            onClick={() => handleSocialSignUp('apple')}
            className="btn-social btn-apple"
            disabled={isSubmitting}
          >
            Sign up with Apple
          </button>
        </div>
        
        <div className="form-footer">
          <p>
            Already have an account?{' '}
            <Link to="/login">Sign In</Link>
          </p>
        </div>
      </form>
    </div>
  );
};