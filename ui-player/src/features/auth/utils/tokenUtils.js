/**
 * JWT Token Management Utilities
 * Provides secure token storage, validation, and automatic refresh capabilities
 */

// Constants
const TOKEN_STORAGE_KEYS = {
  ACCESS_TOKEN: 'authToken',
  REFRESH_TOKEN: 'refreshToken',
  ID_TOKEN: 'idToken',
  REMEMBER_ME: 'rememberMe'
};

const TOKEN_REFRESH_THRESHOLD = 5 * 60 * 1000; // 5 minutes in milliseconds
const ENCRYPTION_ALGORITHM = 'AES-GCM';
const KEY_LENGTH = 256;

/**
 * Decodes a JWT token without verification
 * @param {string} token - JWT token to decode
 * @returns {object|null} - Decoded token payload or null if invalid
 */
export function decodeToken(token) {
  if (!token || typeof token !== 'string') {
    return null;
  }

  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      return null;
    }

    // Decode the payload (second part)
    const payload = parts[1];
    const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(decoded);
  } catch (error) {
    console.error('Token decode error:', error);
    return null;
  }
}

/**
 * Checks if a JWT token is valid and not expired
 * @param {string} token - JWT token to validate
 * @returns {boolean} - True if token is valid and not expired
 */
export function isTokenValid(token) {
  if (!token) {
    return false;
  }

  const decoded = decodeToken(token);
  if (!decoded || !decoded.exp) {
    return false;
  }

  // Check if token is expired (exp is in seconds, Date.now() is in milliseconds)
  const expirationTime = decoded.exp * 1000;
  return Date.now() < expirationTime;
}

/**
 * Gets the expiration date of a JWT token
 * @param {string} token - JWT token
 * @returns {Date|null} - Expiration date or null if invalid
 */
export function getTokenExpiration(token) {
  const decoded = decodeToken(token);
  if (!decoded || !decoded.exp) {
    return null;
  }

  return new Date(decoded.exp * 1000);
}

/**
 * Determines if a token should be refreshed based on expiration threshold
 * @param {string} token - JWT token to check
 * @param {number} threshold - Time threshold in milliseconds (default: 5 minutes)
 * @returns {boolean} - True if token should be refreshed
 */
export function shouldRefreshToken(token, threshold = TOKEN_REFRESH_THRESHOLD) {
  if (!isTokenValid(token)) {
    return true; // Invalid or expired tokens should be refreshed
  }

  const expiration = getTokenExpiration(token);
  if (!expiration) {
    return true;
  }

  const timeUntilExpiration = expiration.getTime() - Date.now();
  return timeUntilExpiration <= threshold;
}

/**
 * Generates a cryptographic key for encryption/decryption
 * @returns {Promise<CryptoKey>} - Generated key
 */
async function generateKey() {
  return await crypto.subtle.generateKey(
    {
      name: ENCRYPTION_ALGORITHM,
      length: KEY_LENGTH
    },
    false, // Not extractable
    ['encrypt', 'decrypt']
  );
}

/**
 * Derives a key from a password for encryption/decryption
 * @param {string} password - Password to derive key from
 * @returns {Promise<CryptoKey>} - Derived key
 */
async function deriveKey(password) {
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );

  // Use a fixed salt for consistency (in production, this should be unique per user)
  const salt = encoder.encode('traveller-rpg-salt');

  return await crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt,
      iterations: 100000,
      hash: 'SHA-256'
    },
    keyMaterial,
    {
      name: ENCRYPTION_ALGORITHM,
      length: KEY_LENGTH
    },
    false,
    ['encrypt', 'decrypt']
  );
}

/**
 * Encrypts a token for secure storage
 * @param {string} token - Token to encrypt
 * @returns {Promise<string|null>} - Encrypted token as base64 string or null if failed
 */
