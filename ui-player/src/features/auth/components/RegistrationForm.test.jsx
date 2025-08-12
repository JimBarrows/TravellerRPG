import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RegistrationForm } from './RegistrationForm';
import { AuthProvider } from '../context/AuthContext';
import { BrowserRouter } from 'react-router-dom';

// Mock the auth service
const mockAuthService = {
  signUp: vi.fn(),
  confirmSignUp: vi.fn(),
  signIn: vi.fn()
};

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
  });

  it('should render all registration form fields', () => {
    renderWithProviders(<RegistrationForm />);
    
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/display name/i)).toBeInTheDocument();
    expect(screen.getByRole('checkbox', { name: /terms/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign up/i })).toBeInTheDocument();
  });

  it('should show validation errors for invalid email', async () => {
    const user = userEvent.setup();
    renderWithProviders(<RegistrationForm />);
    
    const emailInput = screen.getByLabelText(/email/i);
    const submitButton = screen.getByRole('button', { name: /sign up/i });
    
    await user.type(emailInput, 'invalid-email');
    await user.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText(/please enter a valid email/i)).toBeInTheDocument();
    });
  });

  it('should show validation errors for weak password', async () => {
    const user = userEvent.setup();
    renderWithProviders(<RegistrationForm />);
    
    const passwordInput = screen.getByLabelText(/^password$/i);
    const submitButton = screen.getByRole('button', { name: /sign up/i });
    
    await user.type(passwordInput, 'weak');
    await user.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText(/password must be at least 8 characters/i)).toBeInTheDocument();
    });
  });

  it('should show error when passwords do not match', async () => {
    const user = userEvent.setup();
    renderWithProviders(<RegistrationForm />);
    
    const passwordInput = screen.getByLabelText(/^password$/i);
    const confirmInput = screen.getByLabelText(/confirm password/i);
    const submitButton = screen.getByRole('button', { name: /sign up/i });
    
    await user.type(passwordInput, 'SecurePass123!');
    await user.type(confirmInput, 'DifferentPass123!');
    await user.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument();
    });
  });

  it('should require accepting terms and conditions', async () => {
    const user = userEvent.setup();
    renderWithProviders(<RegistrationForm />);
    
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/^password$/i);
    const confirmInput = screen.getByLabelText(/confirm password/i);
    const displayNameInput = screen.getByLabelText(/display name/i);
    const submitButton = screen.getByRole('button', { name: /sign up/i });
    
    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'SecurePass123!');
    await user.type(confirmInput, 'SecurePass123!');
    await user.type(displayNameInput, 'Test User');
    await user.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText(/you must accept the terms/i)).toBeInTheDocument();
    });
  });

  it('should successfully submit valid registration form', async () => {
    const user = userEvent.setup();
    mockAuthService.signUp.mockResolvedValueOnce({
      userSub: 'user-123',
      codeDeliveryDetails: {
        destination: 'test@example.com'
      }
    });
    
    renderWithProviders(<RegistrationForm />);
    
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/^password$/i);
    const confirmInput = screen.getByLabelText(/confirm password/i);
    const displayNameInput = screen.getByLabelText(/display name/i);
    const termsCheckbox = screen.getByRole('checkbox', { name: /terms/i });
    const submitButton = screen.getByRole('button', { name: /sign up/i });
    
    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'SecurePass123!');
    await user.type(confirmInput, 'SecurePass123!');
    await user.type(displayNameInput, 'Test User');
    await user.click(termsCheckbox);
    await user.click(submitButton);
    
    await waitFor(() => {
      expect(mockAuthService.signUp).toHaveBeenCalledWith({
        username: 'test@example.com',
        password: 'SecurePass123!',
        attributes: {
          email: 'test@example.com',
          name: 'Test User'
        }
      });
    });
  });

  it('should show verification form after successful registration', async () => {
    const user = userEvent.setup();
    mockAuthService.signUp.mockResolvedValueOnce({
      userSub: 'user-123',
      codeDeliveryDetails: {
        destination: 'test@example.com'
      }
    });
    
    renderWithProviders(<RegistrationForm />);
    
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/^password$/i);
    const confirmInput = screen.getByLabelText(/confirm password/i);
    const displayNameInput = screen.getByLabelText(/display name/i);
    const termsCheckbox = screen.getByRole('checkbox', { name: /terms/i });
    const submitButton = screen.getByRole('button', { name: /sign up/i });
    
    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'SecurePass123!');
    await user.type(confirmInput, 'SecurePass123!');
    await user.type(displayNameInput, 'Test User');
    await user.click(termsCheckbox);
    await user.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText(/verification email sent/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/verification code/i)).toBeInTheDocument();
    });
  });

  it('should handle registration errors gracefully', async () => {
    const user = userEvent.setup();
    mockAuthService.signUp.mockRejectedValueOnce(new Error('User already exists'));
    
    renderWithProviders(<RegistrationForm />);
    
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/^password$/i);
    const confirmInput = screen.getByLabelText(/confirm password/i);
    const displayNameInput = screen.getByLabelText(/display name/i);
    const termsCheckbox = screen.getByRole('checkbox', { name: /terms/i });
    const submitButton = screen.getByRole('button', { name: /sign up/i });
    
    await user.type(emailInput, 'existing@example.com');
    await user.type(passwordInput, 'SecurePass123!');
    await user.type(confirmInput, 'SecurePass123!');
    await user.type(displayNameInput, 'Test User');
    await user.click(termsCheckbox);
    await user.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText(/user already exists/i)).toBeInTheDocument();
    });
  });

  it('should successfully verify email with correct code', async () => {
    const user = userEvent.setup();
    mockAuthService.signUp.mockResolvedValueOnce({
      userSub: 'user-123',
      codeDeliveryDetails: {
        destination: 'test@example.com'
      }
    });
    mockAuthService.confirmSignUp.mockResolvedValueOnce({ isSignUpComplete: true });
    mockAuthService.signIn.mockResolvedValueOnce({
      isSignedIn: true,
      tokens: { accessToken: 'token123' }
    });
    
    renderWithProviders(<RegistrationForm />);
    
    // First register
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/^password$/i);
    const confirmInput = screen.getByLabelText(/confirm password/i);
    const displayNameInput = screen.getByLabelText(/display name/i);
    const termsCheckbox = screen.getByRole('checkbox', { name: /terms/i });
    const submitButton = screen.getByRole('button', { name: /sign up/i });
    
    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'SecurePass123!');
    await user.type(confirmInput, 'SecurePass123!');
    await user.type(displayNameInput, 'Test User');
    await user.click(termsCheckbox);
    await user.click(submitButton);
    
    // Then verify
    await waitFor(() => {
      expect(screen.getByLabelText(/verification code/i)).toBeInTheDocument();
    });
    
    const codeInput = screen.getByLabelText(/verification code/i);
    const verifyButton = screen.getByRole('button', { name: /verify/i });
    
    await user.type(codeInput, '123456');
    await user.click(verifyButton);
    
    await waitFor(() => {
      expect(mockAuthService.confirmSignUp).toHaveBeenCalledWith({
        username: 'test@example.com',
        confirmationCode: '123456'
      });
    });
  });
});