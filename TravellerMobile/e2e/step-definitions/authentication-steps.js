const { Given, When, Then } = require('@cucumber/cucumber');
const { element, by, expect, waitFor } = require('detox');
const DetoxHelper = require('../support/detox-helper');

// Background steps
Given('the app is launched', async function () {
  await device.launchApp({ newInstance: true });
  await DetoxHelper.waitForElement('welcome-screen', 15000);
});

Given('I am on the welcome screen', async function () {
  await DetoxHelper.expectElementVisible('welcome-screen');
  await DetoxHelper.expectTextVisible('Welcome to Traveller RPG');
});

// Authentication form steps
Given('I see the login form', async function () {
  await DetoxHelper.tapElementByText('Login');
  await DetoxHelper.waitForElement('login-form');
  await DetoxHelper.expectElementVisible('username-input');
  await DetoxHelper.expectElementVisible('password-input');
  await DetoxHelper.expectElementVisible('login-button');
});

When('I enter valid credentials', async function (dataTable) {
  const credentials = dataTable.hashes()[0];
  await DetoxHelper.clearAndType('username-input', credentials.username);
  await DetoxHelper.clearAndType('password-input', credentials.password);
});

When('I enter invalid credentials', async function (dataTable) {
  const credentials = dataTable.hashes()[0];
  await DetoxHelper.clearAndType('username-input', credentials.username);
  await DetoxHelper.clearAndType('password-input', credentials.password);
});

When('I tap the login button', async function () {
  await DetoxHelper.tapElement('login-button');
});

// Success scenarios
Then('I should see the main dashboard', async function () {
  await DetoxHelper.waitForElement('main-dashboard', 15000);
  await DetoxHelper.expectElementVisible('main-dashboard');
});

Then('I should see my player profile', async function () {
  await DetoxHelper.expectElementVisible('player-profile');
  await DetoxHelper.expectElementVisible('player-avatar');
});

Then('the authentication token should be stored', async function () {
  // This would check AsyncStorage or secure storage in a real implementation
  // For testing purposes, we verify that the user is considered logged in
  await DetoxHelper.expectElementVisible('logout-button');
});

// Failure scenarios
Then('I should see an error message {string}', async function (errorMessage) {
  await DetoxHelper.waitForText(errorMessage);
  await DetoxHelper.expectTextVisible(errorMessage);
});

Then('I should remain on the login screen', async function () {
  await DetoxHelper.expectElementVisible('login-form');
  await DetoxHelper.expectElementVisible('login-button');
});

Then('no authentication token should be stored', async function () {
  await DetoxHelper.expectElementNotVisible('logout-button');
  await DetoxHelper.expectElementVisible('login-button');
});

// Registration steps
When('I tap {string}', async function (buttonText) {
  await DetoxHelper.tapElementByText(buttonText);
});

When('I fill in the registration form', async function (dataTable) {
  const formData = dataTable.hashes()[0];
  await DetoxHelper.clearAndType('email-input', formData.email);
  await DetoxHelper.clearAndType('password-input', formData.password);
  await DetoxHelper.clearAndType('confirm-password-input', formData.confirm);
  await DetoxHelper.clearAndType('username-input', formData.username);
});

Then('I should see {string}', async function (message) {
  await DetoxHelper.waitForText(message);
  await DetoxHelper.expectTextVisible(message);
});

Then('I should see the verification screen', async function () {
  await DetoxHelper.waitForElement('verification-screen');
  await DetoxHelper.expectElementVisible('verification-code-input');
  await DetoxHelper.expectElementVisible('verify-button');
});

// Verification steps
Given('I have completed registration', async function () {
  await DetoxHelper.tapElementByText('Create Account');
  await this.attach('Registration completed in previous test');
});

Given('I am on the verification screen', async function () {
  await DetoxHelper.expectElementVisible('verification-screen');
});

When('I receive a verification code', async function () {
  // In testing, we simulate receiving a code
  this.setTestData('verificationCode', '123456');
});

When('I enter the verification code {string}', async function (code) {
  await DetoxHelper.clearAndType('verification-code-input', code);
});

When('I tap {string}', async function (buttonText) {
  await DetoxHelper.tapElementByText(buttonText);
});

Then('I should be logged in automatically', async function () {
  await DetoxHelper.waitForElement('main-dashboard', 10000);
  await DetoxHelper.expectElementVisible('main-dashboard');
});

// Biometric authentication steps
Given('I am logged in', async function () {
  // Quick login for test scenarios
  await DetoxHelper.tapElementByText('Login');
  await DetoxHelper.clearAndType('username-input', 'test@example.com');
  await DetoxHelper.clearAndType('password-input', 'TestPass123!');
  await DetoxHelper.tapElement('login-button');
  await DetoxHelper.waitForElement('main-dashboard');
});

Given('I am on the security settings screen', async function () {
  await DetoxHelper.tapElement('profile-tab');
  await DetoxHelper.tapElementByText('Security Settings');
  await DetoxHelper.waitForElement('security-settings');
});

When('I toggle {string}', async function (toggleName) {
  await DetoxHelper.tapElement('biometric-toggle');
});

When('I provide my biometric data', async function () {
  // Simulate biometric authentication success in test environment
  await DetoxHelper.waitForText('Touch ID');
  await DetoxHelper.tapElementByText('Use Touch ID');
});

Then('biometric authentication should be enabled', async function () {
  await DetoxHelper.expectElementVisible('biometric-enabled-indicator');
});

// Biometric login steps
Given('biometric authentication is enabled', async function () {
  this.setTestData('biometricEnabled', true);
});

Given('I have logged out', async function () {
  await DetoxHelper.tapElement('profile-menu');
  await DetoxHelper.tapElementByText('Logout');
  await DetoxHelper.tapElementByText('Confirm');
  await DetoxHelper.waitForElement('welcome-screen');
});

Given('I am on the login screen', async function () {
  await DetoxHelper.expectElementVisible('login-form');
});

When('I tap {string}', async function (buttonText) {
  await DetoxHelper.tapElementByText(buttonText);
});

When('I provide valid biometric authentication', async function () {
  // Simulate successful biometric verification
  await DetoxHelper.waitForText('Touch ID');
  // In real app, this would trigger biometric prompt
  // For testing, we simulate success
  await device.shake(); // Simulate biometric success
});

Then('I should be logged in successfully', async function () {
  await DetoxHelper.waitForElement('main-dashboard', 10000);
  await DetoxHelper.expectElementVisible('main-dashboard');
});

// Logout steps
When('I navigate to the profile menu', async function () {
  await DetoxHelper.tapElement('profile-tab');
  await DetoxHelper.tapElement('profile-menu');
});

When('I confirm the logout', async function () {
  await DetoxHelper.tapElementByText('Confirm');
});

Then('I should be logged out', async function () {
  await DetoxHelper.waitForElement('welcome-screen');
  await DetoxHelper.expectElementVisible('welcome-screen');
});

Then('the authentication token should be cleared', async function () {
  // Verify no authenticated state indicators remain
  await DetoxHelper.expectElementNotVisible('profile-menu');
});

Then('I should see the welcome screen', async function () {
  await DetoxHelper.expectElementVisible('welcome-screen');
  await DetoxHelper.expectTextVisible('Welcome to Traveller RPG');
});
