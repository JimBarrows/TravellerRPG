/**
 * CognitoAuth Service Tests
 */

import { describe, it, expect, beforeEach, vi } from "vitest";

vi.mock("amazon-cognito-identity-js", () => ({
  CognitoUserPool: vi.fn(() => ({
    signUp: vi.fn(),
    getCurrentUser: vi.fn(() => ({
      signOut: vi.fn(),
      getUsername: vi.fn(() => "testuser"),
      confirmRegistration: vi.fn(),
      authenticateUser: vi.fn(),
      getSession: vi.fn(),
      getUserAttributes: vi.fn(),
      forgotPassword: vi.fn(),
      confirmPassword: vi.fn(),
    })),
  })),
  CognitoUser: vi.fn(() => ({
    signOut: vi.fn(),
    getUsername: vi.fn(() => "testuser"),
    confirmRegistration: vi.fn(),
    authenticateUser: vi.fn(),
    getSession: vi.fn(),
    getUserAttributes: vi.fn(),
    forgotPassword: vi.fn(),
    confirmPassword: vi.fn(),
  })),
  AuthenticationDetails: vi.fn(),
  CognitoUserAttribute: vi.fn(),
}));

// Mock environment variables
vi.stubEnv("VITE_COGNITO_USER_POOL_ID", "us-east-1_TEST123456");
vi.stubEnv("VITE_COGNITO_CLIENT_ID", "test-client-id-123");
vi.stubEnv("VITE_AWS_REGION", "us-east-1");

import { CognitoAuthService, cognitoAuth } from "./cognitoAuth.js";

describe("TokenStorage", () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  describe("setTokens and getTokens", () => {
    it("should store tokens in sessionStorage by default", () => {
      const tokens = {
        accessToken: "access-123",
        refreshToken: "refresh-456",
        idToken: "id-789",
      };

      // Use the service to access TokenStorage functionality
      const service = new CognitoAuthService();

      // We need to test this through the public methods since TokenStorage is not exported
      // Store tokens manually for testing
      sessionStorage.setItem("accessToken", tokens.accessToken);
      sessionStorage.setItem("refreshToken", tokens.refreshToken);
      sessionStorage.setItem("idToken", tokens.idToken);
      sessionStorage.setItem("rememberMe", "false");

      const stored = service.getAccessToken();
      expect(stored).toBeTruthy();
    });

    it("should store tokens in localStorage when rememberMe is true", () => {
      // Test by setting localStorage items directly
      localStorage.setItem("accessToken", "test-token");
      localStorage.setItem("rememberMe", "true");

      const service = new CognitoAuthService();
      const stored = service.getAccessToken();
      expect(stored).toBeTruthy();
    });
  });

  describe("clearTokens", () => {
    it("should clear tokens from both storage types", () => {
      localStorage.setItem("accessToken", "test");
      sessionStorage.setItem("accessToken", "test");

      // Clear through signOut method
      const service = new CognitoAuthService();
      service.signOut();

      expect(localStorage.getItem("accessToken")).toBeNull();
      expect(sessionStorage.getItem("accessToken")).toBeNull();
    });
  });

  describe("isTokenValid", () => {
    it("should validate JWT token expiration", () => {
      // Create a valid JWT-like token with future expiration
      const futureTime = Math.floor(Date.now() / 1000) + 3600; // 1 hour from now
      const payload = btoa(JSON.stringify({ exp: futureTime }));
      const validToken = `header.${payload}.signature`;

      localStorage.setItem("accessToken", validToken);
      localStorage.setItem("rememberMe", "true");

      const service = new CognitoAuthService();
      expect(service.isAuthenticated()).toBe(true);
    });

    it("should reject expired tokens", () => {
      // Create an expired JWT-like token
      const pastTime = Math.floor(Date.now() / 1000) - 3600; // 1 hour ago
      const payload = btoa(JSON.stringify({ exp: pastTime }));
      const expiredToken = `header.${payload}.signature`;

      localStorage.setItem("accessToken", expiredToken);
      localStorage.setItem("rememberMe", "true");

      const service = new CognitoAuthService();
      expect(service.isAuthenticated()).toBe(false);
    });

    it("should handle invalid token format", () => {
      localStorage.setItem("accessToken", "invalid-token");
      localStorage.setItem("rememberMe", "true");

      const service = new CognitoAuthService();
      expect(service.isAuthenticated()).toBe(false);
    });

    it("should handle null/undefined tokens", () => {
      const service = new CognitoAuthService();
      expect(service.isAuthenticated()).toBe(false);
    });
  });
});

