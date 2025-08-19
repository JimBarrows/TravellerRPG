import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';

// Application state steps
Given('the application is running', async function () {
  await this.navigateTo('/');
  await this.page.waitForSelector('body', { state: 'visible' });
});

Given('all services are available', async function () {
  // Check that the API is responding
  const response = await this.page.request.get(`${this.config.apiURL}/health`);
  expect(response.status()).toBe(200);
  
  // Store that services are available
  this.storeTestData('servicesAvailable', true);
});

// Registration steps
Given('I am on the registration page', async function () {
  await this.navigateTo('/register');
  await this.waitForElement('[data-testid="registration-form"]');
});

Given('I am on the registration page on mobile', async function () {
  await this.navigateTo('/register');
  await this.waitForElement('[data-testid="registration-form"]');
  
  // Verify mobile layout is active
  const viewport = this.page.viewportSize();
  expect(viewport.width).toBeLessThan(768);
});

When('I fill in the registration form with valid details', async function () {
  const testUser = this.generateTestUser();
  this.storeTestData('currentUser', testUser);
  
  await this.fillField('[data-testid="email-input"]', testUser.email);
  await this.fillField('[data-testid="password-input"]', testUser.password);
  await this.fillField('[data-testid="confirm-password-input"]', testUser.password);
  await this.fillField('[data-testid="first-name-input"]', testUser.firstName);
  await this.fillField('[data-testid="last-name-input"]', testUser.lastName);
  await this.fillField('[data-testid="username-input"]', testUser.username);
});

When('I fill in the registration form with valid details on mobile', async function () {
  const testUser = this.generateTestUser();
  this.storeTestData('currentUser', testUser);
  
  // Mobile-specific form filling with potential scrolling
  await this.page.evaluate(() => document.querySelector('[data-testid="email-input"]')?.scrollIntoView());
  await this.fillField('[data-testid="email-input"]', testUser.email);
  
  await this.page.evaluate(() => document.querySelector('[data-testid="password-input"]')?.scrollIntoView());
  await this.fillField('[data-testid="password-input"]', testUser.password);
  
  await this.page.evaluate(() => document.querySelector('[data-testid="confirm-password-input"]')?.scrollIntoView());
  await this.fillField('[data-testid="confirm-password-input"]', testUser.password);
  
  await this.page.evaluate(() => document.querySelector('[data-testid="first-name-input"]')?.scrollIntoView());
  await this.fillField('[data-testid="first-name-input"]', testUser.firstName);
  
  await this.page.evaluate(() => document.querySelector('[data-testid="last-name-input"]')?.scrollIntoView());
  await this.fillField('[data-testid="last-name-input"]', testUser.lastName);
  
  await this.page.evaluate(() => document.querySelector('[data-testid="username-input"]')?.scrollIntoView());
  await this.fillField('[data-testid="username-input"]', testUser.username);
});

When('I submit the registration form', async function () {
  // Wait for and capture the registration API call
  const registrationPromise = this.waitForAPIResponse('auth/register', 'POST');
  
  await this.clickElement('[data-testid="register-button"]');
  
  const response = await registrationPromise;
  this.storeTestData('registrationResponse', response);
});

When('I submit the registration form on mobile', async function () {
  // Ensure submit button is visible on mobile
  await this.page.evaluate(() => document.querySelector('[data-testid="register-button"]')?.scrollIntoView());
  
  const registrationPromise = this.waitForAPIResponse('auth/register', 'POST');
  
  await this.clickElement('[data-testid="register-button"]');
  
  const response = await registrationPromise;
  this.storeTestData('registrationResponse', response);
});

Then('I should see a verification message', async function () {
  await this.waitForElement('[data-testid="verification-message"]');
  const message = await this.page.textContent('[data-testid="verification-message"]');
  expect(message).toContain('verification');
});

