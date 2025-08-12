import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import authService from '../services/authService';

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
  
  const service = customAuthService || authService;

  // Check authentication status on mount
  useEffect(() => {
    const checkAuth = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
        if (token) {
          const currentUser = await service.getCurrentUser();
          setUser(currentUser);
        }
      } catch (err) {
        console.error('Auth check error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    checkAuth();
  }, [service]);

  const signIn = useCallback(async (email, password, rememberMe = false) => {
    setLoading(true);
    setError(null);
    try {
      const result = await service.signIn({ 
        username: email, 
        password,
        rememberMe 
      });
      
      if (result.isSignedIn) {
        setUser(result.user);
        
        if (rememberMe && result.tokens) {
          localStorage.setItem('authToken', result.tokens.accessToken);
          localStorage.setItem('refreshToken', result.tokens.refreshToken);
        }
      }
      
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [service]);

  const signUp = useCallback(async ({ email, password, displayName, ...otherAttributes }) => {
    setLoading(true);
    setError(null);
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
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [service]);

  const confirmSignUp = useCallback(async (email, code, password) => {
    setLoading(true);
    setError(null);
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
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [service]);

  const signOut = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      await service.signOut();
      setUser(null);
      localStorage.removeItem('authToken');
      localStorage.removeItem('refreshToken');
      sessionStorage.removeItem('authToken');
      sessionStorage.removeItem('refreshToken');
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
      const rememberMe = !!localStorage.getItem('authToken');
      
      if (rememberMe) {
        localStorage.setItem('authToken', tokens.accessToken);
        localStorage.setItem('refreshToken', tokens.refreshToken);
      } else {
        sessionStorage.setItem('authToken', tokens.accessToken);
        sessionStorage.setItem('refreshToken', tokens.refreshToken);
      }
      
      return tokens;
    } catch (err) {
      setError(err.message);
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