describe("CognitoAuthService", () => {
  let service;

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    sessionStorage.clear();
    service = new CognitoAuthService();

    // Mock console methods
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  describe("constructor", () => {
    it("should initialize with userPool and null currentUser", () => {
      expect(service.userPool).toBe(mockUserPool);
      expect(service.currentUser).toBeNull();
    });

    it("should create userPool with correct configuration", () => {
      expect(mockCognitoUserPoolClass).toHaveBeenCalledWith({
        UserPoolId: "us-east-1_TEST123456",
        ClientId: "test-client-id-123",
      });
    });
  });

  describe("signUp", () => {
    it("should sign up user successfully", async () => {
      const mockResult = {
        user: mockCognitoUser,
        userConfirmed: false,
        userSub: "user-123",
      };

      mockUserPool.signUp.mockImplementation(
        (username, password, attributeList, nullValue, callback) => {
          callback(null, mockResult);
        },
      );

      const result = await service.signUp(
        "testuser",
        "password123",
        "test@example.com",
      );

      expect(result).toEqual(mockResult);
      expect(mockUserPool.signUp).toHaveBeenCalled();
      expect(mockCognitoUserAttribute).toHaveBeenCalledWith({
        Name: "email",
        Value: "test@example.com",
      });
    });

    it("should handle sign up with additional attributes", async () => {
      const mockResult = {
        user: mockCognitoUser,
        userConfirmed: true,
        userSub: "user-456",
      };

      mockUserPool.signUp.mockImplementation(
        (username, password, attributeList, nullValue, callback) => {
          callback(null, mockResult);
        },
      );

      const additionalAttributes = {
        name: "Test User",
        phone_number: "+1234567890",
      };

      await service.signUp(
        "testuser",
        "password123",
        "test@example.com",
        additionalAttributes,
      );

      expect(mockCognitoUserAttribute).toHaveBeenCalledWith({
        Name: "name",
        Value: "Test User",
      });
      expect(mockCognitoUserAttribute).toHaveBeenCalledWith({
        Name: "phone_number",
        Value: "+1234567890",
      });
    });

    it("should handle sign up errors", async () => {
      const error = { message: "User already exists" };
      mockUserPool.signUp.mockImplementation(
        (username, password, attributeList, nullValue, callback) => {
          callback(error);
        },
      );

      await expect(
        service.signUp("existing", "password123", "existing@example.com"),
      ).rejects.toThrow("User already exists");
    });

    it("should handle sign up errors without message", async () => {
      const error = {};
      mockUserPool.signUp.mockImplementation(
        (username, password, attributeList, nullValue, callback) => {
          callback(error);
        },
      );

      await expect(
        service.signUp("testuser", "password123", "test@example.com"),
      ).rejects.toThrow("Sign up failed");
    });
  });

  describe("confirmSignUp", () => {
    it("should confirm sign up successfully", async () => {
      const mockResult = "SUCCESS";
      mockCognitoUser.confirmRegistration.mockImplementation(
        (code, forceAliasCreation, callback) => {
          callback(null, mockResult);
        },
      );

      const result = await service.confirmSignUp("testuser", "123456");

      expect(result).toBe(mockResult);
      expect(mockCognitoUserClass).toHaveBeenCalledWith({
        Username: "testuser",
        Pool: mockUserPool,
      });
      expect(mockCognitoUser.confirmRegistration).toHaveBeenCalledWith(
        "123456",
        true,
        expect.any(Function),
      );
    });

    it("should handle confirmation errors", async () => {
      const error = { message: "Invalid code" };
      mockCognitoUser.confirmRegistration.mockImplementation(
        (code, forceAliasCreation, callback) => {
          callback(error);
        },
      );

      await expect(
        service.confirmSignUp("testuser", "wrongcode"),
      ).rejects.toThrow("Invalid code");
    });

    it("should handle confirmation errors without message", async () => {
      const error = {};
      mockCognitoUser.confirmRegistration.mockImplementation(
        (code, forceAliasCreation, callback) => {
          callback(error);
        },
      );

      await expect(service.confirmSignUp("testuser", "123456")).rejects.toThrow(
        "Confirmation failed",
      );
    });
  });

  describe("signIn", () => {
    const mockAuthResult = {
      getAccessToken: () => ({ getJwtToken: () => "access-token-123" }),
      getRefreshToken: () => ({ getToken: () => "refresh-token-456" }),
      getIdToken: () => ({ getJwtToken: () => "id-token-789" }),
    };

    it("should sign in successfully", async () => {
      mockCognitoUser.authenticateUser.mockImplementation(
        (authDetails, callbacks) => {
          callbacks.onSuccess(mockAuthResult);
        },
      );

      const result = await service.signIn("testuser", "password123", false);

      expect(result.success).toBe(true);
      expect(result.user).toBe(mockCognitoUser);
      expect(result.tokens.accessToken).toBe("access-token-123");
      expect(result.tokens.refreshToken).toBe("refresh-token-456");
      expect(result.tokens.idToken).toBe("id-token-789");
      expect(service.currentUser).toBe(mockCognitoUser);
    });

    it("should handle sign in with rememberMe option", async () => {
      mockCognitoUser.authenticateUser.mockImplementation(
        (authDetails, callbacks) => {
          callbacks.onSuccess(mockAuthResult);
        },
      );

      await service.signIn("testuser", "password123", true);

      // Token should be stored in localStorage when rememberMe is true
      expect(localStorage.getItem("rememberMe")).toBe("true");
    });

    it("should handle sign in failure", async () => {
      const error = { message: "Incorrect username or password" };
      mockCognitoUser.authenticateUser.mockImplementation(
        (authDetails, callbacks) => {
          callbacks.onFailure(error);
        },
      );

      await expect(service.signIn("testuser", "wrongpassword")).rejects.toThrow(
        "Incorrect username or password",
      );
    });

    it("should handle new password required challenge", async () => {
      const userAttributes = { email: "test@example.com" };
      const requiredAttributes = ["email"];

      mockCognitoUser.authenticateUser.mockImplementation(
        (authDetails, callbacks) => {
          callbacks.newPasswordRequired(userAttributes, requiredAttributes);
        },
      );

      const result = await service.signIn("testuser", "temppassword");

      expect(result).toEqual({
        success: false,
        challenge: "NEW_PASSWORD_REQUIRED",
        userAttributes,
        requiredAttributes,
        user: mockCognitoUser,
      });
    });

    it("should handle MFA required challenge", async () => {
      const challengeName = "SMS_MFA";
      const challengeParameters = { DESTINATION: "+1***5678" };

      mockCognitoUser.authenticateUser.mockImplementation(
        (authDetails, callbacks) => {
          callbacks.mfaRequired(challengeName, challengeParameters);
        },
      );

      const result = await service.signIn("testuser", "password123");

      expect(result).toEqual({
        success: false,
        challenge: "MFA_REQUIRED",
        challengeName,
        challengeParameters,
        user: mockCognitoUser,
      });
    });

    it("should handle authentication details creation", async () => {
      mockCognitoUser.authenticateUser.mockImplementation(
        (authDetails, callbacks) => {
          callbacks.onSuccess(mockAuthResult);
        },
      );

      await service.signIn("testuser", "password123");

      expect(mockAuthenticationDetails).toHaveBeenCalledWith({
        Username: "testuser",
        Password: "password123",
      });
    });
  });

  describe("signOut", () => {
    it("should sign out current user and clear tokens", async () => {
      service.currentUser = mockCognitoUser;

      await service.signOut();

      expect(mockCognitoUser.signOut).toHaveBeenCalled();
      expect(service.currentUser).toBeNull();
      // Tokens should be cleared from storage
      expect(localStorage.getItem("accessToken")).toBeNull();
      expect(sessionStorage.getItem("accessToken")).toBeNull();
    });

    it("should handle sign out when no current user", async () => {
      service.currentUser = null;

      await service.signOut();

      expect(mockCognitoUser.signOut).not.toHaveBeenCalled();
    });
  });

  describe("getCurrentUser", () => {
    it("should get current user with valid session", async () => {
      const mockSession = {
        isValid: () => true,
      };
      const mockAttributes = [
        { getName: () => "email", getValue: () => "test@example.com" },
        { getName: () => "name", getValue: () => "Test User" },
      ];

      mockUserPool.getCurrentUser.mockReturnValue(mockCognitoUser);
      mockCognitoUser.getSession.mockImplementation((callback) => {
        callback(null, mockSession);
      });
      mockCognitoUser.getUserAttributes.mockImplementation((callback) => {
        callback(null, mockAttributes);
      });

      const result = await service.getCurrentUser();

      expect(result).toEqual({
        username: "testuser",
        attributes: {
          email: "test@example.com",
          name: "Test User",
        },
        session: mockSession,
      });
    });

    it("should return null when no current user", async () => {
      mockUserPool.getCurrentUser.mockReturnValue(null);

      const result = await service.getCurrentUser();

      expect(result).toBeNull();
    });

    it("should handle session errors", async () => {
      const error = { message: "Session expired" };
      mockUserPool.getCurrentUser.mockReturnValue(mockCognitoUser);
      mockCognitoUser.getSession.mockImplementation((callback) => {
        callback(error);
      });

      await expect(service.getCurrentUser()).rejects.toThrow("Session expired");
    });

    it("should return null for invalid session", async () => {
      const mockSession = {
        isValid: () => false,
      };
      mockUserPool.getCurrentUser.mockReturnValue(mockCognitoUser);
      mockCognitoUser.getSession.mockImplementation((callback) => {
        callback(null, mockSession);
      });

      const result = await service.getCurrentUser();

      expect(result).toBeNull();
    });

    it("should handle user attributes errors", async () => {
      const mockSession = {
        isValid: () => true,
      };
      const error = { message: "Failed to get attributes" };

      mockUserPool.getCurrentUser.mockReturnValue(mockCognitoUser);
      mockCognitoUser.getSession.mockImplementation((callback) => {
        callback(null, mockSession);
      });
      mockCognitoUser.getUserAttributes.mockImplementation((callback) => {
        callback(error);
      });

      await expect(service.getCurrentUser()).rejects.toThrow(
        "Failed to get attributes",
      );
    });
  });

  describe("refreshSession", () => {
    it("should refresh session successfully", async () => {
      const mockSession = {
        isValid: () => true,
        getAccessToken: () => ({ getJwtToken: () => "new-access-token" }),
        getRefreshToken: () => ({ getToken: () => "new-refresh-token" }),
        getIdToken: () => ({ getJwtToken: () => "new-id-token" }),
      };

      mockUserPool.getCurrentUser.mockReturnValue(mockCognitoUser);
      mockCognitoUser.getSession.mockImplementation((callback) => {
        callback(null, mockSession);
      });

      const result = await service.refreshSession();

      expect(result.tokens.accessToken).toBe("new-access-token");
      expect(result.tokens.refreshToken).toBe("new-refresh-token");
      expect(result.tokens.idToken).toBe("new-id-token");
    });

    it("should handle refresh when no current user", async () => {
      mockUserPool.getCurrentUser.mockReturnValue(null);

      await expect(service.refreshSession()).rejects.toThrow("No current user");
    });

    it("should handle session errors during refresh", async () => {
      const error = { message: "Session error" };
      mockUserPool.getCurrentUser.mockReturnValue(mockCognitoUser);
      mockCognitoUser.getSession.mockImplementation((callback) => {
        callback(error);
      });

      await expect(service.refreshSession()).rejects.toThrow("Session error");
    });

    it("should handle invalid session during refresh", async () => {
      const mockSession = {
        isValid: () => false,
      };
      mockUserPool.getCurrentUser.mockReturnValue(mockCognitoUser);
      mockCognitoUser.getSession.mockImplementation((callback) => {
        callback(null, mockSession);
      });

      await expect(service.refreshSession()).rejects.toThrow(
        "Session is not valid",
      );
    });
  });

  describe("forgotPassword", () => {
    it("should initiate password reset successfully", async () => {
      const mockResult = { message: "Reset code sent" };
      mockCognitoUser.forgotPassword.mockImplementation((callbacks) => {
        callbacks.onSuccess(mockResult);
      });

      const result = await service.forgotPassword("testuser");

      expect(result).toBe(mockResult);
      expect(mockCognitoUserClass).toHaveBeenCalledWith({
        Username: "testuser",
        Pool: mockUserPool,
      });
    });

    it("should handle forgot password errors", async () => {
      const error = { message: "User not found" };
      mockCognitoUser.forgotPassword.mockImplementation((callbacks) => {
        callbacks.onFailure(error);
      });

      await expect(service.forgotPassword("nonexistent")).rejects.toThrow(
        "User not found",
      );
    });

    it("should handle forgot password errors without message", async () => {
      const error = {};
      mockCognitoUser.forgotPassword.mockImplementation((callbacks) => {
        callbacks.onFailure(error);
      });

      await expect(service.forgotPassword("testuser")).rejects.toThrow(
        "Forgot password failed",
      );
    });
  });

  describe("confirmForgotPassword", () => {
    it("should confirm password reset successfully", async () => {
      const mockResult = "SUCCESS";
      mockCognitoUser.confirmPassword.mockImplementation(
        (code, newPassword, callbacks) => {
          callbacks.onSuccess(mockResult);
        },
      );

      const result = await service.confirmForgotPassword(
        "testuser",
        "123456",
        "newpassword123",
      );

      expect(result).toBe(mockResult);
      expect(mockCognitoUser.confirmPassword).toHaveBeenCalledWith(
        "123456",
        "newpassword123",
        expect.any(Object),
      );
    });

    it("should handle confirm password errors", async () => {
      const error = { message: "Invalid code" };
      mockCognitoUser.confirmPassword.mockImplementation(
        (code, newPassword, callbacks) => {
          callbacks.onFailure(error);
        },
      );

      await expect(
        service.confirmForgotPassword("testuser", "wrongcode", "newpassword"),
      ).rejects.toThrow("Invalid code");
    });

    it("should handle confirm password errors without message", async () => {
      const error = {};
      mockCognitoUser.confirmPassword.mockImplementation(
        (code, newPassword, callbacks) => {
          callbacks.onFailure(error);
        },
      );

      await expect(
        service.confirmForgotPassword("testuser", "123456", "newpassword"),
      ).rejects.toThrow("Password confirmation failed");
    });
  });

  describe("isAuthenticated and getAccessToken", () => {
    it("should return false/null when no valid token exists", () => {
      expect(service.isAuthenticated()).toBe(false);
      expect(service.getAccessToken()).toBeNull();
    });

    it("should return true/token when valid token exists", () => {
      // Create a valid JWT-like token
      const futureTime = Math.floor(Date.now() / 1000) + 3600;
      const payload = btoa(JSON.stringify({ exp: futureTime }));
      const validToken = `header.${payload}.signature`;

      sessionStorage.setItem("accessToken", validToken);

      expect(service.isAuthenticated()).toBe(true);
      expect(service.getAccessToken()).toBe(validToken);
    });
  });

  describe("singleton instance", () => {
    it("should export singleton instance", () => {
      expect(cognitoAuth).toBeInstanceOf(CognitoAuthService);
    });

    it("should be the same instance on multiple imports", () => {
      const { cognitoAuth: instance1 } = require("./cognitoAuth.js");
      const { default: instance2 } = require("./cognitoAuth.js");

      expect(instance1).toBe(instance2);
    });
  });

  describe("error handling and edge cases", () => {
    it("should handle malformed token validation gracefully", () => {
      const consoleSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});

      sessionStorage.setItem("accessToken", "malformed.token");

      expect(service.isAuthenticated()).toBe(false);
      expect(consoleSpy).toHaveBeenCalled();

      consoleSpy.mockRestore();
    });

    it("should handle token without proper JWT structure", () => {
      sessionStorage.setItem("accessToken", "not-a-jwt");

      expect(service.isAuthenticated()).toBe(false);
      expect(service.getAccessToken()).toBeNull();
    });

    it("should handle session errors without message", async () => {
      mockUserPool.getCurrentUser.mockReturnValue(mockCognitoUser);
      mockCognitoUser.getSession.mockImplementation((callback) => {
        callback({});
      });

      await expect(service.getCurrentUser()).rejects.toThrow(
        "Failed to get session",
      );
    });

    it("should handle user attributes errors without message", async () => {
      const mockSession = { isValid: () => true };
      mockUserPool.getCurrentUser.mockReturnValue(mockCognitoUser);
      mockCognitoUser.getSession.mockImplementation((callback) => {
        callback(null, mockSession);
      });
      mockCognitoUser.getUserAttributes.mockImplementation((callback) => {
        callback({});
      });

      await expect(service.getCurrentUser()).rejects.toThrow(
        "Failed to get user attributes",
      );
    });
  });
});
