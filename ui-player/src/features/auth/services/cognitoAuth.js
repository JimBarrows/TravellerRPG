/**
 * AWS Cognito Authentication Service
 * Replaces AWS Amplify with direct AWS SDK usage
 */

import {
  CognitoUserPool,
  CognitoUser,
  AuthenticationDetails,
  CognitoUserAttribute
} from 'amazon-cognito-identity-js';

// Configuration - these should be set from environment variables in production
const COGNITO_CONFIG = {
  userPoolId: process.env.VITE_COGNITO_USER_POOL_ID || 'us-east-1_XXXXXXXXX',
  clientId: process.env.VITE_COGNITO_CLIENT_ID || 'xxxxxxxxxxxxxxxxxxxxxxxxxx',
  region: process.env.VITE_AWS_REGION || 'us-east-1',
};

// Create Cognito User Pool instance
const userPool = new CognitoUserPool({
  UserPoolId: COGNITO_CONFIG.userPoolId,
  ClientId: COGNITO_CONFIG.clientId,
});

/**
 * Simple token storage without encryption for now
 * In production, consider using secure storage methods
 */
class TokenStorage {
  static setTokens(tokens, rememberMe = false) {
    const storage = rememberMe ? localStorage : sessionStorage;
    
    if (tokens.accessToken) {
      storage.setItem('accessToken', tokens.accessToken);
    }
    if (tokens.refreshToken) {
      storage.setItem('refreshToken', tokens.refreshToken);
    }
    if (tokens.idToken) {
      storage.setItem('idToken', tokens.idToken);
    }
    
    storage.setItem('rememberMe', rememberMe.toString());
  }

  static getTokens() {
    const rememberMe = localStorage.getItem('rememberMe') === 'true';
    const storage = rememberMe ? localStorage : sessionStorage;
    
    return {
      accessToken: storage.getItem('accessToken'),
      refreshToken: storage.getItem('refreshToken'),
      idToken: storage.getItem('idToken'),
      rememberMe,
    };
  }

  static clearTokens() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('idToken');
    localStorage.removeItem('rememberMe');
    
    sessionStorage.removeItem('accessToken');
    sessionStorage.removeItem('refreshToken');
    sessionStorage.removeItem('idToken');
    sessionStorage.removeItem('rememberMe');
  }

  static isTokenValid(token) {
    if (!token) return false;
    
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return false;
      
      const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
      const currentTime = Math.floor(Date.now() / 1000);
      
      return payload.exp > currentTime;
    } catch (error) {
      console.error('Token validation error:', error);
      return false;
    }
  }
}

/**
 * AWS Cognito Authentication Service
 */
export class CognitoAuthService {
  constructor() {
    this.userPool = userPool;
    this.currentUser = null;
  }

  /**
   * Sign up a new user
   * @param {string} username - Username or email
   * @param {string} password - Password
   * @param {string} email - Email address
   * @param {Object} additionalAttributes - Additional user attributes
   * @returns {Promise<Object>} - Sign up result
   */
  async signUp(username, password, email, additionalAttributes = {}) {
    return new Promise((resolve, reject) => {
      const attributeList = [
        new CognitoUserAttribute({
          Name: 'email',
          Value: email,
        }),
      ];

      // Add additional attributes
      Object.entries(additionalAttributes).forEach(([key, value]) => {
        attributeList.push(new CognitoUserAttribute({
          Name: key,
          Value: value,
        }));
      });

      this.userPool.signUp(username, password, attributeList, null, (err, result) => {
        if (err) {
          reject(new Error(err.message || 'Sign up failed'));
          return;
        }

        resolve({
          user: result.user,
          userConfirmed: result.userConfirmed,
          userSub: result.userSub,
        });
      });
    });
  }

  /**
   * Confirm user registration with verification code
   * @param {string} username - Username
   * @param {string} code - Verification code
   * @returns {Promise<Object>} - Confirmation result
   */
  async confirmSignUp(username, code) {
    return new Promise((resolve, reject) => {
      const cognitoUser = new CognitoUser({
        Username: username,
        Pool: this.userPool,
      });

      cognitoUser.confirmRegistration(code, true, (err, result) => {
        if (err) {
          reject(new Error(err.message || 'Confirmation failed'));
          return;
        }
        resolve(result);
      });
    });
  }