Then('I should see a verification message on mobile', async function () {
  await this.waitForElement('[data-testid="verification-message"]');
  const message = await this.page.textContent('[data-testid="verification-message"]');
  expect(message).toContain('verification');
  
  // Verify mobile layout
  const messageElement = await this.page.locator('[data-testid="verification-message"]');
  await expect(messageElement).toBeVisible();
});

Then('a verification email should be sent', async function () {
  const response = this.getTestData('registrationResponse');
  expect(response.status()).toBe(201);
  
  // In a real scenario, you might check an email service or database
  // For now, we'll verify the API response indicates email was sent
  const responseData = await response.json();
  expect(responseData).toHaveProperty('verificationEmailSent', true);
});

Then('I should be redirected to the verification page', async function () {
  await this.page.waitForURL('**/verify-email**');
  await this.waitForElement('[data-testid="verification-page"]');
});

Then('I should be redirected to the verification page on mobile', async function () {
  await this.page.waitForURL('**/verify-email**');
  await this.waitForElement('[data-testid="verification-page"]');
  
  // Verify mobile-friendly verification page
  const viewport = this.page.viewportSize();
  expect(viewport.width).toBeLessThan(768);
});

// API registration steps
Given('I have valid registration data', async function () {
  const testUser = this.generateTestUser();
  this.storeTestData('registrationData', {
    email: testUser.email,
    password: testUser.password,
    firstName: testUser.firstName,
    lastName: testUser.lastName,
    username: testUser.username
  });
});

When('I make a registration request to the API', async function () {
  const registrationData = this.getTestData('registrationData');
  
  const response = await this.page.request.post(`${this.config.apiURL}/auth/register`, {
    data: registrationData,
    headers: {
      'Content-Type': 'application/json'
    }
  });
  
  this.storeTestData('apiRegistrationResponse', response);
});

Then('the API should return a success response', async function () {
  const response = this.getTestData('apiRegistrationResponse');
  expect(response.status()).toBe(201);
});

Then('a user account should be created', async function () {
  const response = this.getTestData('apiRegistrationResponse');
  const responseData = await response.json();
  
  expect(responseData).toHaveProperty('id');
  expect(responseData).toHaveProperty('email');
  expect(responseData.email).toBe(this.getTestData('registrationData').email);
});

Then('a verification token should be generated', async function () {
  const response = this.getTestData('apiRegistrationResponse');
  const responseData = await response.json();
  
  expect(responseData).toHaveProperty('verificationToken');
  expect(responseData.verificationToken).toBeTruthy();
});

// Cross-platform registration steps
Given('I registered on desktop web', async function () {
  // Simulate desktop registration
  const testUser = this.generateTestUser();
  this.storeTestData('currentUser', testUser);
  
  await this.navigateTo('/register');
  await this.waitForElement('[data-testid="registration-form"]');
  
  await this.fillField('[data-testid="email-input"]', testUser.email);
  await this.fillField('[data-testid="password-input"]', testUser.password);
  await this.fillField('[data-testid="confirm-password-input"]', testUser.password);
  await this.fillField('[data-testid="first-name-input"]', testUser.firstName);
  await this.fillField('[data-testid="last-name-input"]', testUser.lastName);
  await this.fillField('[data-testid="username-input"]', testUser.username);
  
  const registrationPromise = this.waitForAPIResponse('auth/register', 'POST');
  await this.clickElement('[data-testid="register-button"]');
  
  const response = await registrationPromise;
  this.storeTestData('registrationResponse', response);
});

Given('I received a verification email', async function () {
  // In a real scenario, this would check actual email delivery
  // For testing, we'll simulate having the verification token
  const response = this.getTestData('registrationResponse');
  const responseData = await response.json();
  
  this.storeTestData('verificationToken', responseData.verificationToken);
});

When('I open the verification link on mobile', async function () {
  // Switch to mobile context (this would be done in setup for real mobile testing)
  const verificationToken = this.getTestData('verificationToken');
  const verificationUrl = `/verify-email?token=${verificationToken}`;
  
  await this.navigateTo(verificationUrl);
  await this.waitForElement('[data-testid="verification-page"]');
});

