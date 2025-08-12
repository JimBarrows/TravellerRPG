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
  changePassword: vi.fn(),
  sendPasswordResetEmail: vi.fn(),
  confirmPasswordReset: vi.fn(),
  enableMFA: vi.fn(),
  verifyMFA: vi.fn()
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
      
      expect(mockAuthService.signUp).toHaveBeenCalledWith({
        username: 'test@example.com',
        password: 'SecurePass123!',
        attributes: {
          email: 'test@example.com',
          name: 'Test User'
        }
      });
    });

    it('should confirm sign up and auto sign in', async () => {
      mockAuthService.confirmSignUp.mockResolvedValueOnce({ isSignUpComplete: true });
      mockAuthService.signIn.mockResolvedValueOnce({
        isSignedIn: true,
        user: { id: 'user-123', email: 'test@example.com' }
      });
      
      const { result } = renderHook(() => useAuth(), { wrapper });
      
      await act(async () => {
        await result.current.confirmSignUp(
          'test@example.com',
          '123456',
          'SecurePass123!'
        );
      });
      
      expect(mockAuthService.confirmSignUp).toHaveBeenCalledWith({
        username: 'test@example.com',
        confirmationCode: '123456'
      });
      
      // Wait for the auto sign-in to complete
      await waitFor(() => {
        expect(mockAuthService.signIn).toHaveBeenCalledWith({
          username: 'test@example.com',
          password: 'SecurePass123!'
        });
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
      
      mockAuthService.updateUserAttributes.mockResolvedValueOnce({
        ...mockUser,
        displayName: 'Updated User'
      });
      
      const { result } = renderHook(() => useAuth(), { wrapper });
      
      // Set initial user by signing in
      mockAuthService.signIn.mockResolvedValueOnce({
        isSignedIn: true,
        user: mockUser
      });
      mockAuthService.updateUserAttributes.mockResolvedValueOnce({
        displayName: 'Updated User'
      });
      mockAuthService.getCurrentUser.mockResolvedValueOnce({
        ...mockUser,
        displayName: 'Updated User'
      });
      
      await act(async () => {
        await result.current.signIn('test@example.com', 'password');
      });
      
      await act(async () => {
        await result.current.updateProfile({ displayName: 'Updated User' });
      });
      
      expect(result.current.user.displayName).toBe('Updated User');
    });

    it('should change password', async () => {
      mockAuthService.changePassword.mockResolvedValueOnce(true);
      
      const { result } = renderHook(() => useAuth(), { wrapper });
      
      await act(async () => {
        const success = await result.current.changePassword('oldPass', 'newPass');
        expect(success).toBe(true);
      });
      
      expect(mockAuthService.changePassword).toHaveBeenCalledWith('oldPass', 'newPass');
    });

    it('should send password reset email', async () => {
      mockAuthService.sendPasswordResetEmail.mockResolvedValueOnce(true);
      
      const { result } = renderHook(() => useAuth(), { wrapper });
      
      await act(async () => {
        await result.current.sendPasswordResetEmail('test@example.com');
      });
      
      expect(mockAuthService.sendPasswordResetEmail).toHaveBeenCalledWith('test@example.com');
    });
  });

  describe('Token management', () => {
    it('should refresh token when expired', async () => {
      const newTokens = {
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token'
      };
      
      mockAuthService.refreshToken.mockResolvedValueOnce(newTokens);
      localStorage.setItem('refreshToken', 'old-refresh-token');
      
      const { result } = renderHook(() => useAuth(), { wrapper });
      
      await act(async () => {
        const tokens = await result.current.refreshToken();
        expect(tokens).toEqual(newTokens);
      });
      
      // Check tokens are in localStorage after refresh
      await waitFor(() => {
        expect(localStorage.getItem('authToken')).toBe('new-access-token');
        expect(localStorage.getItem('refreshToken')).toBe('new-refresh-token');
      });
    });

    it('should check authentication status on mount', async () => {
      localStorage.setItem('authToken', 'existing-token');
      mockAuthService.getCurrentUser.mockResolvedValueOnce({
        id: 'user-123',
        email: 'test@example.com'
      });
      
      const { result } = renderHook(() => useAuth(), { wrapper });
      
      await waitFor(() => {
        expect(result.current.user).toBeDefined();
        expect(result.current.user.email).toBe('test@example.com');
      });
    });
  });

  describe('MFA operations', () => {
    it('should enable MFA', async () => {
      mockAuthService.enableMFA.mockResolvedValueOnce({
        qrCode: 'data:image/png;base64,mockQR',
        backupCodes: ['123456', '789012']
      });
      
      const { result } = renderHook(() => useAuth(), { wrapper });
      
      await act(async () => {
        const mfaSetup = await result.current.enableMFA('authenticator');
        expect(mfaSetup.qrCode).toBeDefined();
        expect(mfaSetup.backupCodes).toHaveLength(2);
      });
    });

    it('should verify MFA code', async () => {
      mockAuthService.verifyMFA.mockResolvedValueOnce({
        isVerified: true
      });
      
      const { result } = renderHook(() => useAuth(), { wrapper });
      
      await act(async () => {
        const verified = await result.current.verifyMFA('123456');
        expect(verified).toBe(true);
      });
    });
  });
});