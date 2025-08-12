import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const LoginForm = () => {
  const navigate = useNavigate();
  const { signIn, sendPasswordResetEmail, loading } = useAuth();
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showResetForm, setShowResetForm] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetMessage, setResetMessage] = useState('');
  const [generalError, setGeneralError] = useState('');

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
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
      const result = await signIn(formData.email, formData.password, formData.rememberMe);
      
      if (result.isSignedIn) {
        if (formData.rememberMe && result.tokens) {
          localStorage.setItem('authToken', result.tokens.accessToken);
          localStorage.setItem('refreshToken', result.tokens.refreshToken);
        }
        navigate('/dashboard');
      }
    } catch (error) {
      if (error.message.includes('verify')) {
        setGeneralError('Please verify your email before logging in');
      } else {
        setGeneralError(error.message || 'Invalid email or password');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePasswordReset = async (e) => {
    e.preventDefault();
    
    if (!validateEmail(resetEmail)) {
      setResetMessage('Please enter a valid email address');
      return;
    }
    
    setIsSubmitting(true);
    setResetMessage('');
    
    try {
      await sendPasswordResetEmail(resetEmail);
      setResetMessage('Password reset instructions sent to your email');
      setTimeout(() => {
        setShowResetForm(false);
        setResetEmail('');
        setResetMessage('');
      }, 3000);
    } catch (error) {
      setResetMessage(error.message || 'Failed to send reset email');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendVerification = async () => {
    // This would be implemented based on your verification resend logic
    console.log('Resending verification email to:', formData.email);
  };

  const handleSocialLogin = (provider) => {
    // This would be implemented based on your social login configuration
    console.log('Logging in with:', provider);
  };

  if (showResetForm) {
    return (
      <div className="auth-form-container">
        <form onSubmit={handlePasswordReset} className="auth-form">
          <h2>Reset Password</h2>
          
          <div className="form-group">
            <label htmlFor="reset-email">Email</label>
            <input
              id="reset-email"
              type="email"
              value={resetEmail}
              onChange={(e) => setResetEmail(e.target.value)}
              placeholder="Enter your email"
              disabled={isSubmitting}
            />
          </div>
          
          {resetMessage && (
            <div className={resetMessage.includes('sent') ? 'success-message' : 'error-message'}>
              {resetMessage}
            </div>
          )}
          
          <div className="form-actions">
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="btn-primary"
            >
              {isSubmitting ? 'Sending...' : 'Send Reset Link'}
            </button>
            <button 
              type="button"
              onClick={() => setShowResetForm(false)}
              className="btn-secondary"
            >
              Back to Login
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="auth-form-container">
      <form onSubmit={handleSubmit} className="auth-form">
        <h2>Sign In</h2>
        
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
          <label htmlFor="password">Password</label>
          <input
            id="password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Enter your password"
            disabled={isSubmitting}
            aria-invalid={!!errors.password}
            aria-describedby={errors.password ? 'password-error' : undefined}
          />
          {errors.password && (
            <span id="password-error" className="field-error">
              {errors.password}
            </span>
          )}
        </div>
        
        <div className="form-group checkbox-group">
          <label>
            <input
              type="checkbox"
              name="rememberMe"
              checked={formData.rememberMe}
              onChange={handleChange}
              disabled={isSubmitting}
            />
            Remember me
          </label>
        </div>
        
        {generalError && (
          <div className="error-message">
            {generalError}
            {generalError.includes('verify') && (
              <button 
                type="button"
                onClick={handleResendVerification}
                className="btn-link"
              >
                Resend Verification
              </button>
            )}
          </div>
        )}
        
        <button 
          type="submit" 
          disabled={isSubmitting || loading}
          className="btn-primary"
        >
          {isSubmitting ? 'Signing in...' : 'Sign In'}
        </button>
        
        <div className="form-links">
          <button 
            type="button"
            onClick={() => setShowResetForm(true)}
            className="btn-link"
          >
            Forgot Password?
          </button>
        </div>
        
        <div className="divider">
          <span>OR</span>
        </div>
        
        <div className="social-login">
          <button
            type="button"
            onClick={() => handleSocialLogin('google')}
            className="btn-social btn-google"
            disabled={isSubmitting}
          >
            Sign in with Google
          </button>
          <button
            type="button"
            onClick={() => handleSocialLogin('apple')}
            className="btn-social btn-apple"
            disabled={isSubmitting}
          >
            Sign in with Apple
          </button>
        </div>
        
        <div className="form-footer">
          <p>
            Don't have an account?{' '}
            <Link to="/register">Sign Up</Link>
          </p>
        </div>
      </form>
    </div>
  );
};