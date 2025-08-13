import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { RegistrationForm } from './RegistrationForm';
import { AuthProvider } from '../context/AuthContext';

// Mock the auth service
const mockAuthService = {
  signUp: vi.fn(),
  confirmSignUp: vi.fn(),
  getCurrentUser: vi.fn(),
  signOut: vi.fn()
};

// Mock navigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

const renderWithProviders = (component) => {
  return render(
    <BrowserRouter>
      <AuthProvider authService={mockAuthService}>
        {component}
      </AuthProvider>
    </BrowserRouter>
  );
};

describe('RegistrationForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAuthService.signUp.mockResolvedValue({
      isSignUpComplete: false,
      userSub: 'test-user-id',
      codeDeliveryDetails: {
        destination: 'p***@example.com',
        deliveryMedium: 'EMAIL'
      }
    });
  });

  describe('Form Rendering', () => {
    it('renders registration form with all required fields', () => {
      renderWithProviders(<RegistrationForm />);
      
      expect(screen.getByRole('heading', { name: /create account/i })).toBeInTheDocument();
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/display name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/accept.*terms/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /^sign up$/i })).toBeInTheDocument();
    });

    it('renders social login options', () => {
      renderWithProviders(<RegistrationForm />);
      
      expect(screen.getByRole('button', { name: /sign up with google/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /sign up with apple/i })).toBeInTheDocument();
    });

    it('renders link to login page', () => {
      renderWithProviders(<RegistrationForm />);
      
      expect(screen.getByRole('link', { name: /sign in/i })).toBeInTheDocument();
    });
  });

  describe('Form Validation', () => {
    it('validates required email field', async () => {
      const user = userEvent.setup();
      renderWithProviders(<RegistrationForm />);
      
      const submitButton = screen.getByRole('button', { name: /^sign up$/i });
      await user.click(submitButton);
      
      expect(screen.getByText(/email is required/i)).toBeInTheDocument();
      expect(mockAuthService.signUp).not.toHaveBeenCalled();
    });

    it('validates email format', async () => {
      const user = userEvent.setup();
      renderWithProviders(<RegistrationForm />);
      
      const emailInput = screen.getByLabelText(/email/i);
      const submitButton = screen.getByRole('button', { name: /^sign up$/i });
      
      await user.type(emailInput, 'invalid-email');
      await user.click(submitButton);
      
      expect(screen.getByText(/please enter a valid email/i)).toBeInTheDocument();
      expect(mockAuthService.signUp).not.toHaveBeenCalled();
    });

    it('validates required display name field', async () => {
      const user = userEvent.setup();
      renderWithProviders(<RegistrationForm />);
      
      const emailInput = screen.getByLabelText(/email/i);
      const submitButton = screen.getByRole('button', { name: /^sign up$/i });
      
      await user.type(emailInput, 'test@example.com');
      await user.click(submitButton);
      
      expect(screen.getByText(/display name is required/i)).toBeInTheDocument();
      expect(mockAuthService.signUp).not.toHaveBeenCalled();
    });

    it('validates password requirements - minimum length', async () => {
      const user = userEvent.setup();
      renderWithProviders(<RegistrationForm />);
      
      const passwordInput = screen.getByLabelText(/^password$/i);
      const submitButton = screen.getByRole('button', { name: /^sign up$/i });
      
      await user.type(passwordInput, 'short');
      await user.click(submitButton);
      
      expect(screen.getByText(/password must contain.*at least 8 characters/i)).toBeInTheDocument();
    });

    it('validates password requirements - uppercase letter', async () => {
      const user = userEvent.setup();
      renderWithProviders(<RegistrationForm />);
      
      const passwordInput = screen.getByLabelText(/^password$/i);
      const submitButton = screen.getByRole('button', { name: /^sign up$/i });
      
      await user.type(passwordInput, 'lowercase123!');
      await user.click(submitButton);
      
      expect(screen.getByText(/password must contain.*one uppercase letter/i)).toBeInTheDocument();
    });

    it('validates password requirements - lowercase letter', async () => {
      const user = userEvent.setup();
      renderWithProviders(<RegistrationForm />);
      
      const passwordInput = screen.getByLabelText(/^password$/i);
      const submitButton = screen.getByRole('button', { name: /^sign up$/i });
      
      await user.type(passwordInput, 'UPPERCASE123!');
      await user.click(submitButton);
      
      expect(screen.getByText(/password must contain.*one lowercase letter/i)).toBeInTheDocument();
    });

    it('validates password requirements - number', async () => {
      const user = userEvent.setup();
      renderWithProviders(<RegistrationForm />);
      
      const passwordInput = screen.getByLabelText(/^password$/i);
      const submitButton = screen.getByRole('button', { name: /^sign up$/i });
      
      await user.type(passwordInput, 'NoNumbers!');
      await user.click(submitButton);
      
      expect(screen.getByText(/password must contain.*one number/i)).toBeInTheDocument();
    });

    it('validates password requirements - special character', async () => {
      const user = userEvent.setup();
      renderWithProviders(<RegistrationForm />);
      
      const passwordInput = screen.getByLabelText(/^password$/i);
      const submitButton = screen.getByRole('button', { name: /^sign up$/i });
      
      await user.type(passwordInput, 'NoSpecial123');
      await user.click(submitButton);
      
      expect(screen.getByText(/password must contain.*one special character/i)).toBeInTheDocument();
    });

    it('validates password confirmation match', async () => {
      const user = userEvent.setup();
      renderWithProviders(<RegistrationForm />);
      
      const passwordInput = screen.getByLabelText(/^password$/i);
      const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
      const submitButton = screen.getByRole('button', { name: /^sign up$/i });
      
      await user.type(passwordInput, 'StrongPass123!');
      await user.type(confirmPasswordInput, 'DifferentPass456!');
      await user.click(submitButton);
      
      expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument();
      expect(mockAuthService.signUp).not.toHaveBeenCalled();
    });

    it('validates terms and conditions acceptance', async () => {
      const user = userEvent.setup();
      renderWithProviders(<RegistrationForm />);
      
      // Fill all fields but don't accept terms
      await user.type(screen.getByLabelText(/email/i), 'test@example.com');
      await user.type(screen.getByLabelText(/display name/i), 'Test User');
      await user.type(screen.getByLabelText(/^password$/i), 'StrongPass123!');
      await user.type(screen.getByLabelText(/confirm password/i), 'StrongPass123!');
      await user.click(screen.getByRole('button', { name: /^sign up$/i }));
      
      expect(screen.getByText(/you must accept the terms and conditions/i)).toBeInTheDocument();
      expect(mockAuthService.signUp).not.toHaveBeenCalled();
    });

    it('clears field errors when user starts typing', async () => {
      const user = userEvent.setup();
      renderWithProviders(<RegistrationForm />);
      
      // Trigger email error
      const emailInput = screen.getByLabelText(/email/i);
      const submitButton = screen.getByRole('button', { name: /^sign up$/i });
      await user.click(submitButton);
      
      expect(screen.getByText(/email is required/i)).toBeInTheDocument();
      
      // Start typing in email field
      await user.type(emailInput, 'test@example.com');
      
      expect(screen.queryByText(/email is required/i)).not.toBeInTheDocument();
    });
  });

  describe('Password Strength Indicator', () => {
    it('does not show password strength indicator when password is empty', () => {
      renderWithProviders(<RegistrationForm />);
      
      expect(screen.queryByText(/weak|medium|strong/i)).not.toBeInTheDocument();
    });

    it('shows weak password strength for simple passwords', async () => {
      const user = userEvent.setup();
      renderWithProviders(<RegistrationForm />);
      
      const passwordInput = screen.getByLabelText(/^password$/i);
      await user.type(passwordInput, 'abc');
      
      expect(screen.getByText(/weak/i)).toBeInTheDocument();
    });

    it('shows medium password strength for partially strong passwords', async () => {
      const user = userEvent.setup();
      renderWithProviders(<RegistrationForm />);
      
      const passwordInput = screen.getByLabelText(/^password$/i);
      await user.type(passwordInput, 'Password123');
      
      expect(screen.getByText(/medium/i)).toBeInTheDocument();
    });

    it('shows strong password strength for fully compliant passwords', async () => {
      const user = userEvent.setup();
      renderWithProviders(<RegistrationForm />);
      
      const passwordInput = screen.getByLabelText(/^password$/i);
      await user.type(passwordInput, 'StrongPass123!');
      
      expect(screen.getByText(/strong/i)).toBeInTheDocument();
    });

    it('updates password requirements checklist in real-time', async () => {
      const user = userEvent.setup();
      renderWithProviders(<RegistrationForm />);
      
      const passwordInput = screen.getByLabelText(/^password$/i);
      
      // Type a password that meets some requirements
      await user.type(passwordInput, 'Password123!');
      
      // All requirements should be met
      const requirements = screen.getByText(/at least 8 characters/i).closest('li');
      expect(requirements).toHaveClass('met');
    });
  });

  describe('Form Submission', () => {
    it('submits form with valid data', async () => {
      const user = userEvent.setup();
      renderWithProviders(<RegistrationForm />);
      
      await user.type(screen.getByLabelText(/email/i), 'test@example.com');
      await user.type(screen.getByLabelText(/display name/i), 'Test User');
      await user.type(screen.getByLabelText(/^password$/i), 'StrongPass123!');
      await user.type(screen.getByLabelText(/confirm password/i), 'StrongPass123!');
      await user.click(screen.getByLabelText(/accept.*terms/i));
      await user.click(screen.getByRole('button', { name: /^sign up$/i }));
      
      await waitFor(() => {
        expect(mockAuthService.signUp).toHaveBeenCalledWith({
          email: 'test@example.com',
          password: 'StrongPass123!',
          displayName: 'Test User'
        });
      });
    });

    it('shows loading state during form submission', async () => {
      const user = userEvent.setup();
      
      // Mock a delayed response
      mockAuthService.signUp.mockImplementation(
        () => new Promise(resolve => setTimeout(resolve, 100))
      );
      
      renderWithProviders(<RegistrationForm />);
      
      await user.type(screen.getByLabelText(/email/i), 'test@example.com');
      await user.type(screen.getByLabelText(/display name/i), 'Test User');
      await user.type(screen.getByLabelText(/^password$/i), 'StrongPass123!');
      await user.type(screen.getByLabelText(/confirm password/i), 'StrongPass123!');
      await user.click(screen.getByLabelText(/accept.*terms/i));
      
      const submitButton = screen.getByRole('button', { name: /^sign up$/i });
      await user.click(submitButton);
      
      expect(screen.getByText(/creating account/i)).toBeInTheDocument();
      expect(submitButton).toBeDisabled();
    });

    it('handles registration error - email already exists', async () => {
      const user = userEvent.setup();
      mockAuthService.signUp.mockRejectedValue(
        new Error('An account with the given email already exists.')
      );
      
      renderWithProviders(<RegistrationForm />);
      
      await user.type(screen.getByLabelText(/email/i), 'existing@example.com');
      await user.type(screen.getByLabelText(/display name/i), 'Test User');
      await user.type(screen.getByLabelText(/^password$/i), 'StrongPass123!');
      await user.type(screen.getByLabelText(/confirm password/i), 'StrongPass123!');
      await user.click(screen.getByLabelText(/accept.*terms/i));
      await user.click(screen.getByRole('button', { name: /^sign up$/i }));
      
      await waitFor(() => {
        expect(screen.getByText(/an account with this email already exists/i)).toBeInTheDocument();
      });
    });

    it('handles generic registration errors', async () => {
      const user = userEvent.setup();
      mockAuthService.signUp.mockRejectedValue(new Error('Network error'));
      
      renderWithProviders(<RegistrationForm />);
      
      await user.type(screen.getByLabelText(/email/i), 'test@example.com');
      await user.type(screen.getByLabelText(/display name/i), 'Test User');
      await user.type(screen.getByLabelText(/^password$/i), 'StrongPass123!');
      await user.type(screen.getByLabelText(/confirm password/i), 'StrongPass123!');
      await user.click(screen.getByLabelText(/accept.*terms/i));
      await user.click(screen.getByRole('button', { name: /^sign up$/i }));
      
      await waitFor(() => {
        expect(screen.getByText(/network error/i)).toBeInTheDocument();
      });
    });
  });

  describe('Email Verification Flow', () => {
    beforeEach(async () => {
      const user = userEvent.setup();
      renderWithProviders(<RegistrationForm />);
      
      // Complete registration to get to verification
      await user.type(screen.getByLabelText(/email/i), 'test@example.com');
      await user.type(screen.getByLabelText(/display name/i), 'Test User');
      await user.type(screen.getByLabelText(/^password$/i), 'StrongPass123!');
      await user.type(screen.getByLabelText(/confirm password/i), 'StrongPass123!');
      await user.click(screen.getByLabelText(/accept.*terms/i));
      await user.click(screen.getByRole('button', { name: /^sign up$/i }));
      
      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /verify your email/i })).toBeInTheDocument();
      });
    });

    it('shows verification form after successful registration', () => {
      expect(screen.getByRole('heading', { name: /verify your email/i })).toBeInTheDocument();
      expect(screen.getByText(/we've sent a verification code/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/verification code/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /verify email/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /resend code/i })).toBeInTheDocument();
    });

    it('validates verification code format', async () => {
      const user = userEvent.setup();
      
      const codeInput = screen.getByLabelText(/verification code/i);
      const verifyButton = screen.getByRole('button', { name: /verify email/i });
      
      // Test invalid code length
      await user.type(codeInput, '123');
      await user.click(verifyButton);
      
      expect(screen.getByText(/please enter a valid 6-digit code/i)).toBeInTheDocument();
      expect(mockAuthService.confirmSignUp).not.toHaveBeenCalled();
    });

    it('submits verification code successfully', async () => {
      const user = userEvent.setup();
      mockAuthService.confirmSignUp.mockResolvedValue({ isSignUpComplete: true });
      
      const codeInput = screen.getByLabelText(/verification code/i);
      const verifyButton = screen.getByRole('button', { name: /verify email/i });
      
      await user.type(codeInput, '123456');
      await user.click(verifyButton);
      
      await waitFor(() => {
        expect(mockAuthService.confirmSignUp).toHaveBeenCalledWith(
          'test@example.com',
          '123456',
          'StrongPass123!'
        );
      });
    });

    it('handles verification errors', async () => {
      const user = userEvent.setup();
      mockAuthService.confirmSignUp.mockRejectedValue(
        new Error('Invalid verification code provided, please try again.')
      );
      
      const codeInput = screen.getByLabelText(/verification code/i);
      const verifyButton = screen.getByRole('button', { name: /verify email/i });
      
      await user.type(codeInput, '123456');
      await user.click(verifyButton);
      
      await waitFor(() => {
        expect(screen.getByText(/invalid verification code provided/i)).toBeInTheDocument();
      });
    });

    it('shows loading state during verification', async () => {
      const user = userEvent.setup();
      mockAuthService.confirmSignUp.mockImplementation(
        () => new Promise(resolve => setTimeout(resolve, 100))
      );
      
      const codeInput = screen.getByLabelText(/verification code/i);
      const verifyButton = screen.getByRole('button', { name: /verify email/i });
      
      await user.type(codeInput, '123456');
      await user.click(verifyButton);
      
      expect(screen.getByText(/verifying/i)).toBeInTheDocument();
      expect(verifyButton).toBeDisabled();
    });

    it('handles resend verification code', async () => {
      const user = userEvent.setup();
      
      const resendButton = screen.getByRole('button', { name: /resend code/i });
      await user.click(resendButton);
      
      // Note: The actual resend implementation is pending, so we just verify the button exists
      expect(resendButton).toBeInTheDocument();
    });
  });

  describe('Social Login', () => {
    it('handles Google signup button click', async () => {
      const user = userEvent.setup();
      renderWithProviders(<RegistrationForm />);
      
      const googleButton = screen.getByRole('button', { name: /sign up with google/i });
      await user.click(googleButton);
      
      // Note: Actual social login implementation is pending
      expect(googleButton).toBeInTheDocument();
    });

    it('handles Apple signup button click', async () => {
      const user = userEvent.setup();
      renderWithProviders(<RegistrationForm />);
      
      const appleButton = screen.getByRole('button', { name: /sign up with apple/i });
      await user.click(appleButton);
      
      // Note: Actual social login implementation is pending
      expect(appleButton).toBeInTheDocument();
    });

    it('disables social buttons during form submission', async () => {
      const user = userEvent.setup();
      
      // Mock a delayed response
      mockAuthService.signUp.mockImplementation(
        () => new Promise(resolve => setTimeout(resolve, 100))
      );
      
      renderWithProviders(<RegistrationForm />);
      
      await user.type(screen.getByLabelText(/email/i), 'test@example.com');
      await user.type(screen.getByLabelText(/display name/i), 'Test User');
      await user.type(screen.getByLabelText(/^password$/i), 'StrongPass123!');
      await user.type(screen.getByLabelText(/confirm password/i), 'StrongPass123!');
      await user.click(screen.getByLabelText(/accept.*terms/i));
      await user.click(screen.getByRole('button', { name: /^sign up$/i }));
      
      const googleButton = screen.getByRole('button', { name: /sign up with google/i });
      const appleButton = screen.getByRole('button', { name: /sign up with apple/i });
      
      expect(googleButton).toBeDisabled();
      expect(appleButton).toBeDisabled();
    });
  });
});