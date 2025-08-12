import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import authService from '../services/authService';
import { createErrorDisplay, logAuthError } from '../utils/errorHandling';
import { tokenManager } from '../utils/tokenUtils';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children, authService: customAuthService }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [errorDisplay, setErrorDisplay] = useState(null);
  
  const service = customAuthService || authService;

  // Helper function to handle errors consistently
  const handleError = useCallback((error, context = {}) => {
    const errorInfo = createErrorDisplay(error, { 
      showRecoveryActions: true,
      maxRecoveryActions: 3
    });
    
    setError(error.message);
    setErrorDisplay(errorInfo);
    
    // Log error for debugging and monitoring
    logAuthError(error, context);
    
    return errorInfo;
  }, []);

  // Helper function to clear errors
  const clearError = useCallback(() => {
    setError(null);
    setErrorDisplay(null);
  }, []);

  // Check authentication status on mount
  useEffect(() => {
    const checkAuth = async () => {
      setLoading(true);
      try {
        const isAuthenticated = await tokenManager.isAuthenticated();
        if (isAuthenticated) {
          const currentUser = await service.getCurrentUser();
          setUser(currentUser);
        }
      } catch (err) {
        console.error('Auth check error:', err);
        setError(err.message);
        // Clear invalid tokens
        tokenManager.clearTokens();
      } finally {
        setLoading(false);
      }
    };
    
    checkAuth();
  }, [service]);

  const signIn = useCallback(async (email, password, rememberMe = false) => {
    setLoading(true);
    clearError();
    try {
      const result = await service.signIn({ 
        username: email, 
        password,
        rememberMe 
      });
      
      if (result.isSignedIn) {
        setUser(result.user);
        
        if (result.tokens) {
          await tokenManager.setTokens(result.tokens, rememberMe);
        }
      }
      
      return result;
    } catch (err) {
      handleError(err, { action: 'signIn', email });
      throw err;
    } finally {
      setLoading(false);
    }
  }, [service, handleError, clearError]);

  const signUp = useCallback(async ({ email, password, displayName, ...otherAttributes }) => {
    setLoading(true);
    clearError();
    try {
      const result = await service.signUp({
        username: email,
        password,
        attributes: {
          email,
          name: displayName,
          ...otherAttributes
        }
      });
      return result;
    } catch (err) {
      handleError(err, { action: 'signUp', email, displayName });
      throw err;
    } finally {
      setLoading(false);
    }
  }, [service, handleError, clearError]);

  const confirmSignUp = useCallback(async (email, code, password) => {
    setLoading(true);
    clearError();
    try {
      const result = await service.confirmSignUp({
        username: email,
        confirmationCode: code
      });
      
      // Auto sign in after confirmation
      if (result.isSignUpComplete && password) {
        await service.signIn({
          username: email,
          password
        });
        const currentUser = await service.getCurrentUser();
        setUser(currentUser);
      }
      
      return result;
    } catch (err) {
      handleError(err, { action: 'confirmSignUp', email });
      throw err;
    } finally {
      setLoading(false);
    }
  }, [service, handleError, clearError]);

  const signOut = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      await service.signOut();
      setUser(null);
      tokenManager.clearTokens();
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [service]);

  const updateProfile = useCallback(async (attributes) => {
    setLoading(true);
    setError(null);
    try {
      const result = await service.updateUserAttributes(attributes);
      // Update local user state
      const updatedUser = await service.getCurrentUser();
      setUser(updatedUser);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [service]);

  const changePassword = useCallback(async (oldPassword, newPassword) => {
    setLoading(true);
    setError(null);
    try {
      const result = await service.changePassword(oldPassword, newPassword);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [service]);

  const sendPasswordResetEmail = useCallback(async (email) => {
    setLoading(true);
    setError(null);
    try {
      const result = await service.sendPasswordResetEmail(email);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [service]);

  const confirmPasswordReset = useCallback(async (email, code, newPassword) => {
    setLoading(true);
    setError(null);
    try {
      const result = await service.confirmPasswordReset({
        username: email,
        confirmationCode: code,
        newPassword
      });
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [service]);

  const refreshToken = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const tokens = await service.refreshToken();
      const currentTokens = await tokenManager.getTokens();
      const rememberMe = currentTokens && localStorage.getItem('rememberMe') === 'true';
      
      await tokenManager.setTokens(tokens, rememberMe);
      
      return tokens;
    } catch (err) {
      setError(err.message);
      // Clear invalid tokens on refresh failure
      tokenManager.clearTokens();
      setUser(null);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [service]);

  const enableMFA = useCallback(async (method) => {
    setLoading(true);
    setError(null);
    try {
      const result = await service.enableMFA(method);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [service]);

  const verifyMFA = useCallback(async (code) => {
    setLoading(true);
    setError(null);
    try {
      const result = await service.verifyMFA(code);
      return result.isVerified;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [service]);

  const value = {
    user,
    loading,
    error,
    errorDisplay,
    clearError,
    signIn,
    signUp,
    signOut,
    confirmSignUp,
    updateProfile,
    changePassword,
    sendPasswordResetEmail,
    confirmPasswordReset,
    refreshToken,
    enableMFA,
    verifyMFA
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};