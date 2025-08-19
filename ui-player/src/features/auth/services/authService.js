/**
 * Authentication Service - Updated to use AWS Cognito SDK directly
 * Replaces AWS Amplify with amazon-cognito-identity-js
 */

import { cognitoAuth } from './cognitoAuth.js';

/**
 * Authentication Service Interface
 * Provides a consistent interface that matches the previous Amplify-based service
 */
class AuthService {
  constructor() {
    this.cognitoAuth = cognitoAuth;
  }

  /**
   * Configure authentication (no-op for direct Cognito SDK)
   * @param {Object} config - Configuration object
   */
  configure(config = {}) {
    // Configuration is handled in cognitoAuth service via environment variables
    console.log('Auth service configured with:', { 
      hasUserPoolId: !!config.userPoolId,
      hasClientId: !!config.userPoolClientId 
    });
    return Promise.resolve();
  }

  /**
   * Sign in a user
   * @param {string} username - Username or email
   * @param {string} password - Password
   * @param {boolean} rememberMe - Whether to persist session
   * @returns {Promise<Object>} - Authentication result
   */
  async signIn(username, password, rememberMe = false) {
    try {
      const result = await this.cognitoAuth.signIn(username, password, rememberMe);
      
      if (result.success) {
        return {
          isSignedIn: true,
          nextStep: { signInStep: 'DONE' },
          user: {
            username: result.user.getUsername(),
            signInDetails: {
              loginId: username
            }
          }
        };
      }
      
      // Handle challenges (MFA, new password required, etc.)
      if (result.challenge) {
        return {
          isSignedIn: false,
          nextStep: { 
            signInStep: result.challenge === 'MFA_REQUIRED' ? 'CONFIRM_SIGN_IN_WITH_TOTP_CODE' : 'CONFIRM_SIGN_IN_WITH_NEW_PASSWORD_REQUIRED',
            challengeType: result.challenge
          },
          user: result.user
        };
      }
      
      throw new Error('Sign in failed');
    } catch (error) {
      console.error('AuthService signIn error:', error);
      throw new Error(error.message || 'Sign in failed');
    }
  }

  /**
   * Sign up a new user
   * @param {string} username - Username
   * @param {string} password - Password
   * @param {string} email - Email address
   * @param {Object} attributes - Additional user attributes
   * @returns {Promise<Object>} - Sign up result
   */
  async signUp(username, password, email, attributes = {}) {
    try {
      const result = await this.cognitoAuth.signUp(username, password, email, attributes);
      
      return {
        isSignUpComplete: result.userConfirmed,
        userId: result.userSub,
        nextStep: {
          signUpStep: result.userConfirmed ? 'DONE' : 'CONFIRM_SIGN_UP'
        }
      };
    } catch (error) {
      console.error('AuthService signUp error:', error);
      throw new Error(error.message || 'Sign up failed');
    }
  }

  /**
   * Confirm sign up with verification code
   * @param {string} username - Username
   * @param {string} confirmationCode - Verification code
   * @returns {Promise<Object>} - Confirmation result
   */
  async confirmSignUp(username, confirmationCode) {
    try {
      await this.cognitoAuth.confirmSignUp(username, confirmationCode);
      
      return {
        isSignUpComplete: true,
        nextStep: { signUpStep: 'DONE' }
      };
    } catch (error) {
      console.error('AuthService confirmSignUp error:', error);
      throw new Error(error.message || 'Confirmation failed');
    }
  }

  /**
   * Sign out the current user
   * @returns {Promise<void>}
   */
  async signOut() {
    try {
      await this.cognitoAuth.signOut();
      
      return {
        isSignedOut: true,
        nextStep: { signOutStep: 'DONE' }
      };
    } catch (error) {
      console.error('AuthService signOut error:', error);
      throw new Error(error.message || 'Sign out failed');
    }
  }

