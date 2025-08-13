import { useQuery, useMutation } from '@apollo/client';
import { useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  GET_CURRENT_USER,
} from '../../../shared/graphql/queries/auth';
import {
  LOGIN_MUTATION,
  REGISTER_MUTATION,
  LOGOUT_MUTATION,
  REFRESH_TOKEN_MUTATION,
} from '../../../shared/graphql/mutations/auth';
import { STORAGE_KEYS } from '../../../shared/constants';
import { clearApolloCache } from '../../../config/api/apollo';

export const useAuth = () => {
  const navigate = useNavigate();
  
  // Query current user
  const {
    data: userData,
    loading: userLoading,
    error: userError,
    refetch: refetchUser,
  } = useQuery(GET_CURRENT_USER, {
    skip: !localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN),
    errorPolicy: 'ignore',
  });
  
  // Mutations
  const [loginMutation, { loading: loginLoading }] = useMutation(LOGIN_MUTATION);
  const [registerMutation, { loading: registerLoading }] = useMutation(REGISTER_MUTATION);
  const [logoutMutation, { loading: logoutLoading }] = useMutation(LOGOUT_MUTATION);
  const [refreshTokenMutation] = useMutation(REFRESH_TOKEN_MUTATION);
  
  // Login function
  const login = useCallback(async (email: string, password: string) => {
    try {
      const { data } = await loginMutation({
        variables: {
          input: { email, password },
        },
      });
      
      if (data?.login?.token) {
        localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, data.login.token);
        await refetchUser();
        navigate('/dashboard/characters');
        return { success: true, user: data.login.user };
      }
      
      return { success: false, error: 'Login failed' };
    } catch (error: any) {
      console.error('Login error:', error);
      return { success: false, error: error.message || 'Login failed' };
    }
  }, [loginMutation, refetchUser, navigate]);
  
  // Register function
  const register = useCallback(async (
    username: string,
    email: string,
    password: string
  ) => {
    try {
      const { data } = await registerMutation({
        variables: {
          input: { username, email, password },
        },
      });
      
      if (data?.register?.token) {
        localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, data.register.token);
        await refetchUser();
        navigate('/dashboard/characters');
        return { success: true, user: data.register.user };
      }
      
      return { success: false, error: 'Registration failed' };
    } catch (error: any) {
      console.error('Registration error:', error);
      return { success: false, error: error.message || 'Registration failed' };
    }
  }, [registerMutation, refetchUser, navigate]);
  
  // Logout function
  const logout = useCallback(async () => {
    try {
      await logoutMutation();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
      await clearApolloCache();
      navigate('/auth/login');
    }
  }, [logoutMutation, navigate]);
  
  // Refresh token function
  const refreshToken = useCallback(async () => {
    try {
      const { data } = await refreshTokenMutation();
      
      if (data?.refreshToken?.token) {
        localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, data.refreshToken.token);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Token refresh error:', error);
      return false;
    }
  }, [refreshTokenMutation]);
  
  // Auto-refresh token on mount if exists
  useEffect(() => {
    const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
    if (token && !userData?.currentUser) {
      refetchUser();
    }
  }, [userData, refetchUser]);
  
  return {
    user: userData?.currentUser || null,
    isAuthenticated: !!userData?.currentUser,
    isLoading: userLoading || loginLoading || registerLoading || logoutLoading,
    error: userError,
    login,
    register,
    logout,
    refreshToken,
    refetchUser,
  };
};

export default useAuth;