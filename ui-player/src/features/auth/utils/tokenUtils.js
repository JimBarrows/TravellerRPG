/**
 * JWT Token Management Utilities - Simplified Version
 * Provides basic token validation without complex encryption
 */

// Constants
const TOKEN_STORAGE_KEYS = {
  ACCESS_TOKEN: 'accessToken',
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
  if (!decoded) {
    return false;
  }

  // Check if token is expired
  const currentTime = Math.floor(Date.now() / 1000);
  return decoded.exp && decoded.exp > currentTime;
}

/**
 * Gets the expiration time of a JWT token
 * @param {string} token - JWT token
 * @returns {number|null} - Expiration timestamp or null if invalid
 */
export function getTokenExpiration(token) {
  const decoded = decodeToken(token);
  return decoded?.exp ? decoded.exp * 1000 : null; // Convert to milliseconds
}

/**
 * Checks if a token needs refresh (within threshold of expiration)
 * @param {string} token - JWT token to check
 * @returns {boolean} - True if token needs refresh
 */
export function shouldRefreshToken(token) {
  if (!token) {
    return false;
  }

  const expiration = getTokenExpiration(token);
  if (!expiration) {
    return false;
  }

  return (expiration - Date.now()) < TOKEN_REFRESH_THRESHOLD;
}

/**
 * Simple Token Manager (without encryption for now)
 * Manages token storage and retrieval
 */
export class TokenManager {
  constructor() {
    this.refreshPromise = null;
  }

  /**
   * Sets authentication tokens in storage
   * @param {Object} tokens - Token object containing access, refresh, and ID tokens
   * @param {boolean} rememberMe - Whether to persist tokens in localStorage
   */
  setTokens(tokens, rememberMe = false) {
    const storage = rememberMe ? localStorage : sessionStorage;
    
    if (tokens.accessToken) {
      storage.setItem(TOKEN_STORAGE_KEYS.ACCESS_TOKEN, tokens.accessToken);
    }
    if (tokens.refreshToken) {
      storage.setItem(TOKEN_STORAGE_KEYS.REFRESH_TOKEN, tokens.refreshToken);
    }
    if (tokens.idToken) {
      storage.setItem(TOKEN_STORAGE_KEYS.ID_TOKEN, tokens.idToken);
    }
    
    storage.setItem(TOKEN_STORAGE_KEYS.REMEMBER_ME, rememberMe.toString());
  }

  /**
   * Gets authentication tokens from storage
   * @returns {Object} - Token object with access, refresh, ID tokens and rememberMe flag
   */
  getTokens() {
    // Check localStorage first for rememberMe setting
    const rememberMe = localStorage.getItem(TOKEN_STORAGE_KEYS.REMEMBER_ME) === 'true';
    const storage = rememberMe ? localStorage : sessionStorage;
    
    return {
      accessToken: storage.getItem(TOKEN_STORAGE_KEYS.ACCESS_TOKEN),
      refreshToken: storage.getItem(TOKEN_STORAGE_KEYS.REFRESH_TOKEN),
      idToken: storage.getItem(TOKEN_STORAGE_KEYS.ID_TOKEN),
      rememberMe,
    };
  }

  /**
   * Gets a valid access token, refreshing if necessary
   * @returns {Promise<string|null>} - Valid access token or null
   */
  async getValidAccessToken() {
    const tokens = this.getTokens();
    
    if (!tokens.accessToken) {
      return null;
    }

    // If token is valid and doesn't need refresh, return it
    if (isTokenValid(tokens.accessToken) && !shouldRefreshToken(tokens.accessToken)) {
      return tokens.accessToken;
    }

    // If token needs refresh and we have a refresh token, try to refresh
    if (tokens.refreshToken) {
      try {
        return await this.refreshAccessToken();
      } catch (error) {
        console.error('Token refresh failed:', error);
        this.clearTokens();
        return null;
      }
    }

    // Token is invalid and can't be refreshed
    this.clearTokens();
    return null;
  }

  /**
   * Refreshes the access token using the refresh token
   * @returns {Promise<string>} - New access token
   */
  async refreshAccessToken() {
    // Prevent multiple simultaneous refresh attempts
    if (this.refreshPromise) {
      return this.refreshPromise;
    }

    this.refreshPromise = this._performRefresh();
    
    try {
      const result = await this.refreshPromise;
      this.refreshPromise = null;
      return result;
    } catch (error) {
      this.refreshPromise = null;
      throw error;
    }
  }

  /**
   * Internal method to perform token refresh
   * @private
   * @returns {Promise<string>} - New access token
   */
  async _performRefresh() {
    // This would integrate with AWS Cognito refresh logic
    // For now, throw an error to indicate refresh is not implemented
    throw new Error('Token refresh not implemented - integrate with Cognito service');
  }

  /**
   * Clears all stored tokens
   */
  clearTokens() {
    // Clear from both storage types to be safe
    Object.values(TOKEN_STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
      sessionStorage.removeItem(key);
    });
  }

  /**
   * Checks if user is currently authenticated
   * @returns {boolean} - True if authenticated with valid token
   */
  isAuthenticated() {
    const tokens = this.getTokens();
    return isTokenValid(tokens.accessToken);
  }

  /**
   * Gets the current user information from the ID token
   * @returns {Object|null} - User information or null if not available
   */
  getCurrentUserInfo() {
    const tokens = this.getTokens();
    if (!tokens.idToken || !isTokenValid(tokens.idToken)) {
      return null;
    }

    const decoded = decodeToken(tokens.idToken);
    if (!decoded) {
      return null;
    }

    return {
      sub: decoded.sub,
      email: decoded.email,
      emailVerified: decoded.email_verified,
      username: decoded['cognito:username'] || decoded.preferred_username,
      givenName: decoded.given_name,
      familyName: decoded.family_name,
      // Add other Cognito standard attributes as needed
    };
  }

  /**
   * Gets time until token expiration in milliseconds
   * @returns {Promise<number>} - Time until expiration in milliseconds
   */
  async getTimeUntilExpiration() {
    const tokens = this.getTokens();
    if (!tokens.accessToken) {
      return 0;
    }
    
    try {
      const decoded = decodeToken(tokens.accessToken);
      if (!decoded || !decoded.exp) {
        return 0;
      }
      
      const now = Date.now() / 1000;
      const timeRemaining = (decoded.exp - now) * 1000;
      return Math.max(0, timeRemaining);
    } catch (error) {
      console.error('Error getting token expiration:', error);
      return 0;
    }
  }

  /**
   * Checks if session timeout warning should be shown
   * @returns {Promise<boolean>} - True if warning should be shown
   */
  async shouldShowSessionTimeoutWarning() {
    const timeRemaining = await this.getTimeUntilExpiration();
    const fiveMinutes = 5 * 60 * 1000; // 5 minutes in milliseconds
    
    // Show warning if less than 5 minutes remaining
    if (timeRemaining > 0 && timeRemaining < fiveMinutes) {
      // Check if we've already shown the warning for this session
      const warningShown = sessionStorage.getItem('sessionTimeoutWarningShown');
      return !warningShown;
    }
    
    return false;
  }

  /**
   * Marks that the session timeout warning has been shown
   */
  markSessionTimeoutWarningShown() {
    sessionStorage.setItem('sessionTimeoutWarningShown', 'true');
  }
}

// Export singleton instance
export const tokenManager = new TokenManager();

// Export utility functions
export {
  TOKEN_STORAGE_KEYS,
  TOKEN_REFRESH_THRESHOLD,
};