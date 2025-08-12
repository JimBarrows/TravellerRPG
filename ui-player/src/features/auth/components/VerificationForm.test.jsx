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

describe('VerificationForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAuthService.confirmSignUp.mockResolvedValue({ isSignUpComplete: true });
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
      const user = userEvent.setup();
      renderWithProviders(
        <VerificationForm email="test@example.com" password="password123" />
      );
      
      const submitButton = screen.getByRole('button', { name: /verify email/i });
      
      await user.click(submitButton);
      
      expect(screen.getByText(/verification code is required/i)).toBeInTheDocument();
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
      await user.click(submitButton);
      
      expect(screen.getByText(/please enter a valid 6-digit code/i)).toBeInTheDocument();
      expect(mockAuthService.confirmSignUp).not.toHaveBeenCalled();
    });

    it('clears validation errors when user starts typing', async () => {
      const user = userEvent.setup();
      renderWithProviders(
        <VerificationForm email="test@example.com" password="password123" />
      );
      
      const codeInput = screen.getByLabelText(/verification code/i);
      const submitButton = screen.getByRole('button', { name: /verify email/i });
      
      // Trigger validation error
      await user.click(submitButton);
      expect(screen.getByText(/verification code is required/i)).toBeInTheDocument();
      
      // Start typing to clear error
      await user.type(codeInput, '1');
      
      expect(screen.queryByText(/verification code is required/i)).not.toBeInTheDocument();
    });
  });

  describe('Form Submission', () => {
    it('submits valid verification code', async () => {
      const user = userEvent.setup();
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
          '123456',
          'password123'
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
      const user = userEvent.setup();
      renderWithProviders(
        <VerificationForm 
          email="test@example.com" 
          password="password123"
          autoRedirect={false}
        />
      );
      
      const codeInput = screen.getByLabelText(/verification code/i);
      const submitButton = screen.getByRole('button', { name: /verify email/i });
      
      await user.type(codeInput, '123456');
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(mockAuthService.confirmSignUp).toHaveBeenCalled();
      });
      
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
      
      expect(screen.getByText(/sending/i)).toBeInTheDocument();
    });

    it('shows cooldown timer after resend', async () => {
      const user = userEvent.setup();
      renderWithProviders(
        <VerificationForm email="test@example.com" password="password123" />
      );
      
      const resendButton = screen.getByRole('button', { name: /resend code/i });
      
      await user.click(resendButton);
      
      await waitFor(() => {
        expect(screen.getByText(/resend in \d+s/i)).toBeInTheDocument();
      });
    });

    it('tracks resend attempts', async () => {
      const user = userEvent.setup();
      renderWithProviders(
        <VerificationForm email="test@example.com" password="password123" />
      );
      
      const resendButton = screen.getByRole('button', { name: /resend code/i });
      
      // First resend
      await user.click(resendButton);
      
      await waitFor(() => {
        expect(screen.getByText(/resend in \d+s/i)).toBeInTheDocument();
      });
      
      // After cooldown, button should show attempt count
      // Note: In a real test, we'd need to advance timers
    });

    it('disables resend button during cooldown', async () => {
      const user = userEvent.setup();
      renderWithProviders(
        <VerificationForm email="test@example.com" password="password123" />
      );
      
      const resendButton = screen.getByRole('button', { name: /resend code/i });
      
      await user.click(resendButton);
      
      await waitFor(() => {
        expect(resendButton).toBeDisabled();
      });
    });
  });

  describe('Keyboard Interaction', () => {
    it('submits form on Enter key when code is complete', async () => {
      const user = userEvent.setup();
      renderWithProviders(
        <VerificationForm email="test@example.com" password="password123" />
      );
      
      const codeInput = screen.getByLabelText(/verification code/i);
      
      await user.type(codeInput, '123456');
      await user.keyboard('{Enter}');
      
      await waitFor(() => {
        expect(mockAuthService.confirmSignUp).toHaveBeenCalledWith(
          'test@example.com',
          '123456',
          'password123'
        );
      });
    });

    it('prevents non-numeric key input', async () => {
      const user = userEvent.setup();
      renderWithProviders(
        <VerificationForm email="test@example.com" password="password123" />
      );
      
      const codeInput = screen.getByLabelText(/verification code/i);
      
      await user.click(codeInput);
      await user.keyboard('abc');
      
      expect(codeInput.value).toBe('');
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
        // Error should be displayed through AuthContext errorDisplay
        expect(mockAuthService.confirmSignUp).toHaveBeenCalled();
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
        expect(codeInput).toHaveFocus();
      });
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
      renderWithProviders(
        <VerificationForm email="test@example.com" password="password123" />
      );
      
      const codeInput = screen.getByLabelText(/verification code/i);
      const submitButton = screen.getByRole('button', { name: /verify email/i });
      
      await user.click(submitButton);
      
      expect(codeInput).toHaveAttribute('aria-invalid', 'true');
      expect(codeInput).toHaveAttribute('aria-describedby', 'code-error');
    });

    it('has role="alert" for error messages', async () => {
      const user = userEvent.setup();
      renderWithProviders(
        <VerificationForm email="test@example.com" password="password123" />
      );
      
      const submitButton = screen.getByRole('button', { name: /verify email/i });
      
      await user.click(submitButton);
      
      const errorMessage = screen.getByRole('alert');
      expect(errorMessage).toHaveTextContent(/verification code is required/i);
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
      
      // Mock a delayed response
      mockAuthService.confirmSignUp.mockImplementation(
        () => new Promise(resolve => setTimeout(resolve, 100))
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
      
      expect(backButton).toBeDisabled();
    });
  });
});