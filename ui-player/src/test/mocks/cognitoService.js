// Mock AWS Cognito service for testing
export const mockCognitoService = () => {
  const users = new Map();
  const verificationCodes = new Map();
  const loginAttempts = new Map();
  let currentUser = null;

  return {
    isAvailable: () => true,

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

    verifyEmail: async (email, code) => {
      const storedCode = verificationCodes.get(email);
      if (storedCode !== code) {
        throw new Error('Invalid verification code');
      }
      const user = users.get(email);
      user.status = 'verified';
      return user;
    },

    signIn: async (email, password) => {
      const user = users.get(email);
      
      // Log login attempt
      if (!loginAttempts.has(email)) {
        loginAttempts.set(email, []);
      }
      const attempts = loginAttempts.get(email);
      
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
      
      // Generate mock JWT token
      const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.' + 
        btoa(JSON.stringify({ email, exp: Date.now() / 1000 + 3600 })) + 
        '.signature';
      
      return { user, token };
    },

    signOut: async () => {
      currentUser = null;
      localStorage.removeItem('authToken');
      localStorage.removeItem('refreshToken');
    },

    getCurrentUser: () => currentUser,

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
      return user;
    },

    updatePassword: async (email, currentPassword, newPassword) => {
      const user = users.get(email);
      if (!user || user.password !== currentPassword) {
        throw new Error('Current password is incorrect');
      }
      user.password = newPassword;
      return true;
    },

    sendPasswordResetEmail: async (email) => {
      const user = users.get(email);
      if (!user) {
        // Don't reveal if user exists or not for security
        return true;
      }
      // In real implementation, this would send an email
      return true;
    },

    enableMFA: async (email, method) => {
      const user = users.get(email);
      user.mfaEnabled = true;
      user.mfaMethod = method;
      return {
        qrCode: 'data:image/png;base64,mockQRCode',
        backupCodes: ['12345678', '87654321', '11111111']
      };
    }
  };
};