  /**
   * Get current authenticated user
   * @returns {Promise<Object|null>} - Current user or null
   */
  async getCurrentUser() {
    try {
      const user = await this.cognitoAuth.getCurrentUser();
      
      if (!user) {
        return null;
      }
      
      return {
        username: user.username,
        userId: user.attributes?.sub,
        signInDetails: {
          loginId: user.attributes?.email || user.username
        },
        attributes: user.attributes
      };
    } catch (error) {
      console.error('AuthService getCurrentUser error:', error);
      return null;
    }
  }

  /**
   * Get current authentication session
   * @returns {Promise<Object|null>} - Session with tokens or null
   */
  async fetchAuthSession() {
    try {
      const isAuthenticated = this.cognitoAuth.isAuthenticated();
      
      if (!isAuthenticated) {
        return {
          tokens: {}
        };
      }
      
      const accessToken = this.cognitoAuth.getAccessToken();
      
      return {
        tokens: {
          accessToken: accessToken ? { toString: () => accessToken } : undefined,
          idToken: { toString: () => accessToken }, // Simplified for compatibility
        },
        credentials: {} // AWS credentials not needed for this implementation
      };
    } catch (error) {
      console.error('AuthService fetchAuthSession error:', error);
      return { tokens: {} };
    }
  }

  /**
   * Update user attributes
   * @param {Object} attributes - Attributes to update
   * @returns {Promise<Object>} - Update result
   */
  async updateUserAttributes(attributes) {
    try {
      // This would need to be implemented using the Cognito SDK
      console.warn('updateUserAttributes not yet implemented with direct Cognito SDK');
      
      return {
        isUpdated: false,
        nextStep: { updateAttributeStep: 'DONE' }
      };
    } catch (error) {
      console.error('AuthService updateUserAttributes error:', error);
      throw new Error(error.message || 'Update attributes failed');
    }
  }

  /**
   * Update user password
   * @param {string} oldPassword - Current password
   * @param {string} newPassword - New password
   * @returns {Promise<Object>} - Update result
   */
  async updatePassword(oldPassword, newPassword) {
    try {
      // This would need to be implemented using the Cognito SDK
      console.warn('updatePassword not yet implemented with direct Cognito SDK');
      
      return {
        isUpdated: false,
        nextStep: { updatePasswordStep: 'DONE' }
      };
    } catch (error) {
      console.error('AuthService updatePassword error:', error);
      throw new Error(error.message || 'Password update failed');
    }
  }

  /**
   * Reset password (forgot password)
   * @param {string} username - Username
   * @returns {Promise<Object>} - Reset result
   */
  async resetPassword(username) {
    try {
      await this.cognitoAuth.forgotPassword(username);
      
      return {
        isPasswordReset: false,
        nextStep: { resetPasswordStep: 'CONFIRM_RESET_PASSWORD_WITH_CODE' }
      };
    } catch (error) {
      console.error('AuthService resetPassword error:', error);
      throw new Error(error.message || 'Password reset failed');
    }
  }

  /**
   * Confirm password reset with code
   * @param {string} username - Username
   * @param {string} newPassword - New password
   * @param {string} confirmationCode - Reset code
   * @returns {Promise<Object>} - Confirmation result
   */
  async confirmResetPassword(username, newPassword, confirmationCode) {
    try {
      await this.cognitoAuth.confirmForgotPassword(username, confirmationCode, newPassword);
      
      return {
        isPasswordReset: true,
        nextStep: { resetPasswordStep: 'DONE' }
      };
    } catch (error) {
      console.error('AuthService confirmResetPassword error:', error);
      throw new Error(error.message || 'Password reset confirmation failed');
    }
  }

  /**
   * Check if user is authenticated
   * @returns {boolean} - Authentication status
   */
  isAuthenticated() {
    return this.cognitoAuth.isAuthenticated();
  }

  /**
   * Get access token
   * @returns {string|null} - Access token or null
   */
  getAccessToken() {
    return this.cognitoAuth.getAccessToken();
  }
}

// Export singleton instance
const authService = new AuthService();
export default authService;

// Named exports for convenience
export { authService };
export { cognitoAuth };