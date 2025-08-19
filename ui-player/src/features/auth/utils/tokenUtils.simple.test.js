/**
 * Simple Token Utils Tests
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  decodeToken,
  isTokenValid,
  getTokenExpiration,
  shouldRefreshToken,
  encodeToken,
  decodeStoredToken,
  SimpleTokenManager,
  simpleTokenManager
} from './tokenUtils.simple.js';

describe('Token Utility Functions', () => {
  describe('decodeToken', () => {
    it('should decode valid JWT token', () => {
      // Create a valid JWT token structure (header.payload.signature)
      const payload = { sub: '123', exp: Math.floor(Date.now() / 1000) + 3600, iat: Math.floor(Date.now() / 1000) };
      const encodedPayload = btoa(JSON.stringify(payload));
      const token = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.${encodedPayload}.signature`;

      const decoded = decodeToken(token);
      expect(decoded).toEqual(payload);
    });

    it('should handle token with URL-safe base64 encoding', () => {
      const payload = { sub: '123', exp: Math.floor(Date.now() / 1000) + 3600 };
      const encodedPayload = btoa(JSON.stringify(payload)).replace(/\+/g, '-').replace(/\//g, '_');
      const token = `header.${encodedPayload}.signature`;

      const decoded = decodeToken(token);
      expect(decoded).toEqual(payload);
    });

    it('should return null for invalid token format', () => {
      expect(decodeToken('invalid.token')).toBeNull();
      expect(decodeToken('invalid')).toBeNull();
      expect(decodeToken('')).toBeNull();
      expect(decodeToken(null)).toBeNull();
      expect(decodeToken(undefined)).toBeNull();
    });

    it('should return null for non-string input', () => {
      expect(decodeToken(123)).toBeNull();
      expect(decodeToken({})).toBeNull();
      expect(decodeToken([])).toBeNull();
    });

    it('should handle invalid JSON in payload', () => {
      const invalidPayload = btoa('invalid-json-{');
      const token = `header.${invalidPayload}.signature`;

      const decoded = decodeToken(token);
      expect(decoded).toBeNull();
    });

    it('should handle decoding errors gracefully', () => {
      // Mock console.error to avoid test output pollution
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      // Token with invalid base64
      const token = 'header.invalid-base64!@#.signature';
      const result = decodeToken(token);
      
      expect(result).toBeNull();
      expect(consoleSpy).toHaveBeenCalled();
      
      consoleSpy.mockRestore();
    });
  });

  describe('isTokenValid', () => {
    it('should return true for valid non-expired token', () => {
      const futureTime = Math.floor(Date.now() / 1000) + 3600; // 1 hour from now
      const payload = { exp: futureTime };
      const encodedPayload = btoa(JSON.stringify(payload));
      const token = `header.${encodedPayload}.signature`;

      expect(isTokenValid(token)).toBe(true);
    });

    it('should return false for expired token', () => {
      const pastTime = Math.floor(Date.now() / 1000) - 3600; // 1 hour ago
      const payload = { exp: pastTime };
      const encodedPayload = btoa(JSON.stringify(payload));
      const token = `header.${encodedPayload}.signature`;

      expect(isTokenValid(token)).toBe(false);
    });

    it('should return false for token without expiration', () => {
      const payload = { sub: '123' }; // No exp field
      const encodedPayload = btoa(JSON.stringify(payload));
      const token = `header.${encodedPayload}.signature`;

      expect(isTokenValid(token)).toBe(false);
    });

    it('should return false for null/undefined token', () => {
      expect(isTokenValid(null)).toBe(false);
      expect(isTokenValid(undefined)).toBe(false);
      expect(isTokenValid('')).toBe(false);
    });

    it('should return false for invalid token', () => {
      expect(isTokenValid('invalid-token')).toBe(false);
    });

    it('should handle token expiring exactly now', () => {
      const nowTime = Math.floor(Date.now() / 1000);
      const payload = { exp: nowTime };
      const encodedPayload = btoa(JSON.stringify(payload));
      const token = `header.${encodedPayload}.signature`;

      expect(isTokenValid(token)).toBe(false);
    });
  });

  describe('getTokenExpiration', () => {
    it('should return correct expiration date', () => {
      const expTime = Math.floor(Date.now() / 1000) + 3600; // 1 hour from now
      const payload = { exp: expTime };
      const encodedPayload = btoa(JSON.stringify(payload));
      const token = `header.${encodedPayload}.signature`;

      const expiration = getTokenExpiration(token);
      expect(expiration).toBeInstanceOf(Date);
      expect(expiration.getTime()).toBe(expTime * 1000);
    });

    it('should return null for token without expiration', () => {
      const payload = { sub: '123' };
      const encodedPayload = btoa(JSON.stringify(payload));
      const token = `header.${encodedPayload}.signature`;

      expect(getTokenExpiration(token)).toBeNull();
    });

    it('should return null for invalid token', () => {
      expect(getTokenExpiration('invalid')).toBeNull();
      expect(getTokenExpiration(null)).toBeNull();
      expect(getTokenExpiration('')).toBeNull();
    });
  });

  describe('shouldRefreshToken', () => {
    it('should return true for expired token', () => {
      const pastTime = Math.floor(Date.now() / 1000) - 3600;
      const payload = { exp: pastTime };
      const encodedPayload = btoa(JSON.stringify(payload));
      const token = `header.${encodedPayload}.signature`;

      expect(shouldRefreshToken(token)).toBe(true);
    });

    it('should return true for token expiring within threshold', () => {
      const nearFuture = Math.floor(Date.now() / 1000) + 60; // 1 minute from now
      const payload = { exp: nearFuture };
      const encodedPayload = btoa(JSON.stringify(payload));
      const token = `header.${encodedPayload}.signature`;

      expect(shouldRefreshToken(token, 5 * 60 * 1000)).toBe(true); // 5 minute threshold
    });

    it('should return false for token with plenty of time left', () => {
      const farFuture = Math.floor(Date.now() / 1000) + 3600; // 1 hour from now
      const payload = { exp: farFuture };
      const encodedPayload = btoa(JSON.stringify(payload));
      const token = `header.${encodedPayload}.signature`;

      expect(shouldRefreshToken(token, 5 * 60 * 1000)).toBe(false); // 5 minute threshold
    });

    it('should use custom threshold', () => {
      const shortFuture = Math.floor(Date.now() / 1000) + 60; // 1 minute from now
      const payload = { exp: shortFuture };
      const encodedPayload = btoa(JSON.stringify(payload));
      const token = `header.${encodedPayload}.signature`;

      expect(shouldRefreshToken(token, 30 * 1000)).toBe(false); // 30 second threshold
      expect(shouldRefreshToken(token, 2 * 60 * 1000)).toBe(true); // 2 minute threshold
    });

    it('should return true for invalid token', () => {
      expect(shouldRefreshToken('invalid')).toBe(true);
      expect(shouldRefreshToken(null)).toBe(true);
      expect(shouldRefreshToken('')).toBe(true);
    });
  });

  describe('encodeToken', () => {
    it('should encode string to base64', () => {
      const token = 'test-token-123';
      const encoded = encodeToken(token);
      expect(encoded).toBe(btoa(token));
    });

    it('should handle empty string', () => {
      expect(encodeToken('')).toBe('');
    });

    it('should handle special characters', () => {
      const token = 'token-with-special-chars: !@#$%^&*()';
      const encoded = encodeToken(token);
      expect(encoded).toBe(btoa(token));
    });

    it('should handle encoding errors gracefully', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      // Mock btoa to throw error
      const originalBtoa = global.btoa;
      global.btoa = vi.fn().mockImplementation(() => {
        throw new Error('Encoding failed');
      });

      const result = encodeToken('test');
      expect(result).toBeNull();
      expect(consoleSpy).toHaveBeenCalled();

      // Restore btoa
      global.btoa = originalBtoa;
      consoleSpy.mockRestore();
    });
  });

  describe('decodeStoredToken', () => {
    it('should decode base64 encoded token', () => {
      const originalToken = 'test-token-123';
      const encoded = btoa(originalToken);
      
      expect(decodeStoredToken(encoded)).toBe(originalToken);
    });

    it('should return null for null/undefined input', () => {
      expect(decodeStoredToken(null)).toBeNull();
      expect(decodeStoredToken(undefined)).toBeNull();
      expect(decodeStoredToken('')).toBeNull();
    });

    it('should handle decoding errors gracefully', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      const result = decodeStoredToken('invalid-base64!@#');
      expect(result).toBeNull();
      expect(consoleSpy).toHaveBeenCalled();
      
      consoleSpy.mockRestore();
    });
  });
});

describe('SimpleTokenManager', () => {
  let tokenManager;

  beforeEach(() => {
    tokenManager = new SimpleTokenManager();
    // Clear storage
    localStorage.clear();
    sessionStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  describe('constructor', () => {
    it('should initialize with empty listeners set', () => {
      expect(tokenManager.listeners).toBeInstanceOf(Set);
      expect(tokenManager.listeners.size).toBe(0);
    });

    it('should initialize sessionTimeoutWarningShown as false', () => {
      expect(tokenManager.sessionTimeoutWarningShown).toBe(false);
    });
  });

  describe('setTokens', () => {
    it('should store tokens in sessionStorage by default', async () => {
      const tokens = {
        accessToken: 'access-123',
        refreshToken: 'refresh-456',
        idToken: 'id-789'
      };

      await tokenManager.setTokens(tokens);

      expect(sessionStorage.getItem('authToken')).toBeTruthy();
      expect(sessionStorage.getItem('refreshToken')).toBeTruthy();
      expect(sessionStorage.getItem('idToken')).toBeTruthy();
      expect(localStorage.getItem('authToken')).toBeNull();
    });

    it('should store tokens in localStorage when rememberMe is true', async () => {
      const tokens = {
        accessToken: 'access-123',
        refreshToken: 'refresh-456'
      };

      await tokenManager.setTokens(tokens, true);

      expect(localStorage.getItem('authToken')).toBeTruthy();
      expect(localStorage.getItem('refreshToken')).toBeTruthy();
      expect(localStorage.getItem('rememberMe')).toBe('true');
      expect(sessionStorage.getItem('authToken')).toBeNull();
    });

    it('should handle partial token objects', async () => {
      const tokens = {
        accessToken: 'access-only'
      };

      await tokenManager.setTokens(tokens);

      expect(sessionStorage.getItem('authToken')).toBeTruthy();
      expect(sessionStorage.getItem('refreshToken')).toBeNull();
      expect(sessionStorage.getItem('idToken')).toBeNull();
    });

    it('should notify listeners when tokens are set', async () => {
      const listener = vi.fn();
      tokenManager.addListener(listener);

      const tokens = { accessToken: 'access-123' };
      await tokenManager.setTokens(tokens);

      expect(listener).toHaveBeenCalledWith('tokensUpdated', tokens);
    });

    it('should handle encoding failures gracefully', async () => {
      // Mock encodeToken to return null
      const originalBtoa = global.btoa;
      global.btoa = vi.fn().mockReturnValue(null);

      const tokens = { accessToken: 'test' };
      await tokenManager.setTokens(tokens);

      // Should not store anything if encoding fails
      expect(sessionStorage.getItem('authToken')).toBeNull();

      global.btoa = originalBtoa;
    });

    it('should handle storage errors', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      // Mock sessionStorage.setItem to throw
      const originalSetItem = sessionStorage.setItem;
      sessionStorage.setItem = vi.fn().mockImplementation(() => {
        throw new Error('Storage full');
      });

      const tokens = { accessToken: 'test' };
      
      await expect(tokenManager.setTokens(tokens)).rejects.toThrow('Storage full');
      expect(consoleSpy).toHaveBeenCalled();

      sessionStorage.setItem = originalSetItem;
      consoleSpy.mockRestore();
    });
  });

  describe('getTokens', () => {
    it('should retrieve tokens from sessionStorage by default', async () => {
      const originalTokens = {
        accessToken: 'access-123',
        refreshToken: 'refresh-456'
      };

      // Store tokens first
      await tokenManager.setTokens(originalTokens);

      const retrievedTokens = await tokenManager.getTokens();
      expect(retrievedTokens.accessToken).toBe('access-123');
      expect(retrievedTokens.refreshToken).toBe('refresh-456');
    });

    it('should retrieve tokens from localStorage when rememberMe is true', async () => {
      const originalTokens = {
        accessToken: 'access-123',
        refreshToken: 'refresh-456'
      };

      await tokenManager.setTokens(originalTokens, true);
      const retrievedTokens = await tokenManager.getTokens();

      expect(retrievedTokens.accessToken).toBe('access-123');
      expect(retrievedTokens.refreshToken).toBe('refresh-456');
    });

    it('should return null when no tokens are stored', async () => {
      const tokens = await tokenManager.getTokens();
      expect(tokens).toBeNull();
    });

    it('should return null when access token is missing', async () => {
      sessionStorage.setItem('refreshToken', btoa('refresh-only'));

      const tokens = await tokenManager.getTokens();
      expect(tokens).toBeNull();
    });

    it('should handle decoding failures', async () => {
      sessionStorage.setItem('authToken', 'invalid-base64!@#');

      const tokens = await tokenManager.getTokens();
      expect(tokens).toBeNull();
    });

    it('should handle storage errors gracefully', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      // Mock localStorage.getItem to throw
      const originalGetItem = localStorage.getItem;
      localStorage.getItem = vi.fn().mockImplementation(() => {
        throw new Error('Storage error');
      });

      const tokens = await tokenManager.getTokens();
      expect(tokens).toBeNull();
      expect(consoleSpy).toHaveBeenCalled();

      localStorage.getItem = originalGetItem;
      consoleSpy.mockRestore();
    });
  });

  describe('clearTokens', () => {
    it('should clear all tokens from both storages', () => {
      // Set up some tokens
      localStorage.setItem('authToken', 'test');
      sessionStorage.setItem('refreshToken', 'test');

      tokenManager.clearTokens();

      expect(localStorage.getItem('authToken')).toBeNull();
      expect(sessionStorage.getItem('authToken')).toBeNull();
      expect(localStorage.getItem('refreshToken')).toBeNull();
      expect(sessionStorage.getItem('refreshToken')).toBeNull();
    });

    it('should reset sessionTimeoutWarningShown', () => {
      tokenManager.sessionTimeoutWarningShown = true;

      tokenManager.clearTokens();

      expect(tokenManager.sessionTimeoutWarningShown).toBe(false);
    });

    it('should notify listeners when tokens are cleared', () => {
      const listener = vi.fn();
      tokenManager.addListener(listener);

      tokenManager.clearTokens();

      expect(listener).toHaveBeenCalledWith('tokensCleared');
    });
  });

  describe('isAuthenticated', () => {
    it('should return true for valid non-expired token', async () => {
      const futureTime = Math.floor(Date.now() / 1000) + 3600;
      const payload = { exp: futureTime };
      const encodedPayload = btoa(JSON.stringify(payload));
      const token = `header.${encodedPayload}.signature`;

      await tokenManager.setTokens({ accessToken: token });

      const isAuth = await tokenManager.isAuthenticated();
      expect(isAuth).toBe(true);
    });

    it('should return false for expired token', async () => {
      const pastTime = Math.floor(Date.now() / 1000) - 3600;
      const payload = { exp: pastTime };
      const encodedPayload = btoa(JSON.stringify(payload));
      const token = `header.${encodedPayload}.signature`;

      await tokenManager.setTokens({ accessToken: token });

      const isAuth = await tokenManager.isAuthenticated();
      expect(isAuth).toBe(false);
    });

    it('should return false when no tokens exist', async () => {
      const isAuth = await tokenManager.isAuthenticated();
      expect(isAuth).toBe(false);
    });

    it('should handle errors gracefully', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      // Mock getTokens to throw
      tokenManager.getTokens = vi.fn().mockRejectedValue(new Error('Token error'));

      const isAuth = await tokenManager.isAuthenticated();
      expect(isAuth).toBe(false);
      expect(consoleSpy).toHaveBeenCalled();

      consoleSpy.mockRestore();
    });
  });

  describe('shouldRefresh', () => {
    it('should return true for tokens needing refresh', async () => {
      const soonTime = Math.floor(Date.now() / 1000) + 60; // 1 minute from now
      const payload = { exp: soonTime };
      const encodedPayload = btoa(JSON.stringify(payload));
      const token = `header.${encodedPayload}.signature`;

      await tokenManager.setTokens({ accessToken: token });

      const shouldRefresh = await tokenManager.shouldRefresh();
      expect(shouldRefresh).toBe(true);
    });

    it('should return false for tokens with time left', async () => {
      const futureTime = Math.floor(Date.now() / 1000) + 3600; // 1 hour from now
      const payload = { exp: futureTime };
      const encodedPayload = btoa(JSON.stringify(payload));
      const token = `header.${encodedPayload}.signature`;

      await tokenManager.setTokens({ accessToken: token });

      const shouldRefresh = await tokenManager.shouldRefresh();
      expect(shouldRefresh).toBe(false);
    });

    it('should handle errors gracefully', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      tokenManager.getTokens = vi.fn().mockRejectedValue(new Error('Token error'));

      const shouldRefresh = await tokenManager.shouldRefresh();
      expect(shouldRefresh).toBe(false);
      expect(consoleSpy).toHaveBeenCalled();

      consoleSpy.mockRestore();
    });
  });

  describe('getTimeUntilExpiration', () => {
    it('should return correct time until expiration', async () => {
      const futureTime = Math.floor(Date.now() / 1000) + 3600; // 1 hour from now
      const payload = { exp: futureTime };
      const encodedPayload = btoa(JSON.stringify(payload));
      const token = `header.${encodedPayload}.signature`;

      await tokenManager.setTokens({ accessToken: token });

      const timeLeft = await tokenManager.getTimeUntilExpiration();
      expect(timeLeft).toBeGreaterThan(3590000); // Should be close to 1 hour in milliseconds
      expect(timeLeft).toBeLessThan(3610000);
    });

    it('should return null when no tokens exist', async () => {
      const timeLeft = await tokenManager.getTimeUntilExpiration();
      expect(timeLeft).toBeNull();
    });

    it('should return 0 for expired tokens', async () => {
      const pastTime = Math.floor(Date.now() / 1000) - 3600; // 1 hour ago
      const payload = { exp: pastTime };
      const encodedPayload = btoa(JSON.stringify(payload));
      const token = `header.${encodedPayload}.signature`;

      await tokenManager.setTokens({ accessToken: token });

      const timeLeft = await tokenManager.getTimeUntilExpiration();
      expect(timeLeft).toBe(0);
    });

    it('should handle errors gracefully', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      tokenManager.getTokens = vi.fn().mockRejectedValue(new Error('Token error'));

      const timeLeft = await tokenManager.getTimeUntilExpiration();
      expect(timeLeft).toBeNull();
      expect(consoleSpy).toHaveBeenCalled();

      consoleSpy.mockRestore();
    });
  });

  describe('shouldShowSessionTimeoutWarning', () => {
    it('should return false if warning already shown', async () => {
      tokenManager.sessionTimeoutWarningShown = true;

      const shouldShow = await tokenManager.shouldShowSessionTimeoutWarning();
      expect(shouldShow).toBe(false);
    });

    it('should return true when token expires within warning threshold', async () => {
      const soonTime = Math.floor(Date.now() / 1000) + 60; // 1 minute from now
      const payload = { exp: soonTime };
      const encodedPayload = btoa(JSON.stringify(payload));
      const token = `header.${encodedPayload}.signature`;

      await tokenManager.setTokens({ accessToken: token });

      const shouldShow = await tokenManager.shouldShowSessionTimeoutWarning();
      expect(shouldShow).toBe(true);
    });

    it('should return false when token has plenty of time left', async () => {
      const futureTime = Math.floor(Date.now() / 1000) + 3600; // 1 hour from now
      const payload = { exp: futureTime };
      const encodedPayload = btoa(JSON.stringify(payload));
      const token = `header.${encodedPayload}.signature`;

      await tokenManager.setTokens({ accessToken: token });

      const shouldShow = await tokenManager.shouldShowSessionTimeoutWarning();
      expect(shouldShow).toBe(false);
    });

    it('should return false for expired tokens', async () => {
      const pastTime = Math.floor(Date.now() / 1000) - 3600;
      const payload = { exp: pastTime };
      const encodedPayload = btoa(JSON.stringify(payload));
      const token = `header.${encodedPayload}.signature`;

      await tokenManager.setTokens({ accessToken: token });

      const shouldShow = await tokenManager.shouldShowSessionTimeoutWarning();
      expect(shouldShow).toBe(false);
    });
  });

  describe('markSessionTimeoutWarningShown', () => {
    it('should set sessionTimeoutWarningShown to true', () => {
      expect(tokenManager.sessionTimeoutWarningShown).toBe(false);
      
      tokenManager.markSessionTimeoutWarningShown();
      
      expect(tokenManager.sessionTimeoutWarningShown).toBe(true);
    });
  });

  describe('listener management', () => {
    it('should add listeners correctly', () => {
      const listener1 = vi.fn();
      const listener2 = vi.fn();

      tokenManager.addListener(listener1);
      tokenManager.addListener(listener2);

      expect(tokenManager.listeners.has(listener1)).toBe(true);
      expect(tokenManager.listeners.has(listener2)).toBe(true);
      expect(tokenManager.listeners.size).toBe(2);
    });

    it('should remove listeners correctly', () => {
      const listener1 = vi.fn();
      const listener2 = vi.fn();

      tokenManager.addListener(listener1);
      tokenManager.addListener(listener2);
      tokenManager.removeListener(listener1);

      expect(tokenManager.listeners.has(listener1)).toBe(false);
      expect(tokenManager.listeners.has(listener2)).toBe(true);
      expect(tokenManager.listeners.size).toBe(1);
    });

    it('should notify all listeners with correct arguments', () => {
      const listener1 = vi.fn();
      const listener2 = vi.fn();

      tokenManager.addListener(listener1);
      tokenManager.addListener(listener2);

      tokenManager.notifyListeners('test-event', { data: 'test' });

      expect(listener1).toHaveBeenCalledWith('test-event', { data: 'test' });
      expect(listener2).toHaveBeenCalledWith('test-event', { data: 'test' });
    });

    it('should handle listener errors gracefully', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const errorListener = vi.fn().mockImplementation(() => {
        throw new Error('Listener error');
      });
      const goodListener = vi.fn();

      tokenManager.addListener(errorListener);
      tokenManager.addListener(goodListener);

      tokenManager.notifyListeners('test-event', {});

      expect(errorListener).toHaveBeenCalled();
      expect(goodListener).toHaveBeenCalled();
      expect(consoleSpy).toHaveBeenCalled();

      consoleSpy.mockRestore();
    });
  });

  describe('singleton instance', () => {
    it('should export a singleton instance', () => {
      expect(simpleTokenManager).toBeInstanceOf(SimpleTokenManager);
    });

    it('should be the same instance on multiple imports', async () => {
      const module1 = await import('./tokenUtils.simple.js');
      const module2 = await import('./tokenUtils.simple.js');
      
      expect(module1.simpleTokenManager).toBe(module2.simpleTokenManager);
    });
  });
});