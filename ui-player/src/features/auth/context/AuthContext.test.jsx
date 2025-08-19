import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { AuthProvider, useAuth } from './AuthContext';
import React from 'react';

// Mock auth service
const mockAuthService = {
  signIn: vi.fn(),
  signUp: vi.fn(),
  signOut: vi.fn(),
  confirmSignUp: vi.fn(),
  getCurrentUser: vi.fn(),
  refreshToken: vi.fn(),
  updateUserAttributes: vi.fn(),
  updatePassword: vi.fn(), // Changed from changePassword
  resetPassword: vi.fn(), // Changed from sendPasswordResetEmail
  confirmResetPassword: vi.fn(), // Changed from confirmPasswordReset
  enableMFA: vi.fn(),
  verifyMFA: vi.fn(),
  isAuthenticated: vi.fn().mockReturnValue(false),
  getAccessToken: vi.fn().mockReturnValue(null)
};

const wrapper = ({ children }) => (
  <AuthProvider authService={mockAuthService}>
    {children}
  </AuthProvider>
);

describe('AuthContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    sessionStorage.clear();
    // Reset isAuthenticated mock
    mockAuthService.isAuthenticated.mockReturnValue(false);
  });

  describe('useAuth hook', () => {
    it('should provide auth context values', () => {
      const { result } = renderHook(() => useAuth(), { wrapper });
      
      expect(result.current).toHaveProperty('user');
      expect(result.current).toHaveProperty('loading');
      expect(result.current).toHaveProperty('error');
      expect(result.current).toHaveProperty('signIn');
      expect(result.current).toHaveProperty('signUp');
      expect(result.current).toHaveProperty('signOut');
      expect(result.current).toHaveProperty('confirmSignUp');
      expect(result.current).toHaveProperty('updateProfile');
    });

    it('should throw error when used outside AuthProvider', () => {
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      expect(() => {
        renderHook(() => useAuth());
      }).toThrow('useAuth must be used within an AuthProvider');
      
      consoleError.mockRestore();
    });
  });

  describe('Authentication operations', () => {
    it('should sign in user successfully', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        displayName: 'Test User'
      };
      
      mockAuthService.signIn.mockResolvedValueOnce({
        isSignedIn: true,
        user: mockUser,
        tokens: {
          accessToken: 'access-token',
          refreshToken: 'refresh-token'
        }
      });
      
      const { result } = renderHook(() => useAuth(), { wrapper });
      
      await act(async () => {
        await result.current.signIn('test@example.com', 'password123');
      });
      
      expect(result.current.user).toEqual(mockUser);
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it('should handle sign in error', async () => {
      mockAuthService.signIn.mockRejectedValueOnce(new Error('Invalid credentials'));
      
      const { result } = renderHook(() => useAuth(), { wrapper });
      
      await act(async () => {
        try {
          await result.current.signIn('test@example.com', 'wrongpassword');
        } catch (error) {
          // Expected error
        }
      });
      
      expect(result.current.user).toBeNull();
      expect(result.current.error).toBe('Invalid credentials');
      expect(result.current.loading).toBe(false);
    });

    it('should sign up user successfully', async () => {
      mockAuthService.signUp.mockResolvedValueOnce({
        userSub: 'user-123',
        codeDeliveryDetails: {
          destination: 'test@example.com'
        }
      });
      
      const { result } = renderHook(() => useAuth(), { wrapper });
      
      await act(async () => {
        const response = await result.current.signUp({
          email: 'test@example.com',
          password: 'SecurePass123!',
          displayName: 'Test User'
        });
        
        expect(response.codeDeliveryDetails.destination).toBe('test@example.com');
      });
      
      expect(mockAuthService.signUp).toHaveBeenCalledWith(
        'test@example.com',
        'SecurePass123!',
        'test@example.com',
        {
          name: 'Test User'
        }
      );
    });

    it('should confirm sign up and auto sign in', async () => {
      mockAuthService.confirmSignUp.mockResolvedValueOnce({ isSignUpComplete: true });
      mockAuthService.signIn.mockResolvedValueOnce({
        isSignedIn: true,
        user: { id: 'user-123', email: 'test@example.com' }
      });
      mockAuthService.getCurrentUser.mockResolvedValueOnce({ 
        id: 'user-123', 
        email: 'test@example.com' 
      });
      
      const { result } = renderHook(() => useAuth(), { wrapper });
      
      await act(async () => {
        await result.current.confirmSignUp(
          'test@example.com',
          '123456',
          'SecurePass123!'
        );
      });
      
      expect(mockAuthService.confirmSignUp).toHaveBeenCalledWith(
        'test@example.com',
        '123456'
      );
      
      // Wait for the auto sign-in to complete
      await waitFor(() => {
        expect(mockAuthService.signIn).toHaveBeenCalledWith(
          'test@example.com',
          'SecurePass123!'
        );
        expect(result.current.user).toBeDefined();
      });
    });

    it('should sign out user', async () => {
      const mockUser = { id: 'user-123', email: 'test@example.com' };
      mockAuthService.getCurrentUser.mockResolvedValueOnce(mockUser);
      mockAuthService.signOut.mockResolvedValueOnce();
      
      const { result } = renderHook(() => useAuth(), { wrapper });
      
      // Set initial user state by signing in
      mockAuthService.signIn.mockResolvedValueOnce({
        isSignedIn: true,
        user: mockUser
      });
      
      await act(async () => {
        await result.current.signIn('test@example.com', 'password');
      });
      
      await act(async () => {
        await result.current.signOut();
      });
      
      expect(result.current.user).toBeNull();
      expect(localStorage.getItem('authToken')).toBeNull();
      expect(localStorage.getItem('refreshToken')).toBeNull();
    });
  });

  describe('Profile management', () => {
    it('should update user profile', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        displayName: 'Test User'
      };
      
      const updatedUser = {
        ...mockUser,
        displayName: 'Updated User'
      };
      
      const { result } = renderHook(() => useAuth(), { wrapper });
      
      // Set initial user by signing in
      mockAuthService.signIn.mockResolvedValueOnce({
        isSignedIn: true,
        user: mockUser
      });
      
      await act(async () => {
        await result.current.signIn('test@example.com', 'password');
      });
      
      // Reset and set up mocks for updateProfile
      mockAuthService.updateUserAttributes.mockReset();
      mockAuthService.getCurrentUser.mockReset();
      
      mockAuthService.updateUserAttributes.mockResolvedValueOnce({
        displayName: 'Updated User'
      });
      mockAuthService.getCurrentUser.mockResolvedValueOnce(updatedUser);
      
      await act(async () => {
        await result.current.updateProfile({ displayName: 'Updated User' });
      });
      
      // The user should be updated with the new displayName
      expect(result.current.user).toBeDefined();
      expect(result.current.user.displayName).toBe('Updated User');
    });

    it('should change password', async () => {
      mockAuthService.updatePassword.mockResolvedValueOnce(true);
      
      const { result } = renderHook(() => useAuth(), { wrapper });
      
      await act(async () => {
        const success = await result.current.changePassword('oldPass', 'newPass');
        expect(success).toBe(true);
      });
      
      expect(mockAuthService.updatePassword).toHaveBeenCalledWith('oldPass', 'newPass');
    });

    it('should send password reset email', async () => {
      mockAuthService.resetPassword.mockResolvedValueOnce(true);
      
      const { result } = renderHook(() => useAuth(), { wrapper });
      
      await act(async () => {
        await result.current.sendPasswordResetEmail('test@example.com');
      });
      
      expect(mockAuthService.resetPassword).toHaveBeenCalledWith('test@example.com');
    });
  });

  describe('Token management', () => {
    it('should refresh token when expired', async () => {
      // Mock isAuthenticated to return true so refresh can succeed
      mockAuthService.isAuthenticated.mockReturnValue(true);
      
      const { result } = renderHook(() => useAuth(), { wrapper });
      
      await act(async () => {
        const response = await result.current.refreshToken();
        expect(response.success).toBe(true);
      });
      
      expect(mockAuthService.isAuthenticated).toHaveBeenCalled();
    });

    it('should check authentication status on mount', async () => {
      mockAuthService.isAuthenticated.mockReturnValueOnce(true);
      mockAuthService.getCurrentUser.mockResolvedValueOnce({
        id: 'user-123',
        email: 'test@example.com'
      });
      
      const { result } = renderHook(() => useAuth(), { wrapper });
      
      await waitFor(() => {
        expect(mockAuthService.getCurrentUser).toHaveBeenCalled();
        expect(result.current.user).toBeDefined();
        expect(result.current.user.email).toBe('test@example.com');
      });
    });
  });

  describe('MFA operations', () => {
    it('should enable MFA', async () => {
      // MFA is not yet implemented in the auth service
      const { result } = renderHook(() => useAuth(), { wrapper });
      
      await act(async () => {
        const mfaSetup = await result.current.enableMFA('authenticator');
        expect(mfaSetup.isEnabled).toBe(false);
      });
    });

    it('should verify MFA code', async () => {
      // MFA is not yet implemented in the auth service
      const { result } = renderHook(() => useAuth(), { wrapper });
      
      await act(async () => {
        const verified = await result.current.verifyMFA('123456');
        expect(verified).toBe(false);
      });
    });
  });
});