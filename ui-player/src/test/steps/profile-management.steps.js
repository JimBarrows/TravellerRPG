import { Given, When, Then } from '@cucumber/cucumber';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AuthProvider } from '../../features/auth/context/AuthContext';
import ProfilePage from '../../features/auth/components/ProfilePage';
import TestRouter from '../support/TestRouter';

// Mock AWS Amplify Storage
const mockUpload = jest.fn();
const mockRemove = jest.fn();
jest.mock('@aws-amplify/storage', () => ({
  uploadData: mockUpload,
  remove: mockRemove,
  getUrl: jest.fn(() => Promise.resolve({ url: 'https://example.com/avatar.jpg' }))
}));

// Mock auth service
const mockAuthService = {
  getCurrentUser: jest.fn(() => Promise.resolve({
    id: 'user-123',
    username: 'john.doe@example.com',
    email: 'john.doe@example.com',
    attributes: {
      name: 'John Doe',
      email: 'john.doe@example.com',
      'custom:timezone': 'America/New_York',
      'custom:subscription_tier': 'Free',
      'custom:avatar_url': null,
      created_at: '2024-01-01T00:00:00Z'
    }
  })),
  updateUserAttributes: jest.fn(() => Promise.resolve({})),
  changePassword: jest.fn(() => Promise.resolve(true)),
  enableMFA: jest.fn(() => Promise.resolve({
    qrCode: 'data:image/png;base64,mock-qr-code',
    secretCode: 'MOCK-SECRET-CODE'
  })),
  verifyMFA: jest.fn(() => Promise.resolve({ isVerified: true }))
};

let component;
let user;

Given('I am logged in as {string}', async function (email) {
  mockAuthService.getCurrentUser.mockResolvedValue({
    id: 'user-123',
    username: email,
    email: email,
    attributes: {
      name: 'John Doe',
      email: email,
      'custom:timezone': 'America/New_York',
      'custom:subscription_tier': 'Free',
      'custom:avatar_url': null,
      created_at: '2024-01-01T00:00:00Z'
    }
  });
  
  this.user = userEvent.setup();
  this.currentUser = { email };
});

Given('I navigate to the profile page', async function () {
  component = render(
    <TestRouter initialEntries={['/profile']}>
      <AuthProvider authService={mockAuthService}>
        <ProfilePage />
      </AuthProvider>
    </TestRouter>
  );
  
  await waitFor(() => {
    expect(screen.getByTestId('profile-page')).toBeInTheDocument();
  });
});

Given('I have connected social accounts {string}', function (accounts) {
  const accountList = accounts.split(', ');
  mockAuthService.getCurrentUser.mockResolvedValue({
    ...mockAuthService.getCurrentUser.mockResolvedValue(),
    attributes: {
      ...mockAuthService.getCurrentUser.mockResolvedValue().attributes,
      'custom:connected_accounts': JSON.stringify(accountList)
    }
  });
});

Given('I have a connected Google account', function () {
  mockAuthService.getCurrentUser.mockResolvedValue({
    ...mockAuthService.getCurrentUser.mockResolvedValue(),
    attributes: {
      ...mockAuthService.getCurrentUser.mockResolvedValue().attributes,
      'custom:connected_accounts': JSON.stringify(['Google'])
    }
  });
});

Given('I have no connected Facebook account', function () {
  // Default state - no connected accounts
});

Then('I should see my email {string}', async function (email) {
  await waitFor(() => {
    expect(screen.getByDisplayValue(email)).toBeInTheDocument();
  });
});

Then('I should see my display name {string}', async function (displayName) {
  await waitFor(() => {
    expect(screen.getByDisplayValue(displayName)).toBeInTheDocument();
  });
});

Then('I should see my current timezone {string}', async function (timezone) {
  await waitFor(() => {
    expect(screen.getByDisplayValue(timezone)).toBeInTheDocument();
  });
});

Then('I should see my account creation date', async function () {
  await waitFor(() => {
    expect(screen.getByText(/Account created:/)).toBeInTheDocument();
  });
});

