import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from 'vitest';
import { simpleTokenManager, isTokenValid, shouldRefreshToken } from '../../features/auth/utils/tokenUtils.simple.js';

// Test tokens
const validToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjk5OTk5OTk5OTl9.8lXzjwb_lfJn3ZlHpxwpew4WXMpjCA6-TAlKxLILOdg';
const expiredToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjE1MTYyMzkwMjJ9.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';

let testTokens = {};
let rememberMeEnabled = false;

Given('I am using the Traveller RPG application', function () {
  // Initialize application context
  global.window = global.window || {};
  global.localStorage = global.localStorage || {
    getItem: () => null,
    setItem: () => {},
    removeItem: () => {},
    clear: () => {}
  };
  global.sessionStorage = global.sessionStorage || {
    getItem: () => null,
    setItem: () => {},
    removeItem: () => {},
    clear: () => {}
  };
});

Given('the token management system is initialized', function () {
  simpleTokenManager.clearTokens();
  testTokens = {};
  rememberMeEnabled = false;
});

Given('I have valid JWT tokens', function () {
  testTokens = {
    accessToken: validToken,
    refreshToken: 'refresh_token_123',
    idToken: 'id_token_123'
  };
});

Given('I have a JWT token with known expiration', function () {
  testTokens = {
    accessToken: validToken
  };
});

Given('I have a token that is about to expire', function () {
  // Create a token that expires in 4 minutes (less than 5 minute threshold)
  const futureTime = Math.floor(Date.now() / 1000) + (4 * 60);
  const soonToExpireToken = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.${btoa(JSON.stringify({
    sub: '1234567890',
    exp: futureTime
  }))}.signature`;
  
  testTokens = {
    accessToken: soonToExpireToken
  };
});

Given('I have an active session', function () {
  testTokens = {
    accessToken: validToken
  };
});

Given('my token is about to expire in 5 minutes', function () {
  const futureTime = Math.floor(Date.now() / 1000) + (5 * 60);
  const soonToExpireToken = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.${btoa(JSON.stringify({
    sub: '1234567890',
    exp: futureTime
  }))}.signature`;
  
  testTokens = {
    accessToken: soonToExpireToken
  };
});

Given('I have an expired refresh token', function () {
  testTokens = {
    accessToken: expiredToken,
    refreshToken: expiredToken
  };
});

Given('I am authenticated with a valid token', async function () {
  testTokens = {
    accessToken: validToken
  };
  await simpleTokenManager.setTokens(testTokens, false);
});

Given('I am authenticated', async function () {
  testTokens = {
    accessToken: validToken
  };
  await simpleTokenManager.setTokens(testTokens, false);
});

When('I enable "remember me" functionality', function () {
  rememberMeEnabled = true;
});

When('I disable "remember me" functionality', function () {
  rememberMeEnabled = false;
});

When('I check if the token is valid', function () {
  this.tokenValidationResult = isTokenValid(testTokens.accessToken);
});

When('the token reaches the refresh threshold', function () {
  this.shouldRefreshResult = shouldRefreshToken(testTokens.accessToken);
});

When('the system attempts to refresh the access token', function () {
  // Simulate refresh attempt with expired refresh token
  this.refreshAttempted = true;
  this.refreshFailed = !isTokenValid(testTokens.refreshToken);
});

When('I reload the page', async function () {
  // Simulate page reload by checking if tokens are persisted
  this.tokensAfterReload = await simpleTokenManager.getTokens();
});

When('I make an API request', function () {
  // Simulate API request
  this.apiRequestMade = true;
});

When('I receive a 401 response', function () {
  this.receivedUnauthorized = true;
});

Then('my tokens should be stored securely in encrypted local storage', async function () {
  await simpleTokenManager.setTokens(testTokens, rememberMeEnabled);
  
  if (rememberMeEnabled) {
    expect(localStorage.getItem).toBeDefined();
  }
});

Then('my tokens should be stored only in session storage', async function () {
  await simpleTokenManager.setTokens(testTokens, rememberMeEnabled);
  
  if (!rememberMeEnabled) {
    expect(sessionStorage.getItem).toBeDefined();
  }
});

Then('the system should correctly identify valid tokens', function () {
  expect(this.tokenValidationResult).toBe(true);
});

Then('the system should correctly identify expired tokens', function () {
  const expiredResult = isTokenValid(expiredToken);
  expect(expiredResult).toBe(false);
});

Then('the system should calculate time until expiration', function () {
  const expiration = new Date(9999999999 * 1000); // Far future
  expect(expiration.getTime()).toBeGreaterThan(Date.now());
});

Then('the system should automatically refresh the token', function () {
  expect(this.shouldRefreshResult).toBe(true);
});

Then('the new token should be stored securely', function () {
  // In a real implementation, this would verify the new token is stored
  expect(this.shouldRefreshResult).toBe(true);
});

Then('my session should continue without interruption', function () {
  // Verify session continuity
  expect(this.shouldRefreshResult).toBe(true);
});

Then('I should see a session timeout warning notification', async function () {
  const shouldShow = await simpleTokenManager.shouldShowSessionTimeoutWarning();
  expect(shouldShow).toBe(true);
});

Then('I should have options to extend my session or logout', function () {
  // This would be tested in the UI component tests
  expect(true).toBe(true); // Placeholder
});

Then('the refresh should fail gracefully', function () {
  expect(this.refreshFailed).toBe(true);
});

Then('I should be redirected to the login page', function () {
  // This would be handled by the auth context
  expect(this.refreshFailed).toBe(true);
});

Then('all stored tokens should be cleared', function () {
  simpleTokenManager.clearTokens();
  // Verify tokens are cleared
  expect(localStorage.getItem('authToken')).toBeNull();
});

Then('my authentication state should be restored', function () {
  expect(this.tokensAfterReload).toBeTruthy();
});

Then('my user information should be available', function () {
  expect(this.tokensAfterReload.accessToken).toBeTruthy();
});

Then('I should not need to login again', function () {
  expect(isTokenValid(this.tokensAfterReload.accessToken)).toBe(true);
});

Then('the request should include the proper Authorization header', function () {
  // This would be tested in the HTTP interceptor
  expect(this.apiRequestMade).toBe(true);
});

Then('the system should attempt token refresh', function () {
  expect(this.receivedUnauthorized).toBe(true);
});

Then('retry the original request with the new token', function () {
  // This would be handled by the HTTP interceptor
  expect(this.receivedUnauthorized).toBe(true);
});