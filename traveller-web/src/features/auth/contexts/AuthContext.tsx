import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import useAuth from '../hooks/useAuth';
import type { AuthUser } from '../types';

interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (username: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const auth = useAuth();
  const [error, setError] = useState<string | null>(null);
  
  // Clear error after 5 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);
  
  const handleLogin = async (email: string, password: string) => {
    setError(null);
    const result = await auth.login(email, password);
    if (!result.success) {
      setError(result.error || 'Login failed');
    }
    return result;
  };
  
  const handleRegister = async (username: string, email: string, password: string) => {
    setError(null);
    const result = await auth.register(username, email, password);
    if (!result.success) {
      setError(result.error || 'Registration failed');
    }
    return result;
  };
  
  const handleLogout = async () => {
    setError(null);
    await auth.logout();
  };
  
  const clearError = () => {
    setError(null);
  };
  
  const value: AuthContextValue = {
    user: auth.user,
    isAuthenticated: auth.isAuthenticated,
    isLoading: auth.isLoading,
    error,
    login: handleLogin,
    register: handleRegister,
    logout: handleLogout,
    clearError,
  };
  
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;