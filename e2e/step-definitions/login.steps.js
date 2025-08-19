import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';

// Setup steps
Given('I have a registered and verified user account', async function () {
  // Create a verified user account for testing
  const testUser = this.generateTestUser();
  
  // Register user via API
  const registrationResponse = await this.page.request.post(`${this.config.apiURL}/auth/register`, {
    data: {
      email: testUser.email,
      password: testUser.password,
      firstName: testUser.firstName,
      lastName: testUser.lastName,
      username: testUser.username
    }
  });
  
  expect(registrationResponse.status()).toBe(201);
  const registrationData = await registrationResponse.json();
  
  // Verify user account via API
  const verificationResponse = await this.page.request.post(`${this.config.apiURL}/auth/verify`, {
    data: {
      token: registrationData.verificationToken
    }
  });
  
  expect(verificationResponse.status()).toBe(200);
  
  this.storeTestData('verifiedUser', testUser);
});

// Login page navigation
Given('I am on the login page', async function () {
  await this.navigateTo('/login');
  await this.waitForElement('[data-testid="login-form"]');
});

Given('I am on the login page on mobile', async function () {
  await this.navigateTo('/login');
  await this.waitForElement('[data-testid="login-form"]');
  
  // Verify mobile layout
  const viewport = this.page.viewportSize();
  expect(viewport.width).toBeLessThan(768);
});

// Credential entry
When('I enter valid credentials', async function () {
  const testUser = this.getTestData('verifiedUser');
  
  await this.fillField('[data-testid="login-email"]', testUser.email);
  await this.fillField('[data-testid="login-password"]', testUser.password);
});

When('I enter valid credentials on mobile', async function () {
  const testUser = this.getTestData('verifiedUser');
  
  // Mobile-specific form interaction with scrolling
  await this.page.evaluate(() => document.querySelector('[data-testid="login-email"]')?.scrollIntoView());
  await this.fillField('[data-testid="login-email"]', testUser.email);
  
  await this.page.evaluate(() => document.querySelector('[data-testid="login-password"]')?.scrollIntoView());
  await this.fillField('[data-testid="login-password"]', testUser.password);
});

When('I submit the login form', async function () {
  const loginPromise = this.waitForAPIResponse('auth/login', 'POST');
  
  await this.clickElement('[data-testid="login-button"]');
  
  const response = await loginPromise;
  this.storeTestData('loginResponse', response);
});

When('I submit the login form on mobile', async function () {
  // Ensure button is visible on mobile
  await this.page.evaluate(() => document.querySelector('[data-testid="login-button"]')?.scrollIntoView());
  
  const loginPromise = this.waitForAPIResponse('auth/login', 'POST');
  
  await this.clickElement('[data-testid="login-button"]');
  
  const response = await loginPromise;
  this.storeTestData('loginResponse', response);
});

// Success verification
Then('I should be logged in successfully', async function () {
  const response = this.getTestData('loginResponse');
  expect(response.status()).toBe(200);
  
  // Verify login UI state
  await this.waitForElement('[data-testid="user-menu"]', { timeout: 10000 });
});

Then('I should be logged in successfully on mobile', async function () {
  const response = this.getTestData('loginResponse');
  expect(response.status()).toBe(200);
  
  // Verify mobile login UI state
  await this.waitForElement('[data-testid="mobile-user-menu"]', { timeout: 10000 });
});

Then('I should be redirected to the dashboard', async function () {
  await this.page.waitForURL('**/dashboard**');
  await this.waitForElement('[data-testid="dashboard"]');
});

Then('I should be redirected to the dashboard on mobile', async function () {
  await this.page.waitForURL('**/dashboard**');
  await this.waitForElement('[data-testid="mobile-dashboard"]');
});

Then('my session should be active', async function () {
  // Check for session indicators
  const sessionStatus = await this.page.evaluate(() => {
    return localStorage.getItem('isAuthenticated') === 'true';
  });
  
  expect(sessionStatus).toBe(true);
  
  // Verify JWT token is stored
  const token = await this.page.evaluate(() => {
    return localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
  });
  
  expect(token).toBeTruthy();
  this.storeTestData('authToken', token);
});

// API login steps
Given('I have valid login credentials', async function () {
  const testUser = this.getTestData('verifiedUser') || this.generateTestUser();
  
  this.storeTestData('loginCredentials', {
    email: testUser.email,
    password: testUser.password
  });
});

When('I make a login request to the API', async function () {
  const credentials = this.getTestData('loginCredentials');
  
  const response = await this.page.request.post(`${this.config.apiURL}/auth/login`, {
    data: credentials,
    headers: {
      'Content-Type': 'application/json'
    }
  });
  
  this.storeTestData('apiLoginResponse', response);
});

Then('the API should return a JWT token', async function () {
  const response = this.getTestData('apiLoginResponse');
  expect(response.status()).toBe(200);
  
  const responseData = await response.json();
  expect(responseData).toHaveProperty('token');
  expect(responseData.token).toBeTruthy();
  
  this.storeTestData('jwtToken', responseData.token);
});

Then('the token should be valid', async function () {
  const token = this.getTestData('jwtToken');
  
  // Verify token format (basic JWT structure check)
  const tokenParts = token.split('.');
  expect(tokenParts).toHaveLength(3);
  
  // Verify token with a protected endpoint
  const protectedResponse = await this.page.request.get(`${this.config.apiURL}/user/profile`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  expect(protectedResponse.status()).toBe(200);
});

Then('the token should contain user information', async function () {
  const token = this.getTestData('jwtToken');
  
  // Decode JWT payload (basic decoding for testing)
  const payloadBase64 = token.split('.')[1];
  const payload = JSON.parse(Buffer.from(payloadBase64, 'base64').toString());
  
  expect(payload).toHaveProperty('sub'); // Subject (user ID)
  expect(payload).toHaveProperty('exp'); // Expiration
  expect(payload).toHaveProperty('email');
});

// Security - Failed login attempts
When('I enter invalid credentials', async function () {
  await this.fillField('[data-testid="login-email"]', 'invalid@example.com');
  await this.fillField('[data-testid="login-password"]', 'wrongpassword');
});

Then('I should see an error message', async function () {
  await this.waitForElement('[data-testid="login-error"]');
  const errorMessage = await this.page.textContent('[data-testid="login-error"]');
  expect(errorMessage).toContain('Invalid credentials');
});

Then('I should not be logged in', async function () {
  // Verify we're still on login page
  const currentUrl = this.page.url();
  expect(currentUrl).toContain('/login');
  
  // Verify no session exists
  const sessionStatus = await this.page.evaluate(() => {
    return localStorage.getItem('isAuthenticated');
  });
  
  expect(sessionStatus).toBeFalsy();
});

Then('my session should remain inactive', async function () {
  const token = await this.page.evaluate(() => {
    return localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
  });
  
  expect(token).toBeFalsy();
});

// Account lockout
When('I enter invalid credentials {int} times', async function (attempts) {
  for (let i = 0; i < attempts; i++) {
    await this.fillField('[data-testid="login-email"]', 'test@example.com');
    await this.fillField('[data-testid="login-password"]', 'wrongpassword');
    
    await this.clickElement('[data-testid="login-button"]');
    
    // Wait for response
    await this.page.waitForTimeout(1000);
    
    if (i < attempts - 1) {
      // Clear form for next attempt
      await this.page.fill('[data-testid="login-password"]', '');
    }
  }
});

Then('my account should be temporarily locked', async function () {
  await this.waitForElement('[data-testid="account-locked-message"]');
});

Then('I should see a lockout message', async function () {
  const lockoutMessage = await this.page.textContent('[data-testid="account-locked-message"]');
  expect(lockoutMessage).toContain('locked');
});

Then('valid credentials should not work during lockout', async function () {
  const testUser = this.getTestData('verifiedUser');
  
  await this.fillField('[data-testid="login-email"]', testUser.email);
  await this.fillField('[data-testid="login-password"]', testUser.password);
  
  await this.clickElement('[data-testid="login-button"]');
  
  // Should still see lockout message
  await this.waitForElement('[data-testid="account-locked-message"]');
});

// JWT lifecycle
Given('I have a valid JWT token', async function () {
  // Use token from previous login or create new one
  let token = this.getTestData('jwtToken');
  
  if (!token) {
    const testUser = this.getTestData('verifiedUser');
    const loginResponse = await this.page.request.post(`${this.config.apiURL}/auth/login`, {
      data: {
        email: testUser.email,
        password: testUser.password
      }
    });
    
    const loginData = await loginResponse.json();
    token = loginData.token;
    this.storeTestData('jwtToken', token);
  }
});

When('I make authenticated API requests', async function () {
  const token = this.getTestData('jwtToken');
  
  // Make multiple authenticated requests
  const requests = [
    '/user/profile',
    '/characters',
    '/campaigns'
  ];
  
  const responses = [];
  
  for (const endpoint of requests) {
    const response = await this.page.request.get(`${this.config.apiURL}${endpoint}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    responses.push(response);
  }
  
  this.storeTestData('authenticatedResponses', responses);
});

Then('all requests should be authorized', async function () {
  const responses = this.getTestData('authenticatedResponses');
  
  for (const response of responses) {
    expect(response.status()).not.toBe(401);
    expect(response.status()).not.toBe(403);
  }
});

When('the token expires', async function () {
  // This step would typically wait for actual token expiration
  // For testing, we'll simulate by using an expired token
  const expiredToken = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiYWRtaW4iOnRydWUsImV4cCI6MTYwOTQ2MDgwMH0.invalid';
  this.storeTestData('expiredToken', expiredToken);
});

Then('subsequent requests should be unauthorized', async function () {
  const expiredToken = this.getTestData('expiredToken');
  
  const response = await this.page.request.get(`${this.config.apiURL}/user/profile`, {
    headers: {
      'Authorization': `Bearer ${expiredToken}`
    }
  });
  
  expect(response.status()).toBe(401);
});

Then('I should receive a {int} status code', async function (statusCode) {
  const expiredToken = this.getTestData('expiredToken');
  
  const response = await this.page.request.get(`${this.config.apiURL}/user/profile`, {
    headers: {
      'Authorization': `Bearer ${expiredToken}`
    }
  });
  
  expect(response.status()).toBe(statusCode);
});

// Cross-platform SSO
Given('I am logged in on desktop web', async function () {
  await this.navigateTo('/login');
  
  const testUser = this.getTestData('verifiedUser');
  await this.fillField('[data-testid="login-email"]', testUser.email);
  await this.fillField('[data-testid="login-password"]', testUser.password);
  
  const loginPromise = this.waitForAPIResponse('auth/login', 'POST');
  await this.clickElement('[data-testid="login-button"]');
  
  await loginPromise;
  await this.waitForElement('[data-testid="user-menu"]');
});

When('I access the mobile platform', async function () {
  // Simulate accessing mobile platform (in practice this would be a different device/app)
  // For testing, we verify that session tokens are shared appropriately
  const token = await this.page.evaluate(() => {
    return localStorage.getItem('authToken');
  });
  
  this.storeTestData('sharedToken', token);
});

Then('I should remain logged in on mobile', async function () {
  const sharedToken = this.getTestData('sharedToken');
  expect(sharedToken).toBeTruthy();
  
  // Verify token is still valid
  const response = await this.page.request.get(`${this.config.apiURL}/user/profile`, {
    headers: {
      'Authorization': `Bearer ${sharedToken}`
    }
  });
  
  expect(response.status()).toBe(200);
});

Then('my session should be synchronized', async function () {
  // Verify session state is consistent across platforms
  const sessionData = await this.page.evaluate(() => {
    return {
      isAuthenticated: localStorage.getItem('isAuthenticated'),
      userId: localStorage.getItem('userId'),
      userEmail: localStorage.getItem('userEmail')
    };
  });
  
  expect(sessionData.isAuthenticated).toBe('true');
  expect(sessionData.userId).toBeTruthy();
  expect(sessionData.userEmail).toBeTruthy();
});

// Remember me functionality
When('I check "Remember me"', async function () {
  await this.clickElement('[data-testid="remember-me-checkbox"]');
});

When('I close and reopen the browser', async function () {
  // Store current session data
  const sessionData = await this.page.evaluate(() => {
    return {
      token: localStorage.getItem('authToken'),
      isAuthenticated: localStorage.getItem('isAuthenticated')
    };
  });
  
  this.storeTestData('sessionBeforeClose', sessionData);
  
  // Close and reopen context (simulating browser restart)
  await this.context.close();
  
  const browser = this.browser;
  const newContext = await browser.newContext({
    baseURL: this.config.baseURL
  });
  
  this.context = newContext;
  this.page = await newContext.newPage();
});

Then('I should still be logged in', async function () {
  await this.navigateTo('/dashboard');
  
  // Should be able to access dashboard without login
  await this.waitForElement('[data-testid="dashboard"]', { timeout: 5000 });
});

Then('my session should persist', async function () {
  // Verify persistent session data exists
  const currentSessionData = await this.page.evaluate(() => {
    return {
      token: localStorage.getItem('authToken'),
      isAuthenticated: localStorage.getItem('isAuthenticated')
    };
  });
  
  expect(currentSessionData.isAuthenticated).toBe('true');
  expect(currentSessionData.token).toBeTruthy();
});

// Logout functionality
Given('I am logged in', async function () {
  const testUser = this.getTestData('verifiedUser');
  
  await this.navigateTo('/login');
  await this.fillField('[data-testid="login-email"]', testUser.email);
  await this.fillField('[data-testid="login-password"]', testUser.password);
  
  const loginPromise = this.waitForAPIResponse('auth/login', 'POST');
  await this.clickElement('[data-testid="login-button"]');
  
  await loginPromise;
  await this.waitForElement('[data-testid="user-menu"]');
});

When('I click the logout button', async function () {
  await this.clickElement('[data-testid="user-menu"]');
  await this.waitForElement('[data-testid="logout-button"]');
  
  const logoutPromise = this.waitForAPIResponse('auth/logout', 'POST');
  await this.clickElement('[data-testid="logout-button"]');
  
  try {
    await logoutPromise;
  } catch (error) {
    // Logout might not always call API, that's acceptable
  }
});

Then('I should be logged out', async function () {
  // Verify session is cleared
  const sessionStatus = await this.page.evaluate(() => {
    return localStorage.getItem('isAuthenticated');
  });
  
  expect(sessionStatus).toBeFalsy();
});

Then('my session should be terminated', async function () {
  const token = await this.page.evaluate(() => {
    return localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
  });
  
  expect(token).toBeFalsy();
});

Then('I should be redirected to the login page', async function () {
  await this.page.waitForURL('**/login**');
  await this.waitForElement('[data-testid="login-form"]');
});

Then('my JWT token should be invalidated', async function () {
  const oldToken = this.getTestData('jwtToken');
  
  if (oldToken) {
    // Try to use the old token
    const response = await this.page.request.get(`${this.config.apiURL}/user/profile`, {
      headers: {
        'Authorization': `Bearer ${oldToken}`
      }
    });
    
    // Should be unauthorized
    expect(response.status()).toBe(401);
  }
});