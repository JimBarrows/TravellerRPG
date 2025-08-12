import { Amplify } from '@aws-amplify/core';
import { 
  signIn as amplifySignIn, 
  signUp as amplifySignUp,
  signOut as amplifySignOut,
  confirmSignUp as amplifyConfirmSignUp,
  getCurrentUser as amplifyGetCurrentUser,
  fetchAuthSession,
  updateUserAttributes as amplifyUpdateUserAttributes,
  updatePassword,
  resetPassword,
  confirmResetPassword,
  setUpTOTP,
  verifyTOTPSetup,
  updateMFAPreference
} from '@aws-amplify/auth';

// Configure Amplify with your AWS Cognito settings
export const configureAuth = (config) => {
  Amplify.configure({
    Auth: {
      Cognito: {
        userPoolId: config.userPoolId || import.meta.env.VITE_USER_POOL_ID,
        userPoolClientId: config.userPoolClientId || import.meta.env.VITE_USER_POOL_CLIENT_ID,
        signUpVerificationMethod: 'code',
        loginWith: {
          oauth: {
            domain: config.oauthDomain || import.meta.env.VITE_OAUTH_DOMAIN,
            scopes: ['email', 'profile', 'openid'],
            redirectSignIn: config.redirectSignIn || window.location.origin,
            redirectSignOut: config.redirectSignOut || window.location.origin,
            responseType: 'code'
          }
        }
      }
    }
  });
};

class AuthService {
  async signIn({ username, password, rememberMe = false }) {
    try {
      const { isSignedIn, nextStep } = await amplifySignIn({ username, password });
      
      if (isSignedIn) {
        const session = await fetchAuthSession();
        const tokens = {
          accessToken: session.tokens?.accessToken?.toString(),
          refreshToken: session.tokens?.refreshToken?.toString(),
          idToken: session.tokens?.idToken?.toString()
        };
        
        if (rememberMe) {
          localStorage.setItem('authToken', tokens.accessToken);
          localStorage.setItem('refreshToken', tokens.refreshToken);
        } else {
          sessionStorage.setItem('authToken', tokens.accessToken);
          sessionStorage.setItem('refreshToken', tokens.refreshToken);
        }
        
        const user = await this.getCurrentUser();
        return { isSignedIn, tokens, user, nextStep };
      }
      
      return { isSignedIn, nextStep };
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    }
  }

  async signUp({ username, password, attributes }) {
    try {
      const { isSignUpComplete, userId, nextStep } = await amplifySignUp({
        username,
        password,
        options: {
          userAttributes: attributes
        }
      });
      
      return {
        isSignUpComplete,
        userSub: userId,
        nextStep,
        codeDeliveryDetails: nextStep?.codeDeliveryDetails
      };
    } catch (error) {
      console.error('Sign up error:', error);
      throw error;
    }
  }

  async confirmSignUp({ username, confirmationCode }) {
    try {
      const { isSignUpComplete, nextStep } = await amplifyConfirmSignUp({
        username,
        confirmationCode
      });
      
      return { isSignUpComplete, nextStep };
    } catch (error) {
      console.error('Confirm sign up error:', error);
      throw error;
    }
  }

  async signOut() {
    try {
      await amplifySignOut();
      localStorage.removeItem('authToken');
      localStorage.removeItem('refreshToken');
      sessionStorage.removeItem('authToken');
      sessionStorage.removeItem('refreshToken');
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  }

  async getCurrentUser() {
    try {
      const { username, userId, signInDetails } = await amplifyGetCurrentUser();
      const session = await fetchAuthSession();
      
      return {
        id: userId,
        username,
        email: signInDetails?.loginId,
        attributes: session.tokens?.idToken?.payload
      };
    } catch (error) {
      console.error('Get current user error:', error);
      return null;
    }
  }

  async refreshToken() {
    try {
      const session = await fetchAuthSession({ forceRefresh: true });
      const tokens = {
        accessToken: session.tokens?.accessToken?.toString(),
        refreshToken: session.tokens?.refreshToken?.toString(),
        idToken: session.tokens?.idToken?.toString()
      };
      
      const rememberMe = !!localStorage.getItem('authToken');
      if (rememberMe) {
        localStorage.setItem('authToken', tokens.accessToken);
        localStorage.setItem('refreshToken', tokens.refreshToken);
      } else {
        sessionStorage.setItem('authToken', tokens.accessToken);
        sessionStorage.setItem('refreshToken', tokens.refreshToken);
      }
      
      return tokens;
    } catch (error) {
      console.error('Refresh token error:', error);
      throw error;
    }
  }

  async updateUserAttributes(attributes) {
    try {
      const output = await amplifyUpdateUserAttributes({
        userAttributes: attributes
      });
      return output;
    } catch (error) {
      console.error('Update user attributes error:', error);
      throw error;
    }
  }

  async changePassword(oldPassword, newPassword) {
    try {
      await updatePassword({ oldPassword, newPassword });
      return true;
    } catch (error) {
      console.error('Change password error:', error);
      throw error;
    }
  }

  async sendPasswordResetEmail(username) {
    try {
      const output = await resetPassword({ username });
      return output;
    } catch (error) {
      console.error('Send password reset error:', error);
      throw error;
    }
  }

  async confirmPasswordReset({ username, confirmationCode, newPassword }) {
    try {
      await confirmResetPassword({ username, confirmationCode, newPassword });
      return true;
    } catch (error) {
      console.error('Confirm password reset error:', error);
      throw error;
    }
  }

  async enableMFA(method = 'TOTP') {
    try {
      const totpSetupDetails = await setUpTOTP();
      const qrCodeUrl = totpSetupDetails.getSetupUri('TravellerRPG');
      
      return {
        secretCode: totpSetupDetails.sharedSecret,
        qrCode: qrCodeUrl.toString(),
        backupCodes: [] // Cognito doesn't provide backup codes directly
      };
    } catch (error) {
      console.error('Enable MFA error:', error);
      throw error;
    }
  }

  async verifyMFA(code) {
    try {
      await verifyTOTPSetup({ code });
      await updateMFAPreference({ totp: 'PREFERRED' });
      return { isVerified: true };
    } catch (error) {
      console.error('Verify MFA error:', error);
      throw error;
    }
  }
}

export default new AuthService();