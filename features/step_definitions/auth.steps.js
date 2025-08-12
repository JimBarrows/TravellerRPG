import { Given, When, Then, Before, After } from '@cucumber/cucumber';
import { expect } from '@playwright/test';

const BASE_URL = process.env.VITE_BASE_URL || 'http://localhost:5173';

Before(async function() {
  await this.openBrowser();
});

After(async function() {
  await this.closeBrowser();
});

// Navigation steps
Given('I am on the registration page', async function() {
  await this.page.goto(`${BASE_URL}/register`);
  await this.page.waitForSelector('.auth-form', { state: 'visible' });
});

Given('I am on the login page', async function() {
  await this.page.goto(`${BASE_URL}/login`);
  await this.page.waitForSelector('.auth-form', { state: 'visible' });
});

Given('I am on the profile page', async function() {
  await this.page.goto(`${BASE_URL}/profile`);
  await this.page.waitForSelector('.profile-form', { state: 'visible' });
});

// Registration steps
When('I enter {string} as email', async function(email) {
  await this.page.fill('#email', email);
  this.testData.email = email;
});

When('I enter {string} as password', async function(password) {
  await this.page.fill('#password', password);
  this.testData.password = password;
});

When('I confirm the password', async function() {
  await this.page.fill('#confirmPassword', this.testData.password);
});

When('I enter {string} as display name', async function(displayName) {
  await this.page.fill('#displayName', displayName);
  this.testData.displayName = displayName;
});

When('I accept the terms and conditions', async function() {
  await this.page.check('input[name="acceptTerms"]');
});

When('I click the sign-up button', async function() {
  await this.page.click('button[type="submit"]:has-text("Sign Up")');
});

When('I click the sign-in button', async function() {
  await this.page.click('button[type="submit"]:has-text("Sign In")');
});

When('I enter the verification code {string}', async function(code) {
  await this.page.fill('#verification-code', code);
});

When('I click verify', async function() {
  await this.page.click('button:has-text("Verify Email")');
});

// Login steps
When('I check the remember me checkbox', async function() {
  await this.page.check('input[name="rememberMe"]');
});

When('I click on forgot password', async function() {
  await this.page.click('button:has-text("Forgot Password")');
});

When('I enter {string} for password reset', async function(email) {
  await this.page.fill('#reset-email', email);
});

When('I click send reset link', async function() {
  await this.page.click('button:has-text("Send Reset Link")');
});

// Profile steps
When('I change my display name to {string}', async function(newName) {
  await this.page.fill('#displayName', newName);
});

When('I change my password from {string} to {string}', async function(oldPassword, newPassword) {
  await this.page.fill('#oldPassword', oldPassword);
  await this.page.fill('#newPassword', newPassword);
  await this.page.fill('#confirmNewPassword', newPassword);
});

When('I save the changes', async function() {
  await this.page.click('button:has-text("Save Changes")');
});

When('I click logout', async function() {
  await this.page.click('button:has-text("Logout")');
});

// Validation steps
Then('I should see an error message {string}', async function(message) {
  const errorElement = await this.page.waitForSelector('.error-message, .field-error', { state: 'visible' });
  const errorText = await errorElement.textContent();
  expect(errorText).toContain(message);
});

Then('I should be redirected to the dashboard', async function() {
  await this.page.waitForURL(`${BASE_URL}/dashboard`);
  expect(this.page.url()).toContain('/dashboard');
});

Then('I should be redirected to the login page', async function() {
  await this.page.waitForURL(`${BASE_URL}/login`);
  expect(this.page.url()).toContain('/login');
});

Then('I should see a verification code input', async function() {
  await this.page.waitForSelector('#verification-code', { state: 'visible' });
});

Then('I should see a confirmation message', async function() {
  await this.page.waitForSelector('.success-message', { state: 'visible' });
});

Then('my display name should be updated', async function() {
  const displayNameElement = await this.page.waitForSelector('.user-display-name');
  const displayName = await displayNameElement.textContent();
  expect(displayName).toContain(this.testData.displayName);
});

Then('I should receive a password reset email', async function() {
  // This would typically check an email service or mock
  // For now, we'll just check for the success message
  const message = await this.page.waitForSelector('.success-message:has-text("Password reset instructions sent")', { state: 'visible' });
  expect(message).toBeTruthy();
});

Then('I should be logged out', async function() {
  await this.page.waitForURL(`${BASE_URL}/login`);
  // Check that auth tokens are removed
  const localStorage = await this.page.evaluate(() => {
    return {
      authToken: window.localStorage.getItem('authToken'),
      refreshToken: window.localStorage.getItem('refreshToken')
    };
  });
  expect(localStorage.authToken).toBeNull();
  expect(localStorage.refreshToken).toBeNull();
});

// Social login steps
When('I click sign in with Google', async function() {
  await this.page.click('button:has-text("Sign in with Google")');
});

When('I click sign in with Apple', async function() {
  await this.page.click('button:has-text("Sign in with Apple")');
});

Then('I should be redirected to Google OAuth', async function() {
  // Check for Google OAuth redirect
  await this.page.waitForURL(/accounts\.google\.com/);
});

Then('I should be redirected to Apple OAuth', async function() {
  // Check for Apple OAuth redirect
  await this.page.waitForURL(/appleid\.apple\.com/);
});

// Password strength steps
Then('I should see password strength indicator showing {string}', async function(strength) {
  const strengthIndicator = await this.page.waitForSelector('.strength-text', { state: 'visible' });
  const strengthText = await strengthIndicator.textContent();
  expect(strengthText.toLowerCase()).toBe(strength.toLowerCase());
});

// MFA steps
Given('I have MFA enabled', async function() {
  // This would set up a user with MFA enabled
  this.testData.mfaEnabled = true;
});

When('I enter my MFA code {string}', async function(code) {
  await this.page.fill('#mfa-code', code);
});

Then('I should see an MFA prompt', async function() {
  await this.page.waitForSelector('#mfa-code', { state: 'visible' });
});

// Error specific steps
Then('I should see {string} field is invalid', async function(fieldName) {
  const field = await this.page.locator(`#${fieldName.toLowerCase()}`);
  const isInvalid = await field.getAttribute('aria-invalid');
  expect(isInvalid).toBe('true');
});

// Rate limiting steps
Then('I should see a rate limit error', async function() {
  const errorElement = await this.page.waitForSelector('.error-message:has-text("Too many attempts")', { state: 'visible' });
  expect(errorElement).toBeTruthy();
});

// Session steps
Given('I am logged in as {string}', async function(email) {
  await this.page.goto(`${BASE_URL}/login`);
  await this.page.fill('#email', email);
  await this.page.fill('#password', 'TestPassword123!');
  await this.page.click('button[type="submit"]:has-text("Sign In")');
  await this.page.waitForURL(`${BASE_URL}/dashboard`);
});

Then('my session should persist', async function() {
  // Reload the page
  await this.page.reload();
  // Check we're still on dashboard
  expect(this.page.url()).toContain('/dashboard');
});

Then('my session should not persist', async function() {
  // Close and reopen browser
  await this.closeBrowser();
  await this.openBrowser();
  await this.page.goto(`${BASE_URL}/dashboard`);
  // Should be redirected to login
  await this.page.waitForURL(`${BASE_URL}/login`);
  expect(this.page.url()).toContain('/login');
});