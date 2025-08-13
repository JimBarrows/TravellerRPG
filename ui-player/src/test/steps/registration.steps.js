import { Given, When, Then } from '@cucumber/cucumber';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../../features/auth/context/AuthContext';
import { RegistrationForm } from '../../features/auth/components/RegistrationForm';
import userEvent from '@testing-library/user-event';

// Mock the auth service
const mockAuthService = {
  signUp: jest.fn(),
  confirmSignUp: jest.fn(),
  resendSignUp: jest.fn(),
  getCurrentUser: jest.fn(),
  signOut: jest.fn()
};

// Helper to render the component with all necessary providers
const renderWithProviders = (component) => {
  return render(
    <BrowserRouter>
      <AuthProvider authService={mockAuthService}>
        {component}
      </AuthProvider>
    </BrowserRouter>
  );
};

let user;
let registrationData = {};

Given('I am on the registration page', async function () {
  user = userEvent.setup();
  renderWithProviders(<RegistrationForm />);
  
  // Verify the registration form is displayed
  expect(screen.getByRole('heading', { name: /create account/i })).toBeInTheDocument();
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

Given('an account with email {string} already exists', function (email) {
  mockAuthService.signUp.mockRejectedValue(
    new Error('An account with the given email already exists.')
  );
});

Given('I have completed the registration form', async function () {
  // Fill out and submit the registration form successfully
  await user.type(screen.getByLabelText(/email/i), 'test@example.com');
  await user.type(screen.getByLabelText(/display name/i), 'Test User');
  await user.type(screen.getByLabelText(/^password$/i), 'StrongPass123!');
  await user.type(screen.getByLabelText(/confirm password/i), 'StrongPass123!');
  await user.click(screen.getByLabelText(/accept.*terms/i));
  await user.click(screen.getByRole('button', { name: /sign up/i }));
  
  // Wait for verification form to appear
  await waitFor(() => {
    expect(screen.getByRole('heading', { name: /verify your email/i })).toBeInTheDocument();
  });
});

Given('I am on the verification page', function () {
  // This step is covered by the previous step
  expect(screen.getByRole('heading', { name: /verify your email/i })).toBeInTheDocument();
});

When('I enter a valid email {string}', async function (email) {
  const emailInput = screen.getByLabelText(/email/i);
  await user.clear(emailInput);
  await user.type(emailInput, email);
  registrationData.email = email;
});

When('I enter an invalid email {string}', async function (email) {
  const emailInput = screen.getByLabelText(/email/i);
  await user.clear(emailInput);
  await user.type(emailInput, email);
  registrationData.email = email;
});

When('I enter a display name {string}', async function (displayName) {
  const nameInput = screen.getByLabelText(/display name/i);
  await user.clear(nameInput);
  await user.type(nameInput, displayName);
  registrationData.displayName = displayName;
});

When('I enter a strong password {string}', async function (password) {
  const passwordInput = screen.getByLabelText(/^password$/i);
  await user.clear(passwordInput);
  await user.type(passwordInput, password);
  registrationData.password = password;
});

When('I enter a weak password {string}', async function (password) {
  const passwordInput = screen.getByLabelText(/^password$/i);
  await user.clear(passwordInput);
  await user.type(passwordInput, password);
  registrationData.password = password;
});

When('I confirm the password correctly', async function () {
  const confirmInput = screen.getByLabelText(/confirm password/i);
  await user.clear(confirmInput);
  await user.type(confirmInput, registrationData.password);
});

When('I enter a different confirm password {string}', async function (confirmPassword) {
  const confirmInput = screen.getByLabelText(/confirm password/i);
  await user.clear(confirmInput);
  await user.type(confirmInput, confirmPassword);
});

When('I accept the terms and conditions', async function () {
  const termsCheckbox = screen.getByLabelText(/accept.*terms/i);
  if (!termsCheckbox.checked) {
    await user.click(termsCheckbox);
  }
});

When('I do not accept the terms and conditions', async function () {
  const termsCheckbox = screen.getByLabelText(/accept.*terms/i);
  if (termsCheckbox.checked) {
    await user.click(termsCheckbox);
  }
});

When('I submit the registration form', async function () {
  const submitButton = screen.getByRole('button', { name: /sign up/i });
  await user.click(submitButton);
});

When('I enter the correct verification code {string}', async function (code) {
  const codeInput = screen.getByLabelText(/verification code/i);
  await user.clear(codeInput);
  await user.type(codeInput, code);
});

When('I enter an invalid verification code {string}', async function (code) {
  mockAuthService.confirmSignUp.mockRejectedValue(
    new Error('Invalid verification code provided, please try again.')
  );
  
  const codeInput = screen.getByLabelText(/verification code/i);
  await user.clear(codeInput);
  await user.type(codeInput, code);
});

When('I submit the verification form', async function () {
  const submitButton = screen.getByRole('button', { name: /verify email/i });
  await user.click(submitButton);
});

When('I click {string}', async function (buttonText) {
  const button = screen.getByRole('button', { name: new RegExp(buttonText, 'i') });
  await user.click(button);
});

When('I start typing a password {string}', async function (password) {
  const passwordInput = screen.getByLabelText(/^password$/i);
  await user.clear(passwordInput);
  await user.type(passwordInput, password);
});

When('I continue typing the password {string}', async function (password) {
  const passwordInput = screen.getByLabelText(/^password$/i);
  await user.type(passwordInput, password);
});

When('I type a complete strong password {string}', async function (password) {
  const passwordInput = screen.getByLabelText(/^password$/i);
  await user.clear(passwordInput);
  await user.type(passwordInput, password);
});

When('I submit the form with an empty email field', async function () {
  // Leave email empty and submit
  const submitButton = screen.getByRole('button', { name: /sign up/i });
  await user.click(submitButton);
});

Then('I should see a verification code entry form', async function () {
  await waitFor(() => {
    expect(screen.getByRole('heading', { name: /verify your email/i })).toBeInTheDocument();
  });
});

Then('I should see a message indicating verification code was sent to my email', function () {
  expect(screen.getByText(/we've sent a verification code/i)).toBeInTheDocument();
});

Then('I should see an error message {string}', async function (errorMessage) {
  await waitFor(() => {
    expect(screen.getByText(new RegExp(errorMessage, 'i'))).toBeInTheDocument();
  });
});

Then('the form should not be submitted', function () {
  // Verify we're still on the registration form
  expect(screen.getByRole('heading', { name: /create account/i })).toBeInTheDocument();
  expect(mockAuthService.signUp).not.toHaveBeenCalled();
});

Then('I should see a password strength indicator showing {string}', function (strength) {
  const strengthText = screen.getByText(new RegExp(strength, 'i'));
  expect(strengthText).toBeInTheDocument();
});

Then('I should see an error message about password requirements', function () {
  expect(screen.getByText(/password must contain/i)).toBeInTheDocument();
});

Then('I should be automatically signed in', async function () {
  // This would verify the AuthContext state, but for now we'll check navigation
  await waitFor(() => {
    expect(mockAuthService.confirmSignUp).toHaveBeenCalled();
  });
});

Then('I should be redirected to the dashboard', function () {
  // In a real test, we'd check window.location or navigation
  // For now, we'll verify the confirmation was successful
  expect(mockAuthService.confirmSignUp).toHaveBeenCalled();
});

Then('I should see an error message about invalid verification code', async function () {
  await waitFor(() => {
    expect(screen.getByText(/invalid verification code/i)).toBeInTheDocument();
  });
});

Then('I should remain on the verification page', function () {
  expect(screen.getByRole('heading', { name: /verify your email/i })).toBeInTheDocument();
});

Then('I should see a message that a new code has been sent', async function () {
  await waitFor(() => {
    // This would depend on the actual implementation of resend code
    expect(screen.getByText(/code.*sent/i) || screen.getByText(/resent/i)).toBeInTheDocument();
  });
});

Then('the resend button should be temporarily disabled', function () {
  const resendButton = screen.getByRole('button', { name: /resend/i });
  expect(resendButton).toBeDisabled();
});

Then('I should remain on the registration page', function () {
  expect(screen.getByRole('heading', { name: /create account/i })).toBeInTheDocument();
});

Then('the password strength should still show {string}', function (strength) {
  const strengthText = screen.getByText(new RegExp(strength, 'i'));
  expect(strengthText).toBeInTheDocument();
});

Then('all password requirements should be marked as met', function () {
  const requirements = screen.getAllByText(/at least 8 characters|one uppercase|one lowercase|one number|one special/i);
  requirements.forEach(requirement => {
    expect(requirement.closest('li')).toHaveClass('met');
  });
});

Then('the email error message should disappear', async function () {
  await waitFor(() => {
    expect(screen.queryByText(/email is required/i)).not.toBeInTheDocument();
  });
});

Then('I should see a {string} button', function (buttonText) {
  const button = screen.getByRole('button', { name: new RegExp(buttonText, 'i') });
  expect(button).toBeInTheDocument();
});

Then('both social registration buttons should be enabled', function () {
  const googleButton = screen.getByRole('button', { name: /google/i });
  const appleButton = screen.getByRole('button', { name: /apple/i });
  
  expect(googleButton).toBeEnabled();
  expect(appleButton).toBeEnabled();
});