import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { 
  TokenManager,
  isTokenValid,
  getTokenExpiration,
  shouldRefreshToken,
  decodeToken,
  encryptToken,
  decryptToken
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

// Mock crypto for encryption
Object.defineProperty(global, 'crypto', {
  value: {
    subtle: {
      importKey: vi.fn(),
      encrypt: vi.fn(),
      decrypt: vi.fn(),
      generateKey: vi.fn(),
      deriveKey: vi.fn()
    },
    getRandomValues: vi.fn(() => new Uint8Array(16))
  }
});

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
    it('should return expiration date for valid token', () => {
      const expiration = getTokenExpiration(validToken);
      expect(expiration).toBeInstanceOf(Date);
      expect(expiration.getTime()).toBeGreaterThan(Date.now());
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

    it('should return true for invalid/expired tokens', () => {
      const shouldRefresh = shouldRefreshToken(expiredToken);
      expect(shouldRefresh).toBe(true);
    });
  });

  describe('TokenManager', () => {
    let tokenManager;

    beforeEach(() => {
      tokenManager = new TokenManager();
    });

    describe('setTokens', () => {
      it('should store tokens in localStorage when rememberMe is true', async () => {
        const tokens = {
          accessToken: validToken,
          refreshToken: 'refresh123',
          idToken: 'id123'
        };

        await tokenManager.setTokens(tokens, true);

        expect(mockLocalStorage.setItem).toHaveBeenCalledWith('authToken', expect.any(String));
        expect(mockLocalStorage.setItem).toHaveBeenCalledWith('refreshToken', expect.any(String));
        expect(mockLocalStorage.setItem).toHaveBeenCalledWith('idToken', expect.any(String));
        expect(mockLocalStorage.setItem).toHaveBeenCalledWith('rememberMe', 'true');
      });

      it('should store tokens in sessionStorage when rememberMe is false', async () => {
        const tokens = {
          accessToken: validToken,
          refreshToken: 'refresh123',
          idToken: 'id123'
        };

        await tokenManager.setTokens(tokens, false);

        expect(mockSessionStorage.setItem).toHaveBeenCalledWith('authToken', expect.any(String));
        expect(mockSessionStorage.setItem).toHaveBeenCalledWith('refreshToken', expect.any(String));
        expect(mockSessionStorage.setItem).toHaveBeenCalledWith('idToken', expect.any(String));
      });
    });

    describe('getTokens', () => {
      it('should retrieve tokens from localStorage when rememberMe was used', async () => {
        mockLocalStorage.getItem.mockImplementation((key) => {
          if (key === 'rememberMe') return 'true';
          if (key === 'authToken') return 'encrypted_access_token';
          if (key === 'refreshToken') return 'encrypted_refresh_token';
          if (key === 'idToken') return 'encrypted_id_token';
          return null;
        });

        // Mock decryption to return the original tokens
        vi.mocked(crypto.subtle.decrypt).mockResolvedValue(
          new TextEncoder().encode(validToken)
        );

        const tokens = await tokenManager.getTokens();

        expect(mockLocalStorage.getItem).toHaveBeenCalledWith('rememberMe');
        expect(mockLocalStorage.getItem).toHaveBeenCalledWith('authToken');
        expect(tokens).toHaveProperty('accessToken');
      });

      it('should retrieve tokens from sessionStorage when rememberMe was not used', async () => {
        mockLocalStorage.getItem.mockReturnValue(null);
        mockSessionStorage.getItem.mockImplementation((key) => {
          if (key === 'authToken') return 'encrypted_access_token';
          return 'encrypted_token';
        });

        // Mock decryption
        vi.mocked(crypto.subtle.decrypt).mockResolvedValue(
          new TextEncoder().encode(validToken)
        );

        const tokens = await tokenManager.getTokens();

        expect(mockSessionStorage.getItem).toHaveBeenCalledWith('authToken');
        expect(tokens).toHaveProperty('accessToken');
      });
    });

    describe('clearTokens', () => {
      it('should clear tokens from both localStorage and sessionStorage', () => {
        tokenManager.clearTokens();

        expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('authToken');
        expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('refreshToken');
        expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('idToken');
        expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('rememberMe');
        
        expect(mockSessionStorage.removeItem).toHaveBeenCalledWith('authToken');
        expect(mockSessionStorage.removeItem).toHaveBeenCalledWith('refreshToken');
        expect(mockSessionStorage.removeItem).toHaveBeenCalledWith('idToken');
      });
    });

    describe('isAuthenticated', () => {
      it('should return true when valid token exists', async () => {
        mockLocalStorage.getItem.mockImplementation((key) => {
          if (key === 'rememberMe') return 'true';
          if (key === 'authToken') return 'encrypted_access_token';
          return null;
        });

        // Mock decryption to return valid token
        vi.mocked(crypto.subtle.decrypt).mockResolvedValue(
          new TextEncoder().encode(validToken)
        );

        const isAuth = await tokenManager.isAuthenticated();
        expect(isAuth).toBe(true);
      });

      it('should return false when no token exists', async () => {
        mockLocalStorage.getItem.mockReturnValue(null);
        mockSessionStorage.getItem.mockReturnValue(null);

        const isAuth = await tokenManager.isAuthenticated();
        expect(isAuth).toBe(false);
      });

      it('should return false when token is expired', async () => {
        mockLocalStorage.getItem.mockImplementation((key) => {
          if (key === 'rememberMe') return 'true';
          if (key === 'authToken') return 'encrypted_expired_token';
          return null;
        });

        // Mock decryption to return expired token
        vi.mocked(crypto.subtle.decrypt).mockResolvedValue(
          new TextEncoder().encode(expiredToken)
        );

        const isAuth = await tokenManager.isAuthenticated();
        expect(isAuth).toBe(false);
      });
    });
  });

  describe('Encryption/Decryption', () => {
    beforeEach(() => {
      // Mock crypto.subtle methods for encryption tests
      vi.mocked(crypto.subtle.importKey).mockResolvedValue({});
      vi.mocked(crypto.subtle.deriveKey).mockResolvedValue({});
      vi.mocked(crypto.subtle.encrypt).mockResolvedValue(new ArrayBuffer(32));
      vi.mocked(crypto.subtle.decrypt).mockResolvedValue(
        new TextEncoder().encode('decrypted_data')
      );
    });

    it('should encrypt a token', async () => {
      const encrypted = await encryptToken('test_token');
      expect(crypto.subtle.encrypt).toHaveBeenCalled();
      expect(encrypted).toBeDefined();
    });

    it('should decrypt a token', async () => {
      const encryptedData = 'base64_encrypted_data';
      const decrypted = await decryptToken(encryptedData);
      expect(crypto.subtle.decrypt).toHaveBeenCalled();
      expect(decrypted).toBe('decrypted_data');
    });

    it('should handle encryption errors gracefully', async () => {
      vi.mocked(crypto.subtle.encrypt).mockRejectedValue(new Error('Encryption failed'));
      
      const encrypted = await encryptToken('test_token');
      expect(encrypted).toBeNull();
    });

    it('should handle decryption errors gracefully', async () => {
      vi.mocked(crypto.subtle.decrypt).mockRejectedValue(new Error('Decryption failed'));
      
      const decrypted = await decryptToken('invalid_data');
      expect(decrypted).toBeNull();
    });
  });
});