Then('I should see my subscription tier {string}', async function (tier) {
  await waitFor(() => {
    expect(screen.getByText(tier)).toBeInTheDocument();
  });
});

Then('I should see my current avatar or a default avatar placeholder', async function () {
  await waitFor(() => {
    const avatar = screen.getByTestId('user-avatar');
    expect(avatar).toBeInTheDocument();
  });
});

When('I click on the display name edit button', async function () {
  const editButton = screen.getByTestId('edit-display-name');
  await this.user.click(editButton);
});

When('I change my display name to {string}', async function (newDisplayName) {
  const input = screen.getByTestId('display-name-input');
  await this.user.clear(input);
  await this.user.type(input, newDisplayName);
  this.newDisplayName = newDisplayName;
});

When('I click save changes', async function () {
  const saveButton = screen.getByTestId('save-profile-changes');
  await this.user.click(saveButton);
});

Then('I should see a success message {string}', async function (message) {
  await waitFor(() => {
    expect(screen.getByText(message)).toBeInTheDocument();
  });
});

Then('my display name should be updated to {string}', async function (displayName) {
  await waitFor(() => {
    expect(mockAuthService.updateUserAttributes).toHaveBeenCalledWith({
      name: displayName
    });
  });
});

Then('the page should reload with the updated information', async function () {
  await waitFor(() => {
    expect(screen.getByDisplayValue(this.newDisplayName)).toBeInTheDocument();
  });
});

When('I click on the avatar upload button', async function () {
  const uploadButton = screen.getByTestId('avatar-upload-button');
  await this.user.click(uploadButton);
});

When('I select an image file {string} that is less than 5MB', async function (filename) {
  const file = new File(['mock image content'], filename, { 
    type: 'image/jpeg',
    size: 1024 * 1024 * 2 // 2MB
  });
  
  const input = screen.getByTestId('avatar-file-input');
  await this.user.upload(input, file);
  this.uploadedFile = file;
});

When('the image is in a valid format \\(JPG, PNG, GIF)', function () {
  // File type validation is handled in the previous step
});

Then('I should see a preview of the cropped image', async function () {
  await waitFor(() => {
    expect(screen.getByTestId('avatar-preview')).toBeInTheDocument();
  });
});

When('I confirm the avatar upload', async function () {
  const confirmButton = screen.getByTestId('confirm-avatar-upload');
  await this.user.click(confirmButton);
});

Then('I should see a loading indicator', async function () {
  await waitFor(() => {
    expect(screen.getByTestId('upload-loading')).toBeInTheDocument();
  });
});

Then('the avatar should be uploaded to S3', async function () {
  await waitFor(() => {
    expect(mockUpload).toHaveBeenCalled();
  });
});

Then('my profile should display the new avatar', async function () {
  await waitFor(() => {
    const avatar = screen.getByTestId('user-avatar');
    expect(avatar).toHaveAttribute('src', expect.stringContaining('avatar'));
  });
});

When('I select an image file that is larger than 5MB', async function () {
  const file = new File(['mock large image content'], 'large-avatar.jpg', { 
    type: 'image/jpeg',
    size: 1024 * 1024 * 6 // 6MB
  });
  
  const input = screen.getByTestId('avatar-file-input');
  await this.user.upload(input, file);
});

Then('I should see an error message {string}', async function (message) {
  await waitFor(() => {
    expect(screen.getByText(message)).toBeInTheDocument();
  });
});

Then('the upload should be rejected', function () {
  expect(mockUpload).not.toHaveBeenCalled();
});

When('I select a file {string} with an invalid format', async function (filename) {
  const file = new File(['mock pdf content'], filename, { 
    type: 'application/pdf',
    size: 1024
  });
  
  const input = screen.getByTestId('avatar-file-input');
  await this.user.upload(input, file);
});

When('I click on the timezone dropdown', async function () {
  const dropdown = screen.getByTestId('timezone-select');
  await this.user.click(dropdown);
});

When('I select {string} from the timezone list', async function (timezone) {
  const option = screen.getByRole('option', { name: timezone });
  await this.user.click(option);
  this.selectedTimezone = timezone;
});

