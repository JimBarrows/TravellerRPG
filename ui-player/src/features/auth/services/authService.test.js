/**
 * AuthService Tests
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
vi.mock("./cognitoAuth.js", () => ({
  cognitoAuth: {
    signIn: vi.fn(),
    signUp: vi.fn(),
    confirmSignUp: vi.fn(),
    signOut: vi.fn(),
    getCurrentUser: vi.fn(),
    isAuthenticated: vi.fn(),
    getAccessToken: vi.fn(),
    forgotPassword: vi.fn(),
    confirmForgotPassword: vi.fn(),
  },
}));

import authService, {
  authService as namedAuthService,
  cognitoAuth as exportedCognitoAuth,
} from "./authService.js";

describe("AuthService", () => {
  let mockCognitoAuth;

  beforeEach(() => {
    vi.clearAllMocks();
    mockCognitoAuth = authService.cognitoAuth;

    // Reset console mocks
    vi.spyOn(console, "log").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});
    vi.spyOn(console, "warn").mockImplementation(() => {});
  });

  describe("constructor and initialization", () => {
    it("should initialize with cognitoAuth service", () => {
      expect(authService.cognitoAuth).toBe(mockCognitoAuth);
    });

    it("should be a singleton instance", () => {
      expect(namedAuthService).toBe(authService);
      expect(exportedCognitoAuth).toBeDefined();
    });
  });

  describe("configure", () => {
    it("should log configuration without user pool credentials", async () => {
      const config = {};

      const result = await authService.configure(config);

      expect(result).toBeUndefined();
      expect(console.log).toHaveBeenCalledWith(
        "Auth service configured with:",
        {
          hasUserPoolId: false,
          hasClientId: false,
        },
      );
    });

    it("should log configuration with user pool credentials", async () => {
      const config = {
        userPoolId: "test-pool-id",
        userPoolClientId: "test-client-id",
      };

      await authService.configure(config);

      expect(console.log).toHaveBeenCalledWith(
        "Auth service configured with:",
        {
          hasUserPoolId: true,
          hasClientId: true,
        },
      );
    });

    it("should handle configuration with partial credentials", async () => {
      const config = {
        userPoolId: "test-pool-id",
        // Missing userPoolClientId
      };

      await authService.configure(config);

      expect(console.log).toHaveBeenCalledWith(
        "Auth service configured with:",
        {
          hasUserPoolId: true,
          hasClientId: false,
        },
      );
    });

    it("should return a resolved promise", async () => {
      const result = await authService.configure();
      expect(result).toBeUndefined();
    });
  });

  describe("signIn", () => {
    it("should sign in successfully and return formatted result", async () => {
      const mockUser = {
        getUsername: () => "testuser",
      };

      mockCognitoAuth.signIn.mockResolvedValue({
        success: true,
        user: mockUser,
      });

      const result = await authService.signIn("testuser", "password123", false);

      expect(mockCognitoAuth.signIn).toHaveBeenCalledWith(
        "testuser",
        "password123",
        false,
      );
      expect(result).toEqual({
        isSignedIn: true,
        nextStep: { signInStep: "DONE" },
        user: {
          username: "testuser",
          signInDetails: {
            loginId: "testuser",
          },
        },
      });
    });

    it("should handle sign in with rememberMe option", async () => {
      const mockUser = {
        getUsername: () => "testuser",
      };

      mockCognitoAuth.signIn.mockResolvedValue({
        success: true,
        user: mockUser,
      });

      await authService.signIn("testuser", "password123", true);

      expect(mockCognitoAuth.signIn).toHaveBeenCalledWith(
        "testuser",
        "password123",
        true,
      );
    });

    it("should handle MFA challenge", async () => {
      const mockUser = { username: "testuser" };

      mockCognitoAuth.signIn.mockResolvedValue({
        success: false,
        challenge: "MFA_REQUIRED",
        user: mockUser,
      });

      const result = await authService.signIn("testuser", "password123");

      expect(result).toEqual({
        isSignedIn: false,
        nextStep: {
          signInStep: "CONFIRM_SIGN_IN_WITH_TOTP_CODE",
          challengeType: "MFA_REQUIRED",
        },
        user: mockUser,
      });
    });

    it("should handle new password required challenge", async () => {
      const mockUser = { username: "testuser" };

      mockCognitoAuth.signIn.mockResolvedValue({
        success: false,
        challenge: "NEW_PASSWORD_REQUIRED",
        user: mockUser,
      });

      const result = await authService.signIn("testuser", "password123");

      expect(result).toEqual({
        isSignedIn: false,
        nextStep: {
          signInStep: "CONFIRM_SIGN_IN_WITH_NEW_PASSWORD_REQUIRED",
          challengeType: "NEW_PASSWORD_REQUIRED",
        },
        user: mockUser,
      });
    });

    it("should throw error for failed sign in without challenge", async () => {
      mockCognitoAuth.signIn.mockResolvedValue({
        success: false,
        // No challenge property
      });

      await expect(
        authService.signIn("testuser", "wrongpassword"),
      ).rejects.toThrow("Sign in failed");
    });

    it("should handle sign in errors gracefully", async () => {
      const error = new Error("Network error");
      mockCognitoAuth.signIn.mockRejectedValue(error);

      await expect(
        authService.signIn("testuser", "password123"),
      ).rejects.toThrow("Network error");

      expect(console.error).toHaveBeenCalledWith(
        "AuthService signIn error:",
        error,
      );
    });

    it("should handle cognitoAuth throwing error with custom message", async () => {
      const customError = new Error("Invalid credentials");
      mockCognitoAuth.signIn.mockRejectedValue(customError);

      await expect(authService.signIn("testuser", "badpass")).rejects.toThrow(
        "Invalid credentials",
      );
    });

    it("should handle error without message", async () => {
      mockCognitoAuth.signIn.mockRejectedValue(new Error());

      await expect(authService.signIn("testuser", "password")).rejects.toThrow(
        "Sign in failed",
      );
    });
  });

  describe("signUp", () => {
    it("should sign up successfully", async () => {
      mockCognitoAuth.signUp.mockResolvedValue({
        userConfirmed: false,
        userSub: "user-123",
      });

      const result = await authService.signUp(
        "testuser",
        "password123",
        "test@example.com",
        { name: "Test User" },
      );

      expect(mockCognitoAuth.signUp).toHaveBeenCalledWith(
        "testuser",
        "password123",
        "test@example.com",
        { name: "Test User" },
      );
      expect(result).toEqual({
        isSignUpComplete: false,
        userId: "user-123",
        nextStep: {
          signUpStep: "CONFIRM_SIGN_UP",
        },
      });
    });

    it("should handle confirmed user sign up", async () => {
      mockCognitoAuth.signUp.mockResolvedValue({
        userConfirmed: true,
        userSub: "user-456",
      });

      const result = await authService.signUp(
        "confirmeduser",
        "password123",
        "confirmed@example.com",
      );

      expect(result).toEqual({
        isSignUpComplete: true,
        userId: "user-456",
        nextStep: {
          signUpStep: "DONE",
        },
      });
    });

    it("should handle sign up with minimal attributes", async () => {
      mockCognitoAuth.signUp.mockResolvedValue({
        userConfirmed: false,
        userSub: "user-789",
      });

      const result = await authService.signUp(
        "minimaluser",
        "password123",
        "minimal@example.com",
      );

      expect(mockCognitoAuth.signUp).toHaveBeenCalledWith(
        "minimaluser",
        "password123",
        "minimal@example.com",
        {},
      );
    });

    it("should handle sign up errors", async () => {
      const error = new Error("Email already exists");
      mockCognitoAuth.signUp.mockRejectedValue(error);

      await expect(
        authService.signUp("testuser", "password123", "existing@example.com"),
      ).rejects.toThrow("Email already exists");

      expect(console.error).toHaveBeenCalledWith(
        "AuthService signUp error:",
        error,
      );
    });

    it("should handle sign up error without message", async () => {
      mockCognitoAuth.signUp.mockRejectedValue(new Error());

      await expect(
        authService.signUp("testuser", "password123", "test@example.com"),
      ).rejects.toThrow("Sign up failed");
    });
  });

  describe("confirmSignUp", () => {
    it("should confirm sign up successfully", async () => {
      mockCognitoAuth.confirmSignUp.mockResolvedValue();

      const result = await authService.confirmSignUp("testuser", "123456");

      expect(mockCognitoAuth.confirmSignUp).toHaveBeenCalledWith(
        "testuser",
        "123456",
      );
      expect(result).toEqual({
        isSignUpComplete: true,
        nextStep: { signUpStep: "DONE" },
      });
    });

    it("should handle confirmation errors", async () => {
      const error = new Error("Invalid code");
      mockCognitoAuth.confirmSignUp.mockRejectedValue(error);

      await expect(
        authService.confirmSignUp("testuser", "wrongcode"),
      ).rejects.toThrow("Invalid code");

      expect(console.error).toHaveBeenCalledWith(
        "AuthService confirmSignUp error:",
        error,
      );
    });

    it("should handle confirmation error without message", async () => {
      mockCognitoAuth.confirmSignUp.mockRejectedValue(new Error());

      await expect(
        authService.confirmSignUp("testuser", "123456"),
      ).rejects.toThrow("Confirmation failed");
    });
  });

  describe("signOut", () => {
    it("should sign out successfully", async () => {
      mockCognitoAuth.signOut.mockResolvedValue();

      const result = await authService.signOut();

      expect(mockCognitoAuth.signOut).toHaveBeenCalled();
      expect(result).toEqual({
        isSignedOut: true,
        nextStep: { signOutStep: "DONE" },
      });
    });

    it("should handle sign out errors", async () => {
      const error = new Error("Sign out failed");
      mockCognitoAuth.signOut.mockRejectedValue(error);

      await expect(authService.signOut()).rejects.toThrow("Sign out failed");

      expect(console.error).toHaveBeenCalledWith(
        "AuthService signOut error:",
        error,
      );
    });

    it("should handle sign out error without message", async () => {
      mockCognitoAuth.signOut.mockRejectedValue(new Error());

      await expect(authService.signOut()).rejects.toThrow("Sign out failed");
    });
  });

  describe("getCurrentUser", () => {
    it("should get current user successfully with full attributes", async () => {
      const mockUser = {
        username: "testuser",
        attributes: {
          sub: "user-123",
          email: "test@example.com",
          name: "Test User",
        },
      };

      mockCognitoAuth.getCurrentUser.mockResolvedValue(mockUser);

      const result = await authService.getCurrentUser();

      expect(result).toEqual({
        username: "testuser",
        userId: "user-123",
        signInDetails: {
          loginId: "test@example.com",
        },
        attributes: mockUser.attributes,
      });
    });

    it("should handle user without email attribute", async () => {
      const mockUser = {
        username: "testuser",
        attributes: {
          sub: "user-456",
        },
      };

      mockCognitoAuth.getCurrentUser.mockResolvedValue(mockUser);

      const result = await authService.getCurrentUser();

      expect(result.signInDetails.loginId).toBe("testuser");
    });

    it("should return null when no user is authenticated", async () => {
      mockCognitoAuth.getCurrentUser.mockResolvedValue(null);

      const result = await authService.getCurrentUser();

      expect(result).toBeNull();
    });

    it("should handle errors gracefully and return null", async () => {
      const error = new Error("User not found");
      mockCognitoAuth.getCurrentUser.mockRejectedValue(error);

      const result = await authService.getCurrentUser();

      expect(result).toBeNull();
      expect(console.error).toHaveBeenCalledWith(
        "AuthService getCurrentUser error:",
        error,
      );
    });

    it("should handle user without attributes", async () => {
      const mockUser = {
        username: "testuser",
        // No attributes property
      };

      mockCognitoAuth.getCurrentUser.mockResolvedValue(mockUser);

      const result = await authService.getCurrentUser();

      expect(result).toEqual({
        username: "testuser",
        userId: undefined,
        signInDetails: {
          loginId: "testuser",
        },
        attributes: undefined,
      });
    });
  });

  describe("fetchAuthSession", () => {
    it("should return session with tokens when authenticated", async () => {
      mockCognitoAuth.isAuthenticated.mockReturnValue(true);
      mockCognitoAuth.getAccessToken.mockReturnValue("mock-access-token");

      const result = await authService.fetchAuthSession();

      expect(result.tokens.accessToken.toString()).toBe("mock-access-token");
      expect(result.tokens.idToken.toString()).toBe("mock-access-token");
      expect(result.credentials).toEqual({});
    });

    it("should return empty tokens when not authenticated", async () => {
      mockCognitoAuth.isAuthenticated.mockReturnValue(false);

      const result = await authService.fetchAuthSession();

      expect(result).toEqual({
        tokens: {},
      });
    });

    it("should handle null access token", async () => {
      mockCognitoAuth.isAuthenticated.mockReturnValue(true);
      mockCognitoAuth.getAccessToken.mockReturnValue(null);

      const result = await authService.fetchAuthSession();

      expect(result.tokens.accessToken).toBeUndefined();
      expect(result.tokens.idToken.toString()).toBe(null);
    });

    it("should handle errors gracefully", async () => {
      const error = new Error("Session fetch failed");
      mockCognitoAuth.isAuthenticated.mockImplementation(() => {
        throw error;
      });

      const result = await authService.fetchAuthSession();

      expect(result).toEqual({ tokens: {} });
      expect(console.error).toHaveBeenCalledWith(
        "AuthService fetchAuthSession error:",
        error,
      );
    });
  });

  describe("updateUserAttributes", () => {
    it("should log warning and return not updated", async () => {
      const attributes = { name: "New Name", email: "new@example.com" };

      const result = await authService.updateUserAttributes(attributes);

      expect(result).toEqual({
        isUpdated: false,
        nextStep: { updateAttributeStep: "DONE" },
      });
      expect(console.warn).toHaveBeenCalledWith(
        "updateUserAttributes not yet implemented with direct Cognito SDK",
      );
    });

    it("should handle errors in updateUserAttributes", async () => {
      // Mock console.warn to throw (unlikely but for coverage)
      console.warn.mockImplementation(() => {
        throw new Error("Logging failed");
      });

      await expect(authService.updateUserAttributes({})).rejects.toThrow(
        "Logging failed",
      );

      expect(console.error).toHaveBeenCalled();
    });
  });

  describe("updatePassword", () => {
    it("should log warning and return not updated", async () => {
      const result = await authService.updatePassword("oldpass", "newpass");

      expect(result).toEqual({
        isUpdated: false,
        nextStep: { updatePasswordStep: "DONE" },
      });
      expect(console.warn).toHaveBeenCalledWith(
        "updatePassword not yet implemented with direct Cognito SDK",
      );
    });

    it("should handle errors in updatePassword", async () => {
      console.warn.mockImplementation(() => {
        throw new Error("Logging failed");
      });

      await expect(authService.updatePassword("old", "new")).rejects.toThrow(
        "Logging failed",
      );

      expect(console.error).toHaveBeenCalled();
    });
  });

  describe("resetPassword", () => {
    it("should initiate password reset successfully", async () => {
      mockCognitoAuth.forgotPassword.mockResolvedValue();

      const result = await authService.resetPassword("testuser");

      expect(mockCognitoAuth.forgotPassword).toHaveBeenCalledWith("testuser");
      expect(result).toEqual({
        isPasswordReset: false,
        nextStep: { resetPasswordStep: "CONFIRM_RESET_PASSWORD_WITH_CODE" },
      });
    });

    it("should handle reset password errors", async () => {
      const error = new Error("User not found");
      mockCognitoAuth.forgotPassword.mockRejectedValue(error);

      await expect(authService.resetPassword("nonexistent")).rejects.toThrow(
        "User not found",
      );

      expect(console.error).toHaveBeenCalledWith(
        "AuthService resetPassword error:",
        error,
      );
    });

    it("should handle reset password error without message", async () => {
      mockCognitoAuth.forgotPassword.mockRejectedValue(new Error());

      await expect(authService.resetPassword("testuser")).rejects.toThrow(
        "Password reset failed",
      );
    });
  });

  describe("confirmResetPassword", () => {
    it("should confirm password reset successfully", async () => {
      mockCognitoAuth.confirmForgotPassword.mockResolvedValue();

      const result = await authService.confirmResetPassword(
        "testuser",
        "newpass123",
        "123456",
      );

      expect(mockCognitoAuth.confirmForgotPassword).toHaveBeenCalledWith(
        "testuser",
        "123456",
        "newpass123",
      );
      expect(result).toEqual({
        isPasswordReset: true,
        nextStep: { resetPasswordStep: "DONE" },
      });
    });

    it("should handle confirm reset password errors", async () => {
      const error = new Error("Invalid reset code");
      mockCognitoAuth.confirmForgotPassword.mockRejectedValue(error);

      await expect(
        authService.confirmResetPassword("testuser", "newpass", "wrongcode"),
      ).rejects.toThrow("Invalid reset code");

      expect(console.error).toHaveBeenCalledWith(
        "AuthService confirmResetPassword error:",
        error,
      );
    });

    it("should handle confirm reset password error without message", async () => {
      mockCognitoAuth.confirmForgotPassword.mockRejectedValue(new Error());

      await expect(
        authService.confirmResetPassword("testuser", "newpass", "123456"),
      ).rejects.toThrow("Password reset confirmation failed");
    });
  });

  describe("isAuthenticated", () => {
    it("should return true when authenticated", () => {
      mockCognitoAuth.isAuthenticated.mockReturnValue(true);

      const result = authService.isAuthenticated();

      expect(result).toBe(true);
      expect(mockCognitoAuth.isAuthenticated).toHaveBeenCalled();
    });

    it("should return false when not authenticated", () => {
      mockCognitoAuth.isAuthenticated.mockReturnValue(false);

      const result = authService.isAuthenticated();

      expect(result).toBe(false);
    });
  });

  describe("getAccessToken", () => {
    it("should return access token when available", () => {
      mockCognitoAuth.getAccessToken.mockReturnValue("mock-access-token");

      const result = authService.getAccessToken();

      expect(result).toBe("mock-access-token");
      expect(mockCognitoAuth.getAccessToken).toHaveBeenCalled();
    });

    it("should return null when no token available", () => {
      mockCognitoAuth.getAccessToken.mockReturnValue(null);

      const result = authService.getAccessToken();

      expect(result).toBeNull();
    });
  });

  describe("edge cases and error handling", () => {
    it("should handle all methods when cognitoAuth is undefined", () => {
      const originalCognitoAuth = authService.cognitoAuth;
      authService.cognitoAuth = undefined;

      expect(() => authService.isAuthenticated()).toThrow();
      expect(() => authService.getAccessToken()).toThrow();

      // Restore
      authService.cognitoAuth = originalCognitoAuth;
    });

    it("should handle methods with undefined parameters", async () => {
      mockCognitoAuth.signIn.mockResolvedValue({ success: false });

      await expect(authService.signIn(undefined, undefined)).rejects.toThrow(
        "Sign in failed",
      );
    });

    it("should handle empty string parameters", async () => {
      mockCognitoAuth.signUp.mockResolvedValue({
        userConfirmed: false,
        userSub: "empty-user",
      });

      const result = await authService.signUp("", "", "");
      expect(result.userId).toBe("empty-user");
    });
  });
});
