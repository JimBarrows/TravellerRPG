import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { PasswordStrengthIndicator } from './PasswordStrengthIndicator';
import { VerificationForm } from './VerificationForm';
import { 
  validateRegistrationForm,
  clearFieldError,
  hasFieldError,
  getFieldError 
} from '../utils/formValidation';

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
  
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [generalError, setGeneralError] = useState('');

  const validateForm = () => {
    const validation = validateRegistrationForm(formData);
    setErrors(validation.errors);
    return validation.isValid;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear field error when user starts typing
    if (errors[name]) {
      setErrors(prev => clearFieldError(prev, name));
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


  const handleSocialSignUp = (provider) => {
    // This would be implemented based on your social login configuration
    console.log('Signing up with:', provider);
  };

  const getUserInputsForPasswordAnalysis = () => {
    return [formData.email, formData.displayName].filter(Boolean);
  };

  if (step === 'verify') {
    return (
      <VerificationForm
        email={formData.email}
        password={formData.password}
        onBack={() => setStep('register')}
        onSuccess={(result) => {
          // Successfully verified, navigate to dashboard
          navigate('/dashboard');
        }}
        autoRedirect={true}
      />
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
          <PasswordStrengthIndicator 
            password={formData.password}
            userInputs={getUserInputsForPasswordAnalysis()}
            showRequirements={true}
            showProgress={true}
            showFeedback={false}
          />
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