import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ProfilePage from './ProfilePage';
import { AuthProvider } from '../context/AuthContext';
import TestRouter from '../../../test/support/TestRouter';

// Mock AWS Amplify Storage
vi.mock('@aws-amplify/storage', () => ({
  uploadData: vi.fn(),
  remove: vi.fn(),
  getUrl: vi.fn()
}));

// Mock auth service
const createMockAuthService = () => ({
  getCurrentUser: vi.fn(() => Promise.resolve({
    id: 'user-123',
    username: 'john.doe@example.com',
    email: 'john.doe@example.com',
    attributes: {
      name: 'John Doe',
      email: 'john.doe@example.com',
      'custom:timezone': 'America/New_York',
      'custom:subscription_tier': 'Free',
      'custom:avatar_url': null,
      created_at: '2024-01-01T00:00:00Z',
      'custom:connected_accounts': JSON.stringify([])
    }
  })),
  updateUserAttributes: vi.fn(() => Promise.resolve({})),
  changePassword: vi.fn(() => Promise.resolve(true)),
  enableMFA: vi.fn(() => Promise.resolve({
    qrCode: 'data:image/png;base64,mock-qr-code',
    secretCode: 'MOCK-SECRET-CODE'
  })),
  verifyMFA: vi.fn(() => Promise.resolve({ isVerified: true }))
});

const renderProfilePage = (authService = createMockAuthService()) => {
  return render(
    <TestRouter initialEntries={['/profile']}>
      <AuthProvider authService={authService}>
        <ProfilePage />
      </AuthProvider>
    </TestRouter>
  );
};

describe('ProfilePage', () => {
  let mockAuthService;
  let user;

  beforeEach(async () => {
    mockAuthService = createMockAuthService();
    user = userEvent.setup();
    
    // Set up localStorage to simulate logged-in user
    localStorage.setItem('authToken', 'mock-auth-token');
    
    // Get the mocked modules
    const { uploadData, remove, getUrl } = await import('@aws-amplify/storage');
    
    // Reset mocks
    uploadData.mockClear();
    remove.mockClear();
    getUrl.mockResolvedValue({ url: 'https://example.com/avatar.jpg' });
  });

  afterEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    sessionStorage.clear();
  });

  describe('Profile Information Display', () => {
    it('should display user profile information correctly', async () => {
      renderProfilePage(mockAuthService);

      await waitFor(() => {
        expect(screen.getByText('john.doe@example.com')).toBeInTheDocument();
        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.getByText('America/New_York')).toBeInTheDocument();
        expect(screen.getByText('Free')).toBeInTheDocument();
      });
    });

    it('should display account creation date', async () => {
      renderProfilePage(mockAuthService);

      await waitFor(() => {
        expect(screen.getByText(/Account created:/)).toBeInTheDocument();
        expect(screen.getByText(/December 31, 2023|January 1, 2024/)).toBeInTheDocument();
      });
    });

    it('should display default avatar when no avatar is set', async () => {
      renderProfilePage(mockAuthService);

      await waitFor(() => {
        const avatar = screen.getByTestId('user-avatar');
        expect(avatar).toBeInTheDocument();
        expect(avatar).toHaveAttribute('src', expect.stringContaining('default'));
      });
    });

    it('should display custom avatar when avatar URL is set', async () => {
      const serviceWithAvatar = createMockAuthService();
      serviceWithAvatar.getCurrentUser.mockResolvedValue({
        ...serviceWithAvatar.getCurrentUser(),
        attributes: {
          ...serviceWithAvatar.getCurrentUser().attributes,
          'custom:avatar_url': 'https://example.com/custom-avatar.jpg'
        }
      });

      renderProfilePage(serviceWithAvatar);

      await waitFor(() => {
        const avatar = screen.getByTestId('user-avatar');
        expect(avatar).toHaveAttribute('src', 'https://example.com/custom-avatar.jpg');
      });
    });
  });

  describe('Display Name Updates', () => {
    it('should allow editing display name', async () => {
      renderProfilePage(mockAuthService);

      await waitFor(() => {
        const editButton = screen.getByTestId('edit-display-name');
        expect(editButton).toBeInTheDocument();
      });

      await user.click(screen.getByTestId('edit-display-name'));
      
      const input = screen.getByTestId('display-name-input');
      await user.clear(input);
      await user.type(input, 'Captain John');

      await user.click(screen.getByTestId('save-profile-changes'));

      await waitFor(() => {
        expect(mockAuthService.updateUserAttributes).toHaveBeenCalledWith({
          name: 'Captain John'
        });
      });
    });

    it('should show success message after updating display name', async () => {
      renderProfilePage(mockAuthService);

      await user.click(screen.getByTestId('edit-display-name'));
      const input = screen.getByTestId('display-name-input');
      await user.clear(input);
      await user.type(input, 'Captain John');
      await user.click(screen.getByTestId('save-profile-changes'));

      await waitFor(() => {
        expect(screen.getByText('Profile updated successfully')).toBeInTheDocument();
      });
    });

    it('should validate display name length', async () => {
      renderProfilePage(mockAuthService);

      await user.click(screen.getByTestId('edit-display-name'));
      const input = screen.getByTestId('display-name-input');
      await user.clear(input);
      await user.type(input, 'A');

      expect(screen.getByText('Display name must be at least 2 characters')).toBeInTheDocument();
      expect(screen.getByTestId('save-profile-changes')).toBeDisabled();
    });
  });

  describe('Avatar Upload', () => {
    it('should allow uploading valid image files', async () => {
      renderProfilePage(mockAuthService);

      const file = new File(['mock image content'], 'avatar.jpg', { 
        type: 'image/jpeg',
        size: 1024 * 1024 * 2 // 2MB
      });

      await user.click(screen.getByTestId('avatar-upload-button'));
      
      const input = screen.getByTestId('avatar-file-input');
      await user.upload(input, file);

      await waitFor(() => {
        expect(screen.getByTestId('avatar-preview')).toBeInTheDocument();
      });
    });

    it('should reject files larger than 5MB', async () => {
      renderProfilePage(mockAuthService);

      const file = new File(['mock large image'], 'large-avatar.jpg', { 
        type: 'image/jpeg',
        size: 1024 * 1024 * 6 // 6MB
      });

      await user.click(screen.getByTestId('avatar-upload-button'));
      const input = screen.getByTestId('avatar-file-input');
      await user.upload(input, file);

      await waitFor(() => {
        expect(screen.getByText('File size must be less than 5MB')).toBeInTheDocument();
      });
    });

    it('should reject invalid file formats', async () => {
      renderProfilePage(mockAuthService);

      const file = new File(['mock pdf content'], 'document.pdf', { 
        type: 'application/pdf',
        size: 1024
      });

      await user.click(screen.getByTestId('avatar-upload-button'));
      const input = screen.getByTestId('avatar-file-input');
      await user.upload(input, file);

      await waitFor(() => {
        expect(screen.getByText('Please select a valid image file (JPG, PNG, GIF)')).toBeInTheDocument();
      });
    });

    it('should upload to S3 when confirmed', async () => {
      const { uploadData } = await import('@aws-amplify/storage');
      uploadData.mockResolvedValue({ key: 'avatars/user-123/avatar.jpg' });
      renderProfilePage(mockAuthService);

      const file = new File(['mock image'], 'avatar.jpg', { 
        type: 'image/jpeg',
        size: 1024 * 1024 
      });

      await user.click(screen.getByTestId('avatar-upload-button'));
      const input = screen.getByTestId('avatar-file-input');
      await user.upload(input, file);

      await waitFor(() => {
        expect(screen.getByTestId('avatar-preview')).toBeInTheDocument();
      });

      await user.click(screen.getByTestId('confirm-avatar-upload'));

      await waitFor(() => {
        expect(uploadData).toHaveBeenCalledWith({
          key: expect.stringContaining('avatars/user-123/'),
          data: file,
          options: {
            accessLevel: 'private',
            contentType: file.type
          }
        });
      });
    });

    it('should show loading state during upload', async () => {
      const { uploadData } = await import('@aws-amplify/storage');
      uploadData.mockImplementation(() => new Promise(resolve => 
        setTimeout(() => resolve({ key: 'avatars/user-123/avatar.jpg' }), 100)
      ));
      
      renderProfilePage(mockAuthService);

      const file = new File(['mock image'], 'avatar.jpg', { type: 'image/jpeg', size: 1024 });

      await user.click(screen.getByTestId('avatar-upload-button'));
      const input = screen.getByTestId('avatar-file-input');
      await user.upload(input, file);
      await user.click(screen.getByTestId('confirm-avatar-upload'));

      expect(screen.getByTestId('upload-loading')).toBeInTheDocument();

      await waitFor(() => {
        expect(screen.queryByTestId('upload-loading')).not.toBeInTheDocument();
      });
    });
  });

  describe('Timezone Selection', () => {
    it('should allow changing timezone', async () => {
      renderProfilePage(mockAuthService);

      await user.click(screen.getByTestId('timezone-select'));
      await user.click(screen.getByRole('option', { name: 'America/Los_Angeles' }));
      await user.click(screen.getByTestId('save-profile-changes'));

      await waitFor(() => {
        expect(mockAuthService.updateUserAttributes).toHaveBeenCalledWith({
          'custom:timezone': 'America/Los_Angeles'
        });
      });
    });

    it('should display timezone options', async () => {
      renderProfilePage(mockAuthService);

      await user.click(screen.getByTestId('timezone-select'));

      expect(screen.getByRole('option', { name: 'America/New_York' })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: 'America/Los_Angeles' })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: 'Europe/London' })).toBeInTheDocument();
    });
  });

  describe('Email Change with Verification', () => {
    it('should allow changing email', async () => {
      renderProfilePage(mockAuthService);

      await user.click(screen.getByTestId('edit-email'));
      const input = screen.getByTestId('email-input');
      await user.clear(input);
      await user.type(input, 'new.email@example.com');
      await user.click(screen.getByTestId('save-profile-changes'));

      await waitFor(() => {
        expect(screen.getByText('Verification code sent to new.email@example.com')).toBeInTheDocument();
      });
    });

    it('should show verification code input after email change', async () => {
      renderProfilePage(mockAuthService);

      await user.click(screen.getByTestId('edit-email'));
      const input = screen.getByTestId('email-input');
      await user.clear(input);
      await user.type(input, 'new.email@example.com');
      await user.click(screen.getByTestId('save-profile-changes'));

      await waitFor(() => {
        expect(screen.getByTestId('verification-code-input')).toBeInTheDocument();
      });
    });

    it('should validate email format', async () => {
      renderProfilePage(mockAuthService);

      await user.click(screen.getByTestId('edit-email'));
      const input = screen.getByTestId('email-input');
      await user.clear(input);
      await user.type(input, 'invalid-email');

      expect(screen.getByText('Please enter a valid email address')).toBeInTheDocument();
      expect(screen.getByTestId('save-profile-changes')).toBeDisabled();
    });
  });

  describe('Password Change', () => {
    it('should show password change form when clicked', async () => {
      renderProfilePage(mockAuthService);

      await user.click(screen.getByRole('button', { name: 'Change Password' }));

      expect(screen.getByTestId('password-change-form')).toBeInTheDocument();
      expect(screen.getByTestId('current-password-input')).toBeInTheDocument();
      expect(screen.getByTestId('new-password-input')).toBeInTheDocument();
      expect(screen.getByTestId('confirm-password-input')).toBeInTheDocument();
    });

    it('should validate password strength', async () => {
      renderProfilePage(mockAuthService);

      await user.click(screen.getByRole('button', { name: 'Change Password' }));
      const newPasswordInput = screen.getByTestId('new-password-input');
      await user.type(newPasswordInput, 'weak');

      expect(screen.getByText('Weak')).toBeInTheDocument();
      expect(screen.getByTestId('submit-password-change')).toBeDisabled();
    });

    it('should validate password confirmation match', async () => {
      renderProfilePage(mockAuthService);

      await user.click(screen.getByRole('button', { name: 'Change Password' }));
      
      const newPasswordInput = screen.getByTestId('new-password-input');
      const confirmPasswordInput = screen.getByTestId('confirm-password-input');
      
      await user.type(newPasswordInput, 'SecurePass123!');
      await user.type(confirmPasswordInput, 'DifferentPassword!');

      expect(screen.getByText('Passwords do not match')).toBeInTheDocument();
      expect(screen.getByTestId('submit-password-change')).toBeDisabled();
    });

    it('should submit password change when valid', async () => {
      renderProfilePage(mockAuthService);

      await user.click(screen.getByRole('button', { name: 'Change Password' }));
      
      await user.type(screen.getByTestId('current-password-input'), 'OldPass123!');
      await user.type(screen.getByTestId('new-password-input'), 'NewSecurePass456!');
      await user.type(screen.getByTestId('confirm-password-input'), 'NewSecurePass456!');
      
      await user.click(screen.getByTestId('submit-password-change'));

      await waitFor(() => {
        expect(mockAuthService.changePassword).toHaveBeenCalledWith('OldPass123!', 'NewSecurePass456!');
      });
    });
  });

  describe('Social Accounts Management', () => {
    it('should display connected accounts', async () => {
      const serviceWithAccounts = createMockAuthService();
      serviceWithAccounts.getCurrentUser.mockResolvedValue({
        ...serviceWithAccounts.getCurrentUser(),
        attributes: {
          ...serviceWithAccounts.getCurrentUser().attributes,
          'custom:connected_accounts': JSON.stringify(['Google', 'Apple'])
        }
      });

      renderProfilePage(serviceWithAccounts);

      await waitFor(() => {
        expect(screen.getByText('Google')).toBeInTheDocument();
        expect(screen.getByText('Apple')).toBeInTheDocument();
      });
    });

    it('should show disconnect options for connected accounts', async () => {
      const serviceWithAccounts = createMockAuthService();
      serviceWithAccounts.getCurrentUser.mockResolvedValue({
        ...serviceWithAccounts.getCurrentUser(),
        attributes: {
          ...serviceWithAccounts.getCurrentUser().attributes,
          'custom:connected_accounts': JSON.stringify(['Google'])
        }
      });

      renderProfilePage(serviceWithAccounts);

      await waitFor(() => {
        expect(screen.getByTestId('disconnect-google')).toBeInTheDocument();
      });
    });

    it('should show connect options for unconnected accounts', async () => {
      renderProfilePage(mockAuthService);

      await waitFor(() => {
        expect(screen.getByTestId('connect-facebook')).toBeInTheDocument();
        expect(screen.getByTestId('connect-google')).toBeInTheDocument();
      });
    });

    it('should show confirmation dialog when disconnecting account', async () => {
      const serviceWithAccounts = createMockAuthService();
      serviceWithAccounts.getCurrentUser.mockResolvedValue({
        ...serviceWithAccounts.getCurrentUser(),
        attributes: {
          ...serviceWithAccounts.getCurrentUser().attributes,
          'custom:connected_accounts': JSON.stringify(['Google'])
        }
      });

      renderProfilePage(serviceWithAccounts);

      await waitFor(() => {
        expect(screen.getByTestId('disconnect-google')).toBeInTheDocument();
      });

      await user.click(screen.getByTestId('disconnect-google'));

      expect(screen.getByText('Are you sure you want to disconnect your Google account?')).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('should display error when profile update fails', async () => {
      const failingService = createMockAuthService();
      failingService.updateUserAttributes.mockRejectedValue(new Error('Network error'));

      renderProfilePage(failingService);

      await user.click(screen.getByTestId('edit-display-name'));
      const input = screen.getByTestId('display-name-input');
      await user.clear(input);
      await user.type(input, 'New Name');
      await user.click(screen.getByTestId('save-profile-changes'));

      await waitFor(() => {
        expect(screen.getByText('Unable to save changes. Please check your connection and try again.')).toBeInTheDocument();
      });
    });

    it('should display error when avatar upload fails', async () => {
      const { uploadData } = await import('@aws-amplify/storage');
      uploadData.mockRejectedValue(new Error('Upload failed'));
      renderProfilePage(mockAuthService);

      const file = new File(['mock image'], 'avatar.jpg', { type: 'image/jpeg', size: 1024 });

      await user.click(screen.getByTestId('avatar-upload-button'));
      const input = screen.getByTestId('avatar-file-input');
      await user.upload(input, file);
      await user.click(screen.getByTestId('confirm-avatar-upload'));

      await waitFor(() => {
        expect(screen.getByText('Upload failed. Please try again.')).toBeInTheDocument();
      });
    });

    it('should display error when password change fails', async () => {
      const failingService = createMockAuthService();
      failingService.changePassword.mockRejectedValue(new Error('Invalid current password'));

      renderProfilePage(failingService);

      await user.click(screen.getByRole('button', { name: 'Change Password' }));
      await user.type(screen.getByTestId('current-password-input'), 'WrongPass123!');
      await user.type(screen.getByTestId('new-password-input'), 'NewSecurePass456!');
      await user.type(screen.getByTestId('confirm-password-input'), 'NewSecurePass456!');
      await user.click(screen.getByTestId('submit-password-change'));

      await waitFor(() => {
        expect(screen.getByText('Invalid current password')).toBeInTheDocument();
      });
    });
  });

  describe('Auto-save and Unsaved Changes', () => {
    it('should auto-save changes after delay', async () => {
      vi.useFakeTimers();
      renderProfilePage(mockAuthService);

      await user.click(screen.getByTestId('edit-display-name'));
      const input = screen.getByTestId('display-name-input');
      await user.clear(input);
      await user.type(input, 'Auto Save Test');

      // Fast-forward time
      vi.advanceTimersByTime(3000);

      await waitFor(() => {
        expect(mockAuthService.updateUserAttributes).toHaveBeenCalledWith({
          name: 'Auto Save Test'
        });
      });

      vi.useRealTimers();
    });

    it('should warn about unsaved changes when navigating away', async () => {
      const mockPreventDefault = vi.fn();
      const mockEvent = { preventDefault: mockPreventDefault, returnValue: '' };
      
      renderProfilePage(mockAuthService);

      await user.click(screen.getByTestId('edit-display-name'));
      const input = screen.getByTestId('display-name-input');
      await user.clear(input);
      await user.type(input, 'Unsaved Changes');

      // Simulate beforeunload event
      window.dispatchEvent(new Event('beforeunload', mockEvent));

      expect(mockPreventDefault).toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels', async () => {
      renderProfilePage(mockAuthService);

      await waitFor(() => {
        expect(screen.getByLabelText('Display Name')).toBeInTheDocument();
        expect(screen.getByLabelText('Email Address')).toBeInTheDocument();
        expect(screen.getByLabelText('Timezone')).toBeInTheDocument();
      });
    });

    it('should have proper tab order', async () => {
      renderProfilePage(mockAuthService);

      await waitFor(() => {
        const inputs = screen.getAllByRole('textbox');
        inputs.forEach(input => {
          expect(input).toHaveAttribute('tabindex', expect.not.stringMatching('-1'));
        });
      });
    });

    it('should announce changes to screen readers', async () => {
      renderProfilePage(mockAuthService);

      await user.click(screen.getByTestId('edit-display-name'));
      const input = screen.getByTestId('display-name-input');
      await user.clear(input);
      await user.type(input, 'Screen Reader Test');
      await user.click(screen.getByTestId('save-profile-changes'));

      await waitFor(() => {
        expect(screen.getByRole('status')).toBeInTheDocument();
      });
    });

    it('should have proper error announcements', async () => {
      const failingService = createMockAuthService();
      failingService.updateUserAttributes.mockRejectedValue(new Error('Test error'));

      renderProfilePage(failingService);

      await user.click(screen.getByTestId('edit-display-name'));
      const input = screen.getByTestId('display-name-input');
      await user.clear(input);
      await user.type(input, 'Error Test');
      await user.click(screen.getByTestId('save-profile-changes'));

      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeInTheDocument();
      });
    });
  });
});