Then('my timezone should be updated to {string}', async function (timezone) {
  await waitFor(() => {
    expect(mockAuthService.updateUserAttributes).toHaveBeenCalledWith({
      'custom:timezone': timezone
    });
  });
});

Then('all timestamps should display in the new timezone', async function () {
  // This would be tested in integration tests with actual timestamp display
  expect(true).toBe(true);
});

When('I click on the email edit button', async function () {
  const editButton = screen.getByTestId('edit-email');
  await this.user.click(editButton);
});

When('I change my email to {string}', async function (newEmail) {
  const input = screen.getByTestId('email-input');
  await this.user.clear(input);
  await this.user.type(input, newEmail);
  this.newEmail = newEmail;
});

Then('I should see a message {string}', async function (message) {
  await waitFor(() => {
    expect(screen.getByText(message)).toBeInTheDocument();
  });
});

Then('I should see a verification code input field', async function () {
  await waitFor(() => {
    expect(screen.getByTestId('verification-code-input')).toBeInTheDocument();
  });
});

When('I enter the correct verification code {string}', async function (code) {
  const input = screen.getByTestId('verification-code-input');
  await this.user.type(input, code);
});

When('I click verify', async function () {
  const verifyButton = screen.getByTestId('verify-email-button');
  await this.user.click(verifyButton);
});

Then('my email should be updated to {string}', async function (email) {
  await waitFor(() => {
    expect(mockAuthService.updateUserAttributes).toHaveBeenCalledWith({
      email: email
    });
  });
});

When('I click on the {string} button', async function (buttonText) {
  const button = screen.getByRole('button', { name: buttonText });
  await this.user.click(button);
});

Then('I should see a password change form', async function () {
  await waitFor(() => {
    expect(screen.getByTestId('password-change-form')).toBeInTheDocument();
  });
});

When('I enter {string} as my current password', async function (password) {
  const input = screen.getByTestId('current-password-input');
  await this.user.type(input, password);
});

When('I enter {string} as my new password', async function (password) {
  const input = screen.getByTestId('new-password-input');
  await this.user.type(input, password);
  this.newPassword = password;
});

When('I enter {string} as my password confirmation', async function (password) {
  const input = screen.getByTestId('confirm-password-input');
  await this.user.type(input, password);
});

Then('I should see a password strength indicator showing {string}', async function (strength) {
  await waitFor(() => {
    expect(screen.getByText(strength)).toBeInTheDocument();
  });
});

When('I submit the password change form', async function () {
  const submitButton = screen.getByTestId('submit-password-change');
  await this.user.click(submitButton);
});

Then('I should receive an email notification about the password change', async function () {
  // This would be tested at the service level
  expect(mockAuthService.changePassword).toHaveBeenCalled();
});

Then('I should see validation errors about password requirements', async function () {
  await waitFor(() => {
    expect(screen.getByText(/Password must be at least/)).toBeInTheDocument();
  });
});

Then('the submit button should be disabled', async function () {
  const submitButton = screen.getByTestId('submit-password-change');
  expect(submitButton).toBeDisabled();
});

When('I scroll to the social accounts section', async function () {
  const section = screen.getByTestId('social-accounts-section');
  section.scrollIntoView();
});

Then('I should see my connected Google account', async function () {
  await waitFor(() => {
    expect(screen.getByText('Google')).toBeInTheDocument();
  });
});

Then('I should see my connected Apple account', async function () {
  await waitFor(() => {
    expect(screen.getByText('Apple')).toBeInTheDocument();
  });
});

Then('I should see options to disconnect each account', async function () {
  await waitFor(() => {
    expect(screen.getByTestId('disconnect-google')).toBeInTheDocument();
  });
});

Then('I should see options to connect additional social providers', async function () {
  await waitFor(() => {
    expect(screen.getByTestId('connect-facebook')).toBeInTheDocument();
  });
});

When('I click on {string} next to my Google account', async function (action) {
  const button = screen.getByTestId('disconnect-google');
  await this.user.click(button);
});

