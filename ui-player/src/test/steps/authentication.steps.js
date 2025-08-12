import { Given, When, Then, Before, After } from '@cucumber/cucumber';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect } from '@jest/globals';
import { AuthProvider } from '../../features/auth/context/AuthContext';
import { RegistrationForm } from '../../features/auth/components/RegistrationForm';
import { LoginForm } from '../../features/auth/components/LoginForm';
import { ProfilePage } from '../../features/profile/pages/ProfilePage';
import { mockCognitoService } from '../mocks/cognitoService';
import { TestRouter } from '../support/TestRouter';

let container;
let user;
let authService;
let emailService;

Before(function() {
  // Set up test environment
  user = userEvent.setup();
  authService = mockCognitoService();
  emailService = { sendEmail: jest.fn() };
  this.testData = {};
});

After(function() {
  // Clean up after each scenario
  if (container) {
    container.unmount();
  }
  jest.clearAllMocks();
});

// Background steps
Given('the authentication system is available', function() {
  // Mock AWS Cognito availability
  expect(authService).toBeDefined();
  expect(authService.isAvailable()).toBe(true);
});

Given('I am on the registration page', function() {
  container = render(
    <TestRouter initialPath="/register">
      <AuthProvider authService={authService}>
        <RegistrationForm />
      </AuthProvider>
    </TestRouter>
  );
});

Given('I am on the login page', function() {
  container = render(
    <TestRouter initialPath="/login">
      <AuthProvider authService={authService}>
        <LoginForm />
      </AuthProvider>
    </TestRouter>
  );
});

// Registration steps
When('I enter {string} as my email', async function(email) {
  const emailInput = await screen.findByLabelText(/email/i);
  await user.type(emailInput, email);
  this.testData.email = email;
});

When('I enter {string} as my password', async function(password) {
  const passwordInput = await screen.findByLabelText(/^password$/i);
  await user.type(passwordInput, password);
  this.testData.password = password;
});

When('I confirm {string} as my password confirmation', async function(password) {
  const confirmInput = await screen.findByLabelText(/confirm password/i);
  await user.type(confirmInput, password);
});

When('I enter {string} as my display name', async function(displayName) {
  const nameInput = await screen.findByLabelText(/display name/i);
  await user.type(nameInput, displayName);
  this.testData.displayName = displayName;
});

When('I accept the terms and conditions', async function() {
  const termsCheckbox = await screen.findByRole('checkbox', { name: /terms/i });
  await user.click(termsCheckbox);
});

When('I submit the registration form', async function() {
  const submitButton = await screen.findByRole('button', { name: /sign up|register/i });
  await user.click(submitButton);
});

Then('I should see a verification email sent message', async function() {
  await waitFor(() => {
    expect(screen.getByText(/verification email sent/i)).toBeInTheDocument();
  });
});

Then('a verification email should be sent to {string}', async function(email) {
  expect(emailService.sendEmail).toHaveBeenCalledWith(
    expect.objectContaining({
      to: email,
      subject: expect.stringContaining('Verify'),
      template: 'email-verification'
    })
  );
});

Then('my account should be created with status {string}', async function(status) {
  const account = await authService.getUser(this.testData.email);
  expect(account).toBeDefined();
  expect(account.status).toBe(status);
});

// Email verification steps
Given('I have registered with email {string}', async function(email) {
  await authService.createUser({
    email,
    password: 'TempPass123!',
    status: 'unverified'
  });
  this.testData.email = email;
});

Given('I received a verification email with code {string}', function(code) {
  this.testData.verificationCode = code;
  authService.setVerificationCode(this.testData.email, code);
});

When('I enter the verification code {string}', async function(code) {
  const codeInput = await screen.findByLabelText(/verification code/i);
  await user.type(codeInput, code);
});

When('I submit the verification form', async function() {
  const verifyButton = await screen.findByRole('button', { name: /verify/i });
  await user.click(verifyButton);
});

Then('my account status should change to {string}', async function(status) {
  const account = await authService.getUser(this.testData.email);
  expect(account.status).toBe(status);
});

Then('I should be automatically logged in', async function() {
  await waitFor(() => {
    const authToken = localStorage.getItem('authToken');
    expect(authToken).toBeDefined();
  });
});