export async function encryptToken(token) {
  try {
    const encoder = new TextEncoder();
    const data = encoder.encode(token);
    
    // Use a fixed password for simplicity (in production, this should be more secure)
    const key = await deriveKey('traveller-rpg-encryption-key');
    
    // Generate a random IV
    const iv = crypto.getRandomValues(new Uint8Array(12));
    
    const encrypted = await crypto.subtle.encrypt(
      {
        name: ENCRYPTION_ALGORITHM,
        iv: iv
      },
      key,
      data
    );

    // Combine IV and encrypted data
    const combined = new Uint8Array(iv.length + encrypted.byteLength);
    combined.set(iv);
    combined.set(new Uint8Array(encrypted), iv.length);

    // Convert to base64 for storage
    return btoa(String.fromCharCode(...combined));
  } catch (error) {
    console.error('Token encryption error:', error);
    return null;
  }
}

/**
 * Decrypts a token from secure storage
 * @param {string} encryptedData - Encrypted token as base64 string
 * @returns {Promise<string|null>} - Decrypted token or null if failed
 */
export async function decryptToken(encryptedData) {
  try {
    if (!encryptedData) {
      return null;
    }

    // Convert from base64
    const combined = new Uint8Array(
      atob(encryptedData).split('').map(char => char.charCodeAt(0))
    );

    // Extract IV and encrypted data
    const iv = combined.slice(0, 12);
    const encrypted = combined.slice(12);

    const key = await deriveKey('traveller-rpg-encryption-key');

    const decrypted = await crypto.subtle.decrypt(
      {
        name: ENCRYPTION_ALGORITHM,
        iv: iv
      },
      key,
      encrypted
    );

    const decoder = new TextDecoder();
    return decoder.decode(decrypted);
  } catch (error) {
    console.error('Token decryption error:', error);
    return null;
  }
}

/**
 * Token Manager class for handling secure token storage and retrieval
 */
export class TokenManager {
  constructor() {
    this.listeners = new Set();
    this.sessionTimeoutWarningShown = false;
  }

  /**
   * Stores tokens securely
   * @param {object} tokens - Object containing accessToken, refreshToken, idToken
   * @param {boolean} rememberMe - Whether to store in localStorage or sessionStorage
   */
  async setTokens(tokens, rememberMe = false) {
    try {
      const storage = rememberMe ? localStorage : sessionStorage;
      
      if (tokens.accessToken) {
        const encryptedAccess = await encryptToken(tokens.accessToken);
        if (encryptedAccess) {
          storage.setItem(TOKEN_STORAGE_KEYS.ACCESS_TOKEN, encryptedAccess);
        }
      }

      if (tokens.refreshToken) {
        const encryptedRefresh = await encryptToken(tokens.refreshToken);
        if (encryptedRefresh) {
          storage.setItem(TOKEN_STORAGE_KEYS.REFRESH_TOKEN, encryptedRefresh);
        }
      }

      if (tokens.idToken) {
        const encryptedId = await encryptToken(tokens.idToken);
        if (encryptedId) {
          storage.setItem(TOKEN_STORAGE_KEYS.ID_TOKEN, encryptedId);
        }
      }

      if (rememberMe) {
        localStorage.setItem(TOKEN_STORAGE_KEYS.REMEMBER_ME, 'true');
      }

      // Notify listeners of token update
      this.notifyListeners('tokensUpdated', tokens);
    } catch (error) {
      console.error('Error setting tokens:', error);
      throw error;
    }
  }

  /**
   * Retrieves stored tokens
   * @returns {Promise<object|null>} - Object containing tokens or null if not found
   */
  async getTokens() {
    try {
      const rememberMe = localStorage.getItem(TOKEN_STORAGE_KEYS.REMEMBER_ME) === 'true';
      const storage = rememberMe ? localStorage : sessionStorage;

      const encryptedAccess = storage.getItem(TOKEN_STORAGE_KEYS.ACCESS_TOKEN);
      const encryptedRefresh = storage.getItem(TOKEN_STORAGE_KEYS.REFRESH_TOKEN);
      const encryptedId = storage.getItem(TOKEN_STORAGE_KEYS.ID_TOKEN);

      if (!encryptedAccess) {
        return null;
      }

      const tokens = {};

      if (encryptedAccess) {
        tokens.accessToken = await decryptToken(encryptedAccess);
      }

      if (encryptedRefresh) {
        tokens.refreshToken = await decryptToken(encryptedRefresh);
      }

      if (encryptedId) {
        tokens.idToken = await decryptToken(encryptedId);
      }

      return tokens.accessToken ? tokens : null;
    } catch (error) {
      console.error('Error getting tokens:', error);
      return null;
    }
  }

  /**
   * Clears all stored tokens
   */
  clearTokens() {
    // Clear from both storages to be safe
    const keys = Object.values(TOKEN_STORAGE_KEYS);
    
    keys.forEach(key => {
      localStorage.removeItem(key);
      sessionStorage.removeItem(key);
    });

    this.sessionTimeoutWarningShown = false;
    this.notifyListeners('tokensCleared');
  }

  /**
   * Checks if user is authenticated with valid token
   * @returns {Promise<boolean>} - True if authenticated
   */
  async isAuthenticated() {
    try {
      const tokens = await this.getTokens();
      return tokens && isTokenValid(tokens.accessToken);
    } catch (error) {
      console.error('Error checking authentication:', error);
      return false;
    }
  }

  /**
   * Checks if access token should be refreshed
   * @returns {Promise<boolean>} - True if token should be refreshed
   */
  async shouldRefresh() {
    try {
      const tokens = await this.getTokens();
      return tokens && shouldRefreshToken(tokens.accessToken);
    } catch (error) {
      console.error('Error checking refresh status:', error);
      return false;
    }
  }

  /**
   * Gets time until token expiration in milliseconds
   * @returns {Promise<number|null>} - Time until expiration or null if no valid token
   */
  async getTimeUntilExpiration() {
    try {
      const tokens = await this.getTokens();
      if (!tokens || !tokens.accessToken) {
        return null;
      }

      const expiration = getTokenExpiration(tokens.accessToken);
      if (!expiration) {
        return null;
      }

      return Math.max(0, expiration.getTime() - Date.now());
    } catch (error) {
      console.error('Error getting time until expiration:', error);
      return null;
    }
  }

  /**
   * Checks if session timeout warning should be shown
   * @returns {Promise<boolean>} - True if warning should be shown
   */
  async shouldShowSessionTimeoutWarning() {
    if (this.sessionTimeoutWarningShown) {
      return false;
    }

    const timeUntilExpiration = await this.getTimeUntilExpiration();
    if (timeUntilExpiration === null) {
      return false;
    }

    // Show warning 5 minutes before expiration
    const warningThreshold = 5 * 60 * 1000; // 5 minutes
    return timeUntilExpiration <= warningThreshold && timeUntilExpiration > 0;
  }

  /**
   * Marks session timeout warning as shown
   */
  markSessionTimeoutWarningShown() {
    this.sessionTimeoutWarningShown = true;
  }

  /**
   * Adds a listener for token events
   * @param {function} listener - Function to call on token events
   */
  addListener(listener) {
    this.listeners.add(listener);
  }

  /**
   * Removes a listener for token events
   * @param {function} listener - Function to remove
   */
  removeListener(listener) {
    this.listeners.delete(listener);
  }

  /**
   * Notifies all listeners of an event
   * @param {string} event - Event type
   * @param {any} data - Event data
   */
  notifyListeners(event, data) {
    this.listeners.forEach(listener => {
      try {
        listener(event, data);
      } catch (error) {
        console.error('Error in token listener:', error);
      }
    });
  }
}

// Export a singleton instance
export const tokenManager = new TokenManager();