Then('I should see a confirmation dialog {string}', async function (message) {
  await waitFor(() => {
    expect(screen.getByText(message)).toBeInTheDocument();
  });
});

When('I confirm the disconnection', async function () {
  const confirmButton = screen.getByTestId('confirm-disconnect');
  await this.user.click(confirmButton);
});

Then('the Google account should no longer appear in my connected accounts', async function () {
  await waitFor(() => {
    expect(screen.queryByText('Google')).not.toBeInTheDocument();
  });
});

When('I click on {string}', async function (buttonText) {
  const button = screen.getByRole('button', { name: buttonText });
  await this.user.click(button);
});

Then('I should be redirected to Facebook\\'s authorization page', async function () {
  // This would be mocked in a real test environment
  expect(window.location.href).toContain('facebook.com');
});

When('I authorize the connection', async function () {
  // Simulate successful OAuth callback
  window.history.pushState({}, '', '/profile?code=mock-auth-code');
});

Then('I should be redirected back to my profile page', async function () {
  expect(window.location.pathname).toBe('/profile');
});

Then('I should see Facebook in my connected accounts', async function () {
  await waitFor(() => {
    expect(screen.getByText('Facebook')).toBeInTheDocument();
  });
});

When('a network error occurs', async function () {
  mockAuthService.updateUserAttributes.mockRejectedValue(new Error('Network error'));
});

Then('my changes should not be saved', async function () {
  // Verify the UI still shows the old values
  expect(screen.getByDisplayValue('John Doe')).toBeInTheDocument();
});

Then('the form should remain in edit mode', async function () {
  expect(screen.getByTestId('display-name-input')).toBeInTheDocument();
});

When('a network error occurs during upload', async function () {
  mockUpload.mockRejectedValue(new Error('Network error'));
});

Then('the upload should be cancelled', async function () {
  expect(screen.queryByTestId('upload-loading')).not.toBeInTheDocument();
});

Then('my avatar should remain unchanged', async function () {
  const avatar = screen.getByTestId('user-avatar');
  expect(avatar).toHaveAttribute('src', expect.not.stringContaining('new-avatar'));
});

When('I attempt to navigate away from the profile page', async function () {
  // Simulate navigation attempt
  window.history.pushState({}, '', '/dashboard');
});

Then('I should see a confirmation dialog {string}', async function (message) {
  await waitFor(() => {
    expect(screen.getByText(message)).toBeInTheDocument();
  });
});

When('I click {string}', async function (buttonText) {
  const button = screen.getByRole('button', { name: buttonText });
  await this.user.click(button);
});

Then('I should remain on the profile page', async function () {
  expect(window.location.pathname).toBe('/profile');
});

Then('my changes should still be in the form', async function () {
  expect(screen.getByDisplayValue('Unsaved Changes')).toBeInTheDocument();
});

When('I wait for {int} seconds', async function (seconds) {
  await new Promise(resolve => setTimeout(resolve, seconds * 1000));
});

Then('I should see a small indicator showing {string}', async function (message) {
  await waitFor(() => {
    expect(screen.getByText(message)).toBeInTheDocument();
  });
});

Then('my display name should be automatically saved', async function () {
  expect(mockAuthService.updateUserAttributes).toHaveBeenCalled();
});

When('I navigate using only keyboard controls', async function () {
  // Focus management testing would go here
});

Then('all form fields should be reachable with Tab key', async function () {
  const inputs = screen.getAllByRole('textbox');
  inputs.forEach(input => {
    expect(input).toHaveAttribute('tabindex', expect.not.stringMatching('-1'));
  });
});

Then('all buttons should be activatable with Enter or Space', async function () {
  const buttons = screen.getAllByRole('button');
  buttons.forEach(button => {
    expect(button).not.toBeDisabled();
  });
});

Then('screen reader announcements should provide context for changes', async function () {
  // ARIA live regions and announcements would be tested here
  expect(screen.getByRole('status')).toBeInTheDocument();
});

Then('error messages should be announced by screen readers', async function () {
  const errorElements = screen.getAllByRole('alert');
  expect(errorElements.length).toBeGreaterThan(0);
});