Then('I should be redirected to the dashboard', async function() {
  await waitFor(() => {
    expect(window.location.pathname).toBe('/dashboard');
  });
});

// Error handling steps
Then('I should see an error {string}', async function(errorMessage) {
  await waitFor(() => {
    expect(screen.getByText(errorMessage)).toBeInTheDocument();
  });
});

Then('my account should not be created', async function() {
  const account = await authService.getUser(this.testData.email).catch(() => null);
  expect(account).toBeNull();
});

Then('no duplicate account should be created', async function() {
  const accounts = await authService.getUsersByEmail(this.testData.email);
  expect(accounts.length).toBe(1);
});

// Social login steps
When('I click on {string}', async function(buttonText) {
  const button = await screen.findByRole('button', { name: buttonText });
  await user.click(button);
});

When('I authenticate with Google using valid credentials', async function() {
  // Mock Google OAuth flow
  await authService.authenticateWithGoogle({
    email: 'google.user@example.com',
    name: 'Google User',
    picture: 'https://example.com/avatar.jpg'
  });
});

When('I authenticate with Apple using valid credentials', async function() {
  // Mock Apple OAuth flow
  await authService.authenticateWithApple({
    email: 'apple.user@example.com',
    name: 'Apple User'
  });
});

When('I grant permissions to the application', async function() {
  // Mock permission grant
  this.testData.permissionsGranted = true;
});

When('I choose to share my email', async function() {
  // Mock Apple email sharing
  this.testData.emailShared = true;
});

Then('my account should be created with the Google profile information', async function() {
  const account = await authService.getUser('google.user@example.com');
  expect(account).toBeDefined();
  expect(account.provider).toBe('google');
  expect(account.displayName).toBe('Google User');
});

Then('my account should be created with the Apple profile information', async function() {
  const account = await authService.getUser('apple.user@example.com');
  expect(account).toBeDefined();
  expect(account.provider).toBe('apple');
});

Then('I should be redirected to complete my profile', async function() {
  await waitFor(() => {
    expect(window.location.pathname).toBe('/profile/complete');
  });
});

// Login steps
Given('I have a verified account with email {string} and password {string}', async function(email, password) {
  await authService.createUser({
    email,
    password,
    status: 'verified',
    displayName: 'John Doe'
  });
});

Given('I have an unverified account with email {string}', async function(email) {
  await authService.createUser({
    email,
    password: 'TempPass123!',
    status: 'unverified'
  });
});

When('I submit the login form', async function() {
  const loginButton = await screen.findByRole('button', { name: /sign in|log in/i });
  await user.click(loginButton);
});

When('I check the {string} option', async function(optionName) {
  const checkbox = await screen.findByRole('checkbox', { name: optionName });
  await user.click(checkbox);
});

Then('I should be successfully logged in', async function() {
  await waitFor(() => {
    expect(authService.getCurrentUser()).toBeDefined();
  });
});

Then('I should see my display name in the header', async function() {
  await waitFor(() => {
    expect(screen.getByText(authService.getCurrentUser().displayName)).toBeInTheDocument();
  });
});

Then('a JWT token should be stored securely', function() {
  const token = localStorage.getItem('authToken');
  expect(token).toBeDefined();
  expect(token).toMatch(/^eyJ/); // JWT tokens start with 'eyJ'
});

Then('my session should persist for 30 days', function() {
  const refreshToken = localStorage.getItem('refreshToken');
  const tokenData = JSON.parse(atob(refreshToken.split('.')[1]));
  const expiryDate = new Date(tokenData.exp * 1000);
  const daysDiff = Math.ceil((expiryDate - new Date()) / (1000 * 60 * 60 * 24));
  expect(daysDiff).toBeGreaterThanOrEqual(29);
  expect(daysDiff).toBeLessThanOrEqual(31);
});

Then('a refresh token should be stored securely', function() {
  const refreshToken = localStorage.getItem('refreshToken');
  expect(refreshToken).toBeDefined();
});

Then('I should not be logged in', function() {
  expect(authService.getCurrentUser()).toBeNull();
});

Then('the login attempt should be logged for security', function() {
  const loginAttempts = authService.getLoginAttempts(this.testData.email);
  expect(loginAttempts.length).toBeGreaterThan(0);
  expect(loginAttempts[loginAttempts.length - 1].success).toBe(false);
});