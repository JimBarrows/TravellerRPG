import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { 
  TokenManager,
  isTokenValid,
  getTokenExpiration,
  shouldRefreshToken,
  decodeToken,
  tokenManager
} from './tokenUtils';

// Mock localStorage and sessionStorage
const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn()
};

const mockSessionStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn()
};

Object.defineProperty(window, 'localStorage', { value: mockLocalStorage });
Object.defineProperty(window, 'sessionStorage', { value: mockSessionStorage });

// Test JWT tokens (valid format but test data)
const validToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjk5OTk5OTk5OTl9.8lXzjwb_lfJn3ZlHpxwpew4WXMpjCA6-TAlKxLILOdg';
const expiredToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjE1MTYyMzkwMjJ9.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';

describe('Token Utilities', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('decodeToken', () => {
    it('should decode a valid JWT token', () => {
      const decoded = decodeToken(validToken);
      expect(decoded).toHaveProperty('sub', '1234567890');
      expect(decoded).toHaveProperty('name', 'John Doe');
      expect(decoded).toHaveProperty('exp');
    });

    it('should return null for invalid token', () => {
      const decoded = decodeToken('invalid.token');
      expect(decoded).toBeNull();
    });

    it('should return null for empty token', () => {
      const decoded = decodeToken('');
      expect(decoded).toBeNull();
    });
  });

  describe('isTokenValid', () => {
    it('should return true for valid non-expired token', () => {
      const isValid = isTokenValid(validToken);
      expect(isValid).toBe(true);
    });

    it('should return false for expired token', () => {
      const isValid = isTokenValid(expiredToken);
      expect(isValid).toBe(false);
    });

    it('should return false for invalid token', () => {
      const isValid = isTokenValid('invalid.token');
      expect(isValid).toBe(false);
    });

    it('should return false for null token', () => {
      const isValid = isTokenValid(null);
      expect(isValid).toBe(false);
    });
  });

  describe('getTokenExpiration', () => {
    it('should return expiration timestamp for valid token', () => {
      const expiration = getTokenExpiration(validToken);
      expect(typeof expiration).toBe('number');
      expect(expiration).toBeGreaterThan(Date.now());
    });

    it('should return null for invalid token', () => {
      const expiration = getTokenExpiration('invalid.token');
      expect(expiration).toBeNull();
    });
  });

  describe('shouldRefreshToken', () => {
    it('should return true if token expires within threshold', () => {
      // Create a token that expires in 4 minutes (less than 5 minute threshold)
      const futureTime = Math.floor(Date.now() / 1000) + (4 * 60);
      const soonToExpireToken = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.${btoa(JSON.stringify({
        sub: '1234567890',
        exp: futureTime
      }))}.signature`;
      
      const shouldRefresh = shouldRefreshToken(soonToExpireToken);
      expect(shouldRefresh).toBe(true);
    });

    it('should return false if token has plenty of time left', () => {
      const shouldRefresh = shouldRefreshToken(validToken);
      expect(shouldRefresh).toBe(false);
    });

    it('should return false for invalid tokens', () => {
      const shouldRefresh = shouldRefreshToken('invalid.token');
      expect(shouldRefresh).toBe(false);
    });
  });

  describe('TokenManager', () => {
    let manager;

    beforeEach(() => {
      manager = new TokenManager();
    });

    describe('setTokens', () => {
      it('should store tokens in localStorage when rememberMe is true', () => {
        const tokens = {
          accessToken: validToken,
          refreshToken: 'refresh_token',
          idToken: 'id_token'
        };

        manager.setTokens(tokens, true);

        expect(mockLocalStorage.setItem).toHaveBeenCalledWith('accessToken', validToken);
        expect(mockLocalStorage.setItem).toHaveBeenCalledWith('refreshToken', 'refresh_token');
        expect(mockLocalStorage.setItem).toHaveBeenCalledWith('idToken', 'id_token');
        expect(mockLocalStorage.setItem).toHaveBeenCalledWith('rememberMe', 'true');
      });

      it('should store tokens in sessionStorage when rememberMe is false', () => {
        const tokens = {
          accessToken: validToken,
          refreshToken: 'refresh_token',
          idToken: 'id_token'
        };

        manager.setTokens(tokens, false);

        expect(mockSessionStorage.setItem).toHaveBeenCalledWith('accessToken', validToken);
        expect(mockSessionStorage.setItem).toHaveBeenCalledWith('refreshToken', 'refresh_token');
        expect(mockSessionStorage.setItem).toHaveBeenCalledWith('idToken', 'id_token');
        expect(mockSessionStorage.setItem).toHaveBeenCalledWith('rememberMe', 'false');
      });
    });

    describe('getTokens', () => {
      it('should retrieve tokens from localStorage when rememberMe is true', () => {
        mockLocalStorage.getItem.mockImplementation((key) => {
          if (key === 'rememberMe') return 'true';
          if (key === 'accessToken') return validToken;
          if (key === 'refreshToken') return 'refresh_token';
          if (key === 'idToken') return 'id_token';
          return null;
        });

        const tokens = manager.getTokens();

        expect(tokens).toEqual({
          accessToken: validToken,
          refreshToken: 'refresh_token',
          idToken: 'id_token',
          rememberMe: true
        });
      });

      it('should retrieve tokens from sessionStorage when rememberMe is false', () => {
        mockLocalStorage.getItem.mockImplementation((key) => {
          if (key === 'rememberMe') return 'false';
          return null;
        });

        mockSessionStorage.getItem.mockImplementation((key) => {
          if (key === 'accessToken') return validToken;
          if (key === 'refreshToken') return 'refresh_token';
          if (key === 'idToken') return 'id_token';
          return null;
        });

        const tokens = manager.getTokens();

        expect(tokens).toEqual({
          accessToken: validToken,
          refreshToken: 'refresh_token',
          idToken: 'id_token',
          rememberMe: false
        });
      });
    });

    describe('getValidAccessToken', () => {
      it('should return valid token if not expired and not needing refresh', async () => {
        mockLocalStorage.getItem.mockImplementation((key) => {
          if (key === 'rememberMe') return 'true';
          if (key === 'accessToken') return validToken;
          return null;
        });

        const token = await manager.getValidAccessToken();
        expect(token).toBe(validToken);
      });

      it('should return null for expired token without refresh token', async () => {
        mockLocalStorage.getItem.mockImplementation((key) => {
          if (key === 'rememberMe') return 'true';
          if (key === 'accessToken') return expiredToken;
          return null;
        });

        const token = await manager.getValidAccessToken();
        expect(token).toBeNull();
      });
    });

    describe('clearTokens', () => {
      it('should clear all tokens from both storages', () => {
        manager.clearTokens();

        expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('accessToken');
        expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('refreshToken');
        expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('idToken');
        expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('rememberMe');

        expect(mockSessionStorage.removeItem).toHaveBeenCalledWith('accessToken');
        expect(mockSessionStorage.removeItem).toHaveBeenCalledWith('refreshToken');
        expect(mockSessionStorage.removeItem).toHaveBeenCalledWith('idToken');
        expect(mockSessionStorage.removeItem).toHaveBeenCalledWith('rememberMe');
      });
    });

    describe('isAuthenticated', () => {
      it('should return true when valid access token exists', () => {
        mockLocalStorage.getItem.mockImplementation((key) => {
          if (key === 'rememberMe') return 'true';
          if (key === 'accessToken') return validToken;
          return null;
        });

        const isAuth = manager.isAuthenticated();
        expect(isAuth).toBe(true);
      });

      it('should return false when no access token exists', () => {
        mockLocalStorage.getItem.mockReturnValue(null);
        mockSessionStorage.getItem.mockReturnValue(null);

        const isAuth = manager.isAuthenticated();
        expect(isAuth).toBe(false);
      });

      it('should return false when access token is expired', () => {
        mockLocalStorage.getItem.mockImplementation((key) => {
          if (key === 'rememberMe') return 'true';
          if (key === 'accessToken') return expiredToken;
          return null;
        });

        const isAuth = manager.isAuthenticated();
        expect(isAuth).toBe(false);
      });
    });

    describe('getCurrentUserInfo', () => {
      it('should return user info from valid ID token', () => {
        const idToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwiZW1haWwiOiJ0ZXN0QGV4YW1wbGUuY29tIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsImNvZ25pdG86dXNlcm5hbWUiOiJ0ZXN0dXNlciIsImdpdmVuX25hbWUiOiJKb2huIiwiZmFtaWx5X25hbWUiOiJEb2UiLCJleHAiOjk5OTk5OTk5OTl9.invalid-signature';
        
        mockLocalStorage.getItem.mockImplementation((key) => {
          if (key === 'rememberMe') return 'true';
          if (key === 'idToken') return idToken;
          return null;
        });

        const userInfo = manager.getCurrentUserInfo();
        
        expect(userInfo).toEqual({
          sub: '1234567890',
          email: 'test@example.com',
          emailVerified: true,
          username: 'testuser',
          givenName: 'John',
          familyName: 'Doe'
        });
      });

      it('should return null when no valid ID token exists', () => {
        mockLocalStorage.getItem.mockReturnValue(null);
        mockSessionStorage.getItem.mockReturnValue(null);

        const userInfo = manager.getCurrentUserInfo();
        expect(userInfo).toBeNull();
      });
    });
  });

  describe('tokenManager singleton', () => {
    it('should provide a singleton instance', () => {
      expect(tokenManager).toBeInstanceOf(TokenManager);
    });
  });
});