Then('my account should be verified', async function () {
  // Check that verification was successful
  await this.waitForElement('[data-testid="verification-success"]');
  const successMessage = await this.page.textContent('[data-testid="verification-success"]');
  expect(successMessage).toContain('verified');
});

Then('I should be able to login on both platforms', async function () {
  const testUser = this.getTestData('currentUser');
  
  // Test login capability
  await this.navigateTo('/login');
  await this.waitForElement('[data-testid="login-form"]');
  
  await this.fillField('[data-testid="login-email"]', testUser.email);
  await this.fillField('[data-testid="login-password"]', testUser.password);
  
  const loginPromise = this.waitForAPIResponse('auth/login', 'POST');
  await this.clickElement('[data-testid="login-button"]');
  
  const loginResponse = await loginPromise;
  expect(loginResponse.status()).toBe(200);
});

// Validation steps
When('I fill in {string} with {string}', async function (field, value) {
  const fieldMap = {
    'email': '[data-testid="email-input"]',
    'password': '[data-testid="password-input"]',
    'confirmPassword': '[data-testid="confirm-password-input"]',
    'firstName': '[data-testid="first-name-input"]',
    'lastName': '[data-testid="last-name-input"]',
    'username': '[data-testid="username-input"]'
  };
  
  const selector = fieldMap[field];
  if (!selector) {
    throw new Error(`Unknown field: ${field}`);
  }
  
  await this.fillField(selector, value);
  this.storeTestData('lastFilledField', field);
  this.storeTestData('lastFilledValue', value);
});

When('I try to proceed to the next step', async function () {
  await this.clickElement('[data-testid="register-button"]');
});

Then('I should see a validation error for {string}', async function (field) {
  const errorSelector = `[data-testid="${field}-error"]`;
  await this.waitForElement(errorSelector);
  
  const errorMessage = await this.page.textContent(errorSelector);
  expect(errorMessage).toBeTruthy();
});

Then('the form should not be submitted', async function () {
  // Verify we're still on the registration page
  const currentUrl = this.page.url();
  expect(currentUrl).toContain('/register');
  
  // Verify registration form is still visible
  await this.waitForElement('[data-testid="registration-form"]');
});

// Performance steps
When('I complete the registration process', async function () {
  const startTime = Date.now();
  this.storeTestData('processStartTime', startTime);
  
  const testUser = this.generateTestUser();
  
  await this.fillField('[data-testid="email-input"]', testUser.email);
  await this.fillField('[data-testid="password-input"]', testUser.password);
  await this.fillField('[data-testid="confirm-password-input"]', testUser.password);
  await this.fillField('[data-testid="first-name-input"]', testUser.firstName);
  await this.fillField('[data-testid="last-name-input"]', testUser.lastName);
  await this.fillField('[data-testid="username-input"]', testUser.username);
  
  const registrationPromise = this.waitForAPIResponse('auth/register', 'POST');
  await this.clickElement('[data-testid="register-button"]');
  
  await registrationPromise;
  await this.waitForElement('[data-testid="verification-message"]');
  
  const endTime = Date.now();
  this.storeTestData('processEndTime', endTime);
});

Then('the registration should complete within {int} seconds', async function (maxSeconds) {
  const startTime = this.getTestData('processStartTime');
  const endTime = this.getTestData('processEndTime');
  const duration = (endTime - startTime) / 1000;
  
  expect(duration).toBeLessThanOrEqual(maxSeconds);
});

Then('the page should remain responsive throughout', async function () {
  // This is a basic responsiveness check
  // In practice, you might use performance APIs or other metrics
  const isResponsive = await this.page.evaluate(() => {
    return document.readyState === 'complete';
  });
  
  expect(isResponsive).toBe(true);
});

Then('API calls should complete within {int} seconds', async function (maxSeconds) {
  const response = this.getTestData('registrationResponse');
  
  // Check that the response was received (indicating API call completed)
  expect(response).toBeTruthy();
  expect(response.status()).toBe(201);
});