  /**
   * Sign in a user
   * @param {string} username - Username or email
   * @param {string} password - Password
   * @param {boolean} rememberMe - Whether to persist session
   * @returns {Promise<Object>} - Sign in result with tokens
   */
  async signIn(username, password, rememberMe = false) {
    return new Promise((resolve, reject) => {
      const authenticationDetails = new AuthenticationDetails({
        Username: username,
        Password: password,
      });

      const cognitoUser = new CognitoUser({
        Username: username,
        Pool: this.userPool,
      });

      cognitoUser.authenticateUser(authenticationDetails, {
        onSuccess: (result) => {
          this.currentUser = cognitoUser;
          
          const tokens = {
            accessToken: result.getAccessToken().getJwtToken(),
            refreshToken: result.getRefreshToken().getToken(),
            idToken: result.getIdToken().getJwtToken(),
          };

          TokenStorage.setTokens(tokens, rememberMe);

          resolve({
            success: true,
            user: cognitoUser,
            tokens,
          });
        },
        onFailure: (err) => {
          reject(new Error(err.message || 'Sign in failed'));
        },
        newPasswordRequired: (userAttributes, requiredAttributes) => {
          // Handle new password required challenge
          resolve({
            success: false,
            challenge: 'NEW_PASSWORD_REQUIRED',
            userAttributes,
            requiredAttributes,
            user: cognitoUser,
          });
        },
        mfaRequired: (challengeName, challengeParameters) => {
          // Handle MFA challenge
          resolve({
            success: false,
            challenge: 'MFA_REQUIRED',
            challengeName,
            challengeParameters,
            user: cognitoUser,
          });
        },
      });
    });
  }

  /**
   * Sign out the current user
   * @returns {Promise<void>}
   */
  async signOut() {
    return new Promise((resolve) => {
      if (this.currentUser) {
        this.currentUser.signOut();
        this.currentUser = null;
      }
      
      TokenStorage.clearTokens();
      resolve();
    });
  }

  /**
   * Get the current authenticated user
   * @returns {Promise<Object|null>} - Current user or null
   */
  async getCurrentUser() {
    return new Promise((resolve, reject) => {
      const cognitoUser = this.userPool.getCurrentUser();
      
      if (!cognitoUser) {
        resolve(null);
        return;
      }

      cognitoUser.getSession((err, session) => {
        if (err) {
          reject(new Error(err.message || 'Failed to get session'));
          return;
        }

        if (!session.isValid()) {
          resolve(null);
          return;
        }

        cognitoUser.getUserAttributes((err, attributes) => {
          if (err) {
            reject(new Error(err.message || 'Failed to get user attributes'));
            return;
          }

          const userAttributes = {};
          attributes.forEach(attr => {
            userAttributes[attr.getName()] = attr.getValue();
          });

          resolve({
            username: cognitoUser.getUsername(),
            attributes: userAttributes,
            session,
          });
        });
      });
    });
  }

  /**
   * Refresh the current session
   * @returns {Promise<Object>} - New tokens
   */
  async refreshSession() {
    return new Promise((resolve, reject) => {
      const cognitoUser = this.userPool.getCurrentUser();
      
      if (!cognitoUser) {
        reject(new Error('No current user'));
        return;
      }

      cognitoUser.getSession((err, session) => {
        if (err) {
          reject(new Error(err.message || 'Failed to get session'));
          return;
        }

        if (session.isValid()) {
          const tokens = {
            accessToken: session.getAccessToken().getJwtToken(),
            refreshToken: session.getRefreshToken().getToken(),
            idToken: session.getIdToken().getJwtToken(),
          };

          const currentTokens = TokenStorage.getTokens();
          TokenStorage.setTokens(tokens, currentTokens.rememberMe);

          resolve({ tokens });
        } else {
          reject(new Error('Session is not valid'));
        }
      });
    });
  }

  /**
   * Check if user is authenticated
   * @returns {boolean} - Authentication status
   */
  isAuthenticated() {
    const tokens = TokenStorage.getTokens();
    return TokenStorage.isTokenValid(tokens.accessToken);
  }

  /**
   * Get stored access token
   * @returns {string|null} - Access token or null
   */
  getAccessToken() {
    const tokens = TokenStorage.getTokens();
    return TokenStorage.isTokenValid(tokens.accessToken) ? tokens.accessToken : null;
  }

  /**
   * Forgot password - initiate reset
   * @param {string} username - Username or email
   * @returns {Promise<Object>} - Reset result
   */
  async forgotPassword(username) {
    return new Promise((resolve, reject) => {
      const cognitoUser = new CognitoUser({
        Username: username,
        Pool: this.userPool,
      });

      cognitoUser.forgotPassword({
        onSuccess: (result) => {
          resolve(result);
        },
        onFailure: (err) => {
          reject(new Error(err.message || 'Forgot password failed'));
        },
      });
    });
  }

  /**
   * Confirm forgot password with code
   * @param {string} username - Username
   * @param {string} code - Verification code
   * @param {string} newPassword - New password
   * @returns {Promise<Object>} - Confirmation result
   */
  async confirmForgotPassword(username, code, newPassword) {
    return new Promise((resolve, reject) => {
      const cognitoUser = new CognitoUser({
        Username: username,
        Pool: this.userPool,
      });

      cognitoUser.confirmPassword(code, newPassword, {
        onSuccess: (result) => {
          resolve(result);
        },
        onFailure: (err) => {
          reject(new Error(err.message || 'Password confirmation failed'));
        },
      });
    });
  }
}

// Export singleton instance
export const cognitoAuth = new CognitoAuthService();
export default cognitoAuth;