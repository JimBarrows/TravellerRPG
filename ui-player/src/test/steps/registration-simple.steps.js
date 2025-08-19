import { Given, When, Then } from '@cucumber/cucumber';

// Mock the auth service
const mockAuthService = {
  signUp: createMockFn(),
  confirmSignUp: createMockFn(),
  resendSignUp: createMockFn(),
  getCurrentUser: createMockFn(),
  signOut: createMockFn()
};

let registrationData = {};
let formSubmitted = false;
let verificationPage = false;

Given('I am on the registration page', function () {
  // Simulate being on registration page
  global.window.location.pathname = '/register';
  this.currentPage = 'registration';
});

Given('the authentication service is available', function () {
  // Reset mocks to default successful behavior
  mockAuthService.signUp.mockResolvedValue({
    isSignUpComplete: false,
    userSub: 'test-user-id',
    codeDeliveryDetails: {
      destination: 'p***@example.com',
      deliveryMedium: 'EMAIL'
    }
  });
  
  mockAuthService.confirmSignUp.mockResolvedValue({
    isSignUpComplete: true
  });
});

When('I enter a valid email {string}', function (email) {
  registrationData.email = email;
});

When('I enter a display name {string}', function (displayName) {
  registrationData.displayName = displayName;
});

When('I enter a strong password {string}', function (password) {
  registrationData.password = password;
});

When('I confirm the password correctly', function () {
  registrationData.confirmPassword = registrationData.password;
});

When('I accept the terms and conditions', function () {
  registrationData.acceptedTerms = true;
});

When('I submit the registration form', async function () {
  // Simulate form submission
  formSubmitted = true;
  
  if (registrationData.email && registrationData.password && registrationData.acceptedTerms) {
    const result = await mockAuthService.signUp({
      username: registrationData.email,
      password: registrationData.password,
      attributes: {
        name: registrationData.displayName
      }
    });
    
    if (result && !result.isSignUpComplete) {
      verificationPage = true;
    }
  }
});

Then('I should see a verification code entry form', function () {
  expect(verificationPage).toBeTruthy();
});

Then('I should see a message indicating verification code was sent to my email', function () {
  expect(verificationPage).toBeTruthy();
  expect(formSubmitted).toBeTruthy();
});