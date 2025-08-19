// Mock AuthService for testing (matches new authService interface)
export const mockCognitoService = () => {
  const users = new Map();
  const verificationCodes = new Map();
  const loginAttempts = new Map();
  let currentUser = null;
  let isAuth = false;

  return {
    isAvailable: () => true,

    // AuthService interface methods
    configure: async (config = {}) => {
      console.log('Mock auth service configured with:', { 
        hasUserPoolId: !!config.userPoolId,
        hasClientId: !!config.userPoolClientId 
      });
      return Promise.resolve();
    },

    signIn: async (username, password, rememberMe = false) => {
      const user = users.get(username);
      
      // Log login attempt
      if (!loginAttempts.has(username)) {
        loginAttempts.set(username, []);
      }
      const attempts = loginAttempts.get(username);
      
      if (!user || user.password !== password) {
        attempts.push({ 
          timestamp: new Date().toISOString(), 
          success: false 
        });
        throw new Error('Invalid email or password');
      }
      
      if (user.status !== 'verified') {
        throw new Error('Please verify your email before logging in');
      }
      
      attempts.push({ 
        timestamp: new Date().toISOString(), 
        success: true 
      });
      
      currentUser = user;
      isAuth = true;
      
      return {
        isSignedIn: true,
        nextStep: { signInStep: 'DONE' },
        user: {
          username: user.email,
          signInDetails: {
            loginId: username
          }
        }
      };
    },

    signUp: async (username, password, email, attributes = {}) => {
      if (users.has(email)) {
        throw new Error('User already exists');
      }
      
      const user = {
        id: `user-${Date.now()}`,
        email,
        password,
        displayName: attributes.name || email,
        status: 'unverified',
        createdAt: new Date().toISOString(),
        ...attributes
      };
      users.set(email, user);
      
      return {
        isSignUpComplete: false,
        userId: user.id,
        nextStep: {
          signUpStep: 'CONFIRM_SIGN_UP'
        }
      };
    },

    confirmSignUp: async (username, confirmationCode) => {
      const storedCode = verificationCodes.get(username);
      if (storedCode !== confirmationCode) {
        throw new Error('Invalid verification code');
      }
      
      const user = users.get(username);
      if (!user) {
        throw new Error('User not found');
      }
      
      user.status = 'verified';
      
      return {
        isSignUpComplete: true,
        nextStep: { signUpStep: 'DONE' }
      };
    },

    signOut: async () => {
      currentUser = null;
      isAuth = false;
      
      return {
        isSignedOut: true,
        nextStep: { signOutStep: 'DONE' }
      };
    },

    getCurrentUser: async () => {
      if (!currentUser) {
        return null;
      }
      
      return {
        username: currentUser.email,
        userId: currentUser.id,
        signInDetails: {
          loginId: currentUser.email
        },
        attributes: {
          sub: currentUser.id,
          email: currentUser.email,
          name: currentUser.displayName
        }
      };
    },

    fetchAuthSession: async () => {
      if (!isAuth) {
        return { tokens: {} };
      }
      
      const accessToken = 'mock-access-token';
      
      return {
        tokens: {
          accessToken: { toString: () => accessToken },
          idToken: { toString: () => accessToken }
        },
        credentials: {}
      };
    },

    updateUserAttributes: async (attributes) => {
      console.warn('updateUserAttributes not yet implemented with direct Cognito SDK');
      
      return {
        isUpdated: false,
        nextStep: { updateAttributeStep: 'DONE' }
      };
    },

    updatePassword: async (oldPassword, newPassword) => {
      console.warn('updatePassword not yet implemented with direct Cognito SDK');
      
      return {
        isUpdated: false,
        nextStep: { updatePasswordStep: 'DONE' }
      };
    },

    resetPassword: async (username) => {
      return {
        isPasswordReset: false,
        nextStep: { resetPasswordStep: 'CONFIRM_RESET_PASSWORD_WITH_CODE' }
      };
    },

    confirmResetPassword: async (username, newPassword, confirmationCode) => {
      return {
        isPasswordReset: true,
        nextStep: { resetPasswordStep: 'DONE' }
      };
    },

    isAuthenticated: () => isAuth,

    getAccessToken: () => {
      return isAuth ? 'mock-access-token' : null;
    },

    // Legacy methods for backward compatibility
    createUser: async (userData) => {
      if (users.has(userData.email)) {
        throw new Error('User already exists');
      }
      const user = {
        id: `user-${Date.now()}`,
        ...userData,
        createdAt: new Date().toISOString()
      };
      users.set(userData.email, user);
      return user;
    },

    getUser: async (email) => {
      const user = users.get(email);
      if (!user) {
        throw new Error('User not found');
      }
      return user;
    },

    getUsersByEmail: async (email) => {
      return Array.from(users.values()).filter(u => u.email === email);
    },

    setVerificationCode: (email, code) => {
      verificationCodes.set(email, code);
    },

    getLoginAttempts: (email) => {
      return loginAttempts.get(email) || [];
    },

    authenticateWithGoogle: async (googleProfile) => {
      const user = {
        id: `user-${Date.now()}`,
        email: googleProfile.email,
        displayName: googleProfile.name,
        avatar: googleProfile.picture,
        provider: 'google',
        status: 'verified',
        createdAt: new Date().toISOString()
      };
      users.set(googleProfile.email, user);
      currentUser = user;
      isAuth = true;
      return user;
    },

    authenticateWithApple: async (appleProfile) => {
      const user = {
        id: `user-${Date.now()}`,
        email: appleProfile.email,
        displayName: appleProfile.name || 'Apple User',
        provider: 'apple',
        status: 'verified',
        createdAt: new Date().toISOString()
      };
      users.set(appleProfile.email, user);
      currentUser = user;
      isAuth = true;
      return user;
    }
  };
};