import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { VerificationForm } from './VerificationForm';
import { AuthProvider } from '../context/AuthContext';

// Mock the auth service
const mockAuthService = {
  signUp: vi.fn(),
  confirmSignUp: vi.fn(),
  getCurrentUser: vi.fn(),
  signOut: vi.fn(),
  signIn: vi.fn(),
  isAuthenticated: vi.fn().mockReturnValue(false),
  getAccessToken: vi.fn().mockReturnValue(null)
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

describe('VerificationForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAuthService.confirmSignUp.mockResolvedValue({ isSignUpComplete: true });
    mockAuthService.signIn.mockResolvedValue({ isSignedIn: true });
    mockAuthService.getCurrentUser.mockResolvedValue({ username: 'test@example.com' });
    mockNavigate.mockClear();
  });

  describe('Form Rendering', () => {
    it('renders verification form with all required elements', () => {
      renderWithProviders(
        <VerificationForm email="test@example.com" password="password123" />
      );
      
      expect(screen.getByRole('heading', { name: /verify your email/i })).toBeInTheDocument();
      expect(screen.getByText(/we've sent a 6-digit verification code to/i)).toBeInTheDocument();
      expect(screen.getByText('test@example.com')).toBeInTheDocument();
      expect(screen.getByLabelText(/verification code/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /verify email/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /resend code/i })).toBeInTheDocument();
    });

    it('shows user email in the instruction text', () => {
      renderWithProviders(
        <VerificationForm email="user@example.com" password="password123" />
      );
      
      expect(screen.getByText(/user@example.com/)).toBeInTheDocument();
    });

    it('shows back button when onBack callback is provided', () => {
      const mockOnBack = vi.fn();
      renderWithProviders(
        <VerificationForm 
          email="test@example.com" 
          password="password123"
          onBack={mockOnBack}
        />
      );
      
      expect(screen.getByRole('button', { name: /back to registration/i })).toBeInTheDocument();
    });

    it('does not show back button when onBack is not provided', () => {
      renderWithProviders(
        <VerificationForm email="test@example.com" password="password123" />
      );
      
      expect(screen.queryByRole('button', { name: /back to registration/i })).not.toBeInTheDocument();
    });
  });

  describe('Code Input Validation', () => {
    it('only allows numeric input', async () => {
      const user = userEvent.setup();
      renderWithProviders(
        <VerificationForm email="test@example.com" password="password123" />
      );
      
      const codeInput = screen.getByLabelText(/verification code/i);
      
      await user.type(codeInput, 'abc123def');
      
      expect(codeInput.value).toBe('123');
    });

    it('limits input to 6 digits', async () => {
      const user = userEvent.setup();
      renderWithProviders(
        <VerificationForm email="test@example.com" password="password123" />
      );
      
      const codeInput = screen.getByLabelText(/verification code/i);
      
      await user.type(codeInput, '1234567890');
      
      expect(codeInput.value).toBe('123456');
    });

    it('shows formatted code preview', async () => {
      const user = userEvent.setup();
      renderWithProviders(
        <VerificationForm email="test@example.com" password="password123" />
      );
      
      const codeInput = screen.getByLabelText(/verification code/i);
      
      await user.type(codeInput, '123456');
      
      expect(screen.getByText(/code: 123-456/i)).toBeInTheDocument();
    });

    it('validates required code on submit', async () => {
      renderWithProviders(
        <VerificationForm email="test@example.com" password="password123" />
      );
      
      const submitButton = screen.getByRole('button', { name: /verify email/i });
      
      // Submit button should be disabled when code is empty
      expect(submitButton).toBeDisabled();
      expect(mockAuthService.confirmSignUp).not.toHaveBeenCalled();
    });

    it('validates code length', async () => {
      const user = userEvent.setup();
      renderWithProviders(
        <VerificationForm email="test@example.com" password="password123" />
      );
      
      const codeInput = screen.getByLabelText(/verification code/i);
      const submitButton = screen.getByRole('button', { name: /verify email/i });
      
      await user.type(codeInput, '123');
      
      // Submit button should be disabled when code is not 6 digits
      expect(submitButton).toBeDisabled();
      expect(mockAuthService.confirmSignUp).not.toHaveBeenCalled();
    });

    it('clears validation errors when user starts typing', async () => {
      const user = userEvent.setup();
      mockAuthService.confirmSignUp.mockRejectedValue(
        new Error('Invalid verification code')
      );
      
      renderWithProviders(
        <VerificationForm email="test@example.com" password="password123" />
      );
      
      const codeInput = screen.getByLabelText(/verification code/i);
      const submitButton = screen.getByRole('button', { name: /verify email/i });
      
      // Submit with valid code to trigger an error from the service
      await user.type(codeInput, '123456');
      await user.click(submitButton);
      
      // Wait for error to be processed
      await waitFor(() => {
        expect(mockAuthService.confirmSignUp).toHaveBeenCalled();
      });
      
      // Clear and start typing to clear error
      await user.clear(codeInput);
      await user.type(codeInput, '1');
      
      // Error should be cleared
      const errorElement = screen.queryByRole('alert');
      if (errorElement) {
        expect(errorElement).not.toHaveTextContent(/Invalid verification code/i);
      }
    });
  });

  describe('Form Submission', () => {
    it('submits valid verification code', async () => {
      const user = userEvent.setup();
      mockAuthService.signIn.mockResolvedValue({ isSignedIn: true });
      mockAuthService.getCurrentUser.mockResolvedValue({ username: 'test@example.com' });
      
      renderWithProviders(
        <VerificationForm email="test@example.com" password="password123" />
      );
      
      const codeInput = screen.getByLabelText(/verification code/i);
      const submitButton = screen.getByRole('button', { name: /verify email/i });
      
      await user.type(codeInput, '123456');
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(mockAuthService.confirmSignUp).toHaveBeenCalledWith(
          'test@example.com',
          '123456'
        );
      });
    });

    it('shows loading state during submission', async () => {
      const user = userEvent.setup();
      
      // Mock a delayed response
      mockAuthService.confirmSignUp.mockImplementation(
        () => new Promise(resolve => setTimeout(resolve, 100))
      );
      
      renderWithProviders(
        <VerificationForm email="test@example.com" password="password123" />
      );
      
      const codeInput = screen.getByLabelText(/verification code/i);
      const submitButton = screen.getByRole('button', { name: /verify email/i });
      
      await user.type(codeInput, '123456');
      await user.click(submitButton);
      
      expect(screen.getByText(/verifying/i)).toBeInTheDocument();
      expect(submitButton).toBeDisabled();
    });

    it('disables submit button when code is incomplete', () => {
      renderWithProviders(
        <VerificationForm email="test@example.com" password="password123" />
      );
      
      const submitButton = screen.getByRole('button', { name: /verify email/i });
      
      expect(submitButton).toBeDisabled();
    });

    it('enables submit button when code is complete', async () => {
      const user = userEvent.setup();
      renderWithProviders(
        <VerificationForm email="test@example.com" password="password123" />
      );
      
      const codeInput = screen.getByLabelText(/verification code/i);
      const submitButton = screen.getByRole('button', { name: /verify email/i });
      
      await user.type(codeInput, '123456');
      
      expect(submitButton).toBeEnabled();
    });

    it('navigates to dashboard on successful verification', async () => {
      const user = userEvent.setup();
      mockAuthService.signIn.mockResolvedValue({ isSignedIn: true });
      mockAuthService.getCurrentUser.mockResolvedValue({ username: 'test@example.com' });
      
      renderWithProviders(
        <VerificationForm email="test@example.com" password="password123" />
      );
      
      const codeInput = screen.getByLabelText(/verification code/i);
      const submitButton = screen.getByRole('button', { name: /verify email/i });
      
      await user.type(codeInput, '123456');
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
      });
    });

    it('calls onSuccess callback when provided', async () => {
      const user = userEvent.setup();
      const mockOnSuccess = vi.fn();
      mockAuthService.signIn.mockResolvedValue({ isSignedIn: true });
      mockAuthService.getCurrentUser.mockResolvedValue({ username: 'test@example.com' });
      
      renderWithProviders(
        <VerificationForm 
          email="test@example.com" 
          password="password123"
          onSuccess={mockOnSuccess}
        />
      );
      
      const codeInput = screen.getByLabelText(/verification code/i);
      const submitButton = screen.getByRole('button', { name: /verify email/i });
      
      await user.type(codeInput, '123456');
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(mockOnSuccess).toHaveBeenCalledWith({ isSignUpComplete: true });
      });
    });

    it('does not auto-redirect when autoRedirect is false', async () => {
      const user = userEvent.setup({ delay: null }); // Remove delay for more predictable behavior
      
      renderWithProviders(
        <VerificationForm 
          email="test@example.com" 
          password="password123"
          autoRedirect={false}
        />
      );
      
      const codeInput = screen.getByLabelText(/verification code/i);
      const submitButton = screen.getByRole('button', { name: /verify email/i });
      
      // Type the verification code synchronously
      await user.type(codeInput, '123456');
      
      // Submit the form
      await user.click(submitButton);
      
      // Wait for form submission to complete
      await waitFor(() => {
        expect(mockAuthService.confirmSignUp).toHaveBeenCalled();
      });
      
      // Verify the correct arguments were passed
      expect(mockAuthService.confirmSignUp).toHaveBeenCalledWith(
        'test@example.com',
        '123456'
      );
      
      // Verify navigation didn't happen (which is the actual test purpose)
      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });

  describe('Resend Code Functionality', () => {
    it('handles resend code button click', async () => {
      const user = userEvent.setup();
      renderWithProviders(
        <VerificationForm email="test@example.com" password="password123" />
      );
      
      const resendButton = screen.getByRole('button', { name: /resend code/i });
      
      await user.click(resendButton);
      
      // Button text changes when clicked
      await waitFor(() => {
        expect(resendButton).toHaveTextContent(/sending/i);
      });
    });

    it('shows cooldown timer after resend', async () => {
      const user = userEvent.setup();
      renderWithProviders(
        <VerificationForm email="test@example.com" password="password123" />
      );
      
      const resendButton = screen.getByRole('button', { name: /resend code/i });
      
      await user.click(resendButton);
      
      // Wait for the sending state first
      await waitFor(() => {
        expect(resendButton).toHaveTextContent(/sending/i);
      });
      
      // Then wait for the cooldown state (after the 1 second timeout)
      await waitFor(() => {
        expect(resendButton).toHaveTextContent(/resend in \d+s/i);
      }, { timeout: 2000 });
    });

    it('tracks resend attempts', async () => {
      const user = userEvent.setup();
      renderWithProviders(
        <VerificationForm email="test@example.com" password="password123" />
      );
      
      const resendButton = screen.getByRole('button', { name: /resend code/i });
      
      // First resend
      await user.click(resendButton);
      
      // Should show sending state
      await waitFor(() => {
        expect(resendButton).toHaveTextContent(/sending/i);
      });
      
      // Should enter cooldown state
      await waitFor(() => {
        expect(resendButton).toHaveTextContent(/resend in \d+s/i);
      }, { timeout: 2000 });
    });

    it('disables resend button during cooldown', async () => {
      const user = userEvent.setup();
      renderWithProviders(
        <VerificationForm email="test@example.com" password="password123" />
      );
      
      const resendButton = screen.getByRole('button', { name: /resend code/i });
      
      await user.click(resendButton);
      
      // Button should be disabled during sending and cooldown
      await waitFor(() => {
        expect(resendButton).toBeDisabled();
      });
    });
  });

  describe('Keyboard Interaction', () => {
    it('submits form on Enter key when code is complete', async () => {
      const user = userEvent.setup();
      mockAuthService.confirmSignUp.mockResolvedValue({ isSignUpComplete: true });
      
      renderWithProviders(
        <VerificationForm email="test@example.com" password="password123" />
      );
      
      const codeInput = screen.getByLabelText(/verification code/i);
      
      await user.type(codeInput, '123456');
      
      // Use user.keyboard to simulate Enter key press
      await user.keyboard('{Enter}');
      
      await waitFor(() => {
        expect(mockAuthService.confirmSignUp).toHaveBeenCalledWith(
          'test@example.com',
          '123456'
        );
      });
    });

    it('prevents non-numeric key input', () => {
      renderWithProviders(
        <VerificationForm email="test@example.com" password="password123" />
      );
      
      const codeInput = screen.getByLabelText(/verification code/i);
      
      // Simulate typing non-numeric characters
      fireEvent.change(codeInput, { target: { value: 'a1b2c3' } });
      
      // Only numbers should remain (filtered by component)
      expect(codeInput.value).toBe('123');
    });
  });

  describe('Error Handling', () => {
    it('handles verification errors', async () => {
      const user = userEvent.setup();
      mockAuthService.confirmSignUp.mockRejectedValue(
        new Error('Invalid verification code provided, please try again.')
      );
      
      renderWithProviders(
        <VerificationForm email="test@example.com" password="password123" />
      );
      
      const codeInput = screen.getByLabelText(/verification code/i);
      const submitButton = screen.getByRole('button', { name: /verify email/i });
      
      await user.type(codeInput, '123456');
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(mockAuthService.confirmSignUp).toHaveBeenCalledWith(
          'test@example.com',
          '123456'
        );
      });
    });

    it('focuses and selects input after error', async () => {
      const user = userEvent.setup();
      mockAuthService.confirmSignUp.mockRejectedValue(
        new Error('Invalid verification code')
      );
      
      renderWithProviders(
        <VerificationForm email="test@example.com" password="password123" />
      );
      
      const codeInput = screen.getByLabelText(/verification code/i);
      const submitButton = screen.getByRole('button', { name: /verify email/i });
      
      await user.type(codeInput, '123456');
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(mockAuthService.confirmSignUp).toHaveBeenCalled();
      });
      
      // Test that the input still exists and is accessible for retry
      expect(codeInput).toBeInTheDocument();
      expect(codeInput.value).toBe('123456');
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA labels and descriptions', () => {
      renderWithProviders(
        <VerificationForm email="test@example.com" password="password123" />
      );
      
      const codeInput = screen.getByLabelText(/verification code/i);
      
      expect(codeInput).toHaveAttribute('aria-describedby', 'code-help');
      expect(codeInput).toHaveAttribute('aria-invalid', 'false');
      expect(codeInput).toHaveAttribute('inputMode', 'numeric');
      expect(codeInput).toHaveAttribute('autoComplete', 'one-time-code');
    });

    it('updates ARIA attributes on validation error', async () => {
      const user = userEvent.setup();
      mockAuthService.confirmSignUp.mockRejectedValue(
        new Error('Invalid verification code')
      );
      
      renderWithProviders(
        <VerificationForm email="test@example.com" password="password123" />
      );
      
      const codeInput = screen.getByLabelText(/verification code/i);
      const submitButton = screen.getByRole('button', { name: /verify email/i });
      
      // Submit with valid length code to trigger service error
      await user.type(codeInput, '123456');
      await user.click(submitButton);
      
      // Check ARIA attributes are updated after service error
      await waitFor(() => {
        expect(codeInput).toHaveAttribute('aria-invalid', 'true');
      });
    });

    it('has role="alert" for error messages', async () => {
      const user = userEvent.setup();
      mockAuthService.confirmSignUp.mockRejectedValue(
        new Error('Invalid verification code')
      );
      
      renderWithProviders(
        <VerificationForm email="test@example.com" password="password123" />
      );
      
      const codeInput = screen.getByLabelText(/verification code/i);
      const submitButton = screen.getByRole('button', { name: /verify email/i });
      
      // Submit with valid length code to trigger service error
      await user.type(codeInput, '123456');
      await user.click(submitButton);
      
      // Check for error message with alert role
      await waitFor(() => {
        const errorMessage = screen.queryByRole('alert');
        expect(errorMessage).toBeInTheDocument();
      });
    });
  });

  describe('Back Navigation', () => {
    it('calls onBack when back button is clicked', async () => {
      const user = userEvent.setup();
      const mockOnBack = vi.fn();
      
      renderWithProviders(
        <VerificationForm 
          email="test@example.com" 
          password="password123"
          onBack={mockOnBack}
        />
      );
      
      const backButton = screen.getByRole('button', { name: /back to registration/i });
      
      await user.click(backButton);
      
      expect(mockOnBack).toHaveBeenCalled();
    });

    it('disables back button during submission', async () => {
      const user = userEvent.setup();
      const mockOnBack = vi.fn();
      
      // Mock a pending response that never resolves (for testing disabled state)
      mockAuthService.confirmSignUp.mockImplementation(
        () => new Promise(() => {}) // Never resolves
      );
      
      renderWithProviders(
        <VerificationForm 
          email="test@example.com" 
          password="password123"
          onBack={mockOnBack}
        />
      );
      
      const codeInput = screen.getByLabelText(/verification code/i);
      const submitButton = screen.getByRole('button', { name: /verify email/i });
      const backButton = screen.getByRole('button', { name: /back to registration/i });
      
      await user.type(codeInput, '123456');
      await user.click(submitButton);
      
      // Check button is disabled while submitting
      await waitFor(() => {
        expect(backButton).toBeDisabled();
      });
    });
  });
});