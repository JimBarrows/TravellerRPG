/**
 * Simplified JWT Token Management Utilities for Testing
 * Uses base64 encoding instead of encryption for easier testing
 */

// Constants
const TOKEN_STORAGE_KEYS = {
  ACCESS_TOKEN: 'authToken',
  REFRESH_TOKEN: 'refreshToken',
  ID_TOKEN: 'idToken',
  REMEMBER_ME: 'rememberMe'
};

const TOKEN_REFRESH_THRESHOLD = 5 * 60 * 1000; // 5 minutes in milliseconds

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
 * Simple base64 encoding for testing (not secure for production)
 * @param {string} token - Token to encode
 * @returns {string} - Base64 encoded token
 */
export function encodeToken(token) {
  try {
    return btoa(token);
  } catch (error) {
    console.error('Token encoding error:', error);
    return null;
  }
}

/**
 * Simple base64 decoding for testing
 * @param {string} encodedToken - Base64 encoded token
 * @returns {string} - Decoded token
 */
export function decodeStoredToken(encodedToken) {
  try {
    if (!encodedToken) {
      return null;
    }
    return atob(encodedToken);
  } catch (error) {
    console.error('Token decoding error:', error);
    return null;
  }
}

/**
 * Simple Token Manager class for testing
 */
export class SimpleTokenManager {
  constructor() {
    this.listeners = new Set();
    this.sessionTimeoutWarningShown = false;
  }

  /**
   * Stores tokens with simple base64 encoding
   * @param {object} tokens - Object containing accessToken, refreshToken, idToken
   * @param {boolean} rememberMe - Whether to store in localStorage or sessionStorage
   */
  async setTokens(tokens, rememberMe = false) {
    try {
      const storage = rememberMe ? localStorage : sessionStorage;
      
      if (tokens.accessToken) {
        const encoded = encodeToken(tokens.accessToken);
        if (encoded) {
          storage.setItem(TOKEN_STORAGE_KEYS.ACCESS_TOKEN, encoded);
        }
      }

      if (tokens.refreshToken) {
        const encoded = encodeToken(tokens.refreshToken);
        if (encoded) {
          storage.setItem(TOKEN_STORAGE_KEYS.REFRESH_TOKEN, encoded);
        }
      }

      if (tokens.idToken) {
        const encoded = encodeToken(tokens.idToken);
        if (encoded) {
          storage.setItem(TOKEN_STORAGE_KEYS.ID_TOKEN, encoded);
        }
      }

      if (rememberMe) {
        localStorage.setItem(TOKEN_STORAGE_KEYS.REMEMBER_ME, 'true');
      }

      this.notifyListeners('tokensUpdated', tokens);
    } catch (error) {
      console.error('Error setting tokens:', error);
      throw error;
    }
  }

  /**
   * Retrieves stored tokens
   * @returns {object|null} - Object containing tokens or null if not found
   */
  async getTokens() {
    try {
      const rememberMe = localStorage.getItem(TOKEN_STORAGE_KEYS.REMEMBER_ME) === 'true';
      const storage = rememberMe ? localStorage : sessionStorage;

      const encodedAccess = storage.getItem(TOKEN_STORAGE_KEYS.ACCESS_TOKEN);
      const encodedRefresh = storage.getItem(TOKEN_STORAGE_KEYS.REFRESH_TOKEN);
      const encodedId = storage.getItem(TOKEN_STORAGE_KEYS.ID_TOKEN);

      if (!encodedAccess) {
        return null;
      }

      const tokens = {};

      if (encodedAccess) {
        tokens.accessToken = decodeStoredToken(encodedAccess);
      }

      if (encodedRefresh) {
        tokens.refreshToken = decodeStoredToken(encodedRefresh);
      }

      if (encodedId) {
        tokens.idToken = decodeStoredToken(encodedId);
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
   * @returns {boolean} - True if authenticated
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
   * @returns {boolean} - True if token should be refreshed
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
   * @returns {number|null} - Time until expiration or null if no valid token
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
   * @returns {boolean} - True if warning should be shown
   */
  async shouldShowSessionTimeoutWarning() {
    if (this.sessionTimeoutWarningShown) {
      return false;
    }

    const timeUntilExpiration = await this.getTimeUntilExpiration();
    if (timeUntilExpiration === null) {
      return false;
    }

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
export const simpleTokenManager = new SimpleTokenManager();