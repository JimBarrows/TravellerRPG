import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LoginForm } from './LoginForm';
import { AuthProvider } from '../context/AuthContext';
import { BrowserRouter } from 'react-router-dom';

// Mock the auth service
const mockAuthService = {
  signIn: vi.fn(),
  signOut: vi.fn(),
  getCurrentUser: vi.fn(),
  sendPasswordResetEmail: vi.fn()
};

// Mock navigation
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate
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

describe('LoginForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('should render all login form fields', () => {
    renderWithProviders(<LoginForm />);
    
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('checkbox', { name: /remember me/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^sign in$/i })).toBeInTheDocument();
    expect(screen.getByText(/forgot password/i)).toBeInTheDocument();
  });

  it('should validate email format', async () => {
    const user = userEvent.setup();
    renderWithProviders(<LoginForm />);
    
    const emailInput = screen.getByLabelText(/email/i);
    const submitButton = screen.getByRole('button', { name: /^sign in$/i });
    
    await user.type(emailInput, 'invalid-email');
    await user.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText(/please enter a valid email/i)).toBeInTheDocument();
    });
  });

  it('should require password field', async () => {
    const user = userEvent.setup();
    renderWithProviders(<LoginForm />);
    
    const emailInput = screen.getByLabelText(/email/i);
    const submitButton = screen.getByRole('button', { name: /^sign in$/i });
    
    await user.type(emailInput, 'test@example.com');
    await user.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText(/password is required/i)).toBeInTheDocument();
    });
  });

  it('should successfully login with valid credentials', async () => {
    const user = userEvent.setup();
    mockAuthService.signIn.mockResolvedValueOnce({
      isSignedIn: true,
      tokens: {
        accessToken: 'access-token-123',
        refreshToken: 'refresh-token-456'
      }
    });
    
    renderWithProviders(<LoginForm />);
    
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /^sign in$/i });
    
    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'SecurePass123!');
    await user.click(submitButton);
    
    await waitFor(() => {
      expect(mockAuthService.signIn).toHaveBeenCalledWith({
        username: 'test@example.com',
        password: 'SecurePass123!',
        rememberMe: false
      });
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
    });
  });

  it('should store tokens when remember me is checked', async () => {
    const user = userEvent.setup();
    mockAuthService.signIn.mockResolvedValueOnce({
      isSignedIn: true,
      tokens: {
        accessToken: 'access-token-123',
        refreshToken: 'refresh-token-456'
      }
    });
    
    renderWithProviders(<LoginForm />);
    
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const rememberMeCheckbox = screen.getByRole('checkbox', { name: /remember me/i });
    const submitButton = screen.getByRole('button', { name: /^sign in$/i });
    
    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'SecurePass123!');
    await user.click(rememberMeCheckbox);
    await user.click(submitButton);
    
    await waitFor(() => {
      expect(mockAuthService.signIn).toHaveBeenCalledWith({
        username: 'test@example.com',
        password: 'SecurePass123!',
        rememberMe: true
      });
      expect(localStorage.getItem('authToken')).toBe('access-token-123');
      expect(localStorage.getItem('refreshToken')).toBe('refresh-token-456');
    });
  });

  it('should display error message for invalid credentials', async () => {
    const user = userEvent.setup();
    mockAuthService.signIn.mockRejectedValueOnce(new Error('Invalid email or password'));
    
    renderWithProviders(<LoginForm />);
    
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /^sign in$/i });
    
    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'WrongPassword');
    await user.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText(/invalid email or password/i)).toBeInTheDocument();
    });
  });

  it('should handle unverified account error', async () => {
    const user = userEvent.setup();
    mockAuthService.signIn.mockRejectedValueOnce(new Error('Please verify your email before logging in'));
    
    renderWithProviders(<LoginForm />);
    
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /^sign in$/i });
    
    await user.type(emailInput, 'unverified@example.com');
    await user.type(passwordInput, 'SecurePass123!');
    await user.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText(/please verify your email/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /resend verification/i })).toBeInTheDocument();
    });
  });

  it('should show password reset form when forgot password is clicked', async () => {
    const user = userEvent.setup();
    renderWithProviders(<LoginForm />);
    
    const forgotPasswordLink = screen.getByText(/forgot password/i);
    await user.click(forgotPasswordLink);
    
    await waitFor(() => {
      expect(screen.getByText(/reset password/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /send reset link/i })).toBeInTheDocument();
    });
  });

  it('should send password reset email', async () => {
    const user = userEvent.setup();
    mockAuthService.sendPasswordResetEmail.mockResolvedValueOnce(true);
    
    renderWithProviders(<LoginForm />);
    
    // Click forgot password
    const forgotPasswordLink = screen.getByText(/forgot password/i);
    await user.click(forgotPasswordLink);
    
    // Enter email and submit
    const emailInput = screen.getByLabelText(/email/i);
    const sendResetButton = screen.getByRole('button', { name: /send reset link/i });
    
    await user.type(emailInput, 'test@example.com');
    await user.click(sendResetButton);
    
    await waitFor(() => {
      expect(mockAuthService.sendPasswordResetEmail).toHaveBeenCalledWith('test@example.com');
      expect(screen.getByText(/password reset instructions sent/i)).toBeInTheDocument();
    });
  });

  it('should show social login buttons', () => {
    renderWithProviders(<LoginForm />);
    
    expect(screen.getByText(/sign in with google/i)).toBeInTheDocument();
    expect(screen.getByText(/sign in with apple/i)).toBeInTheDocument();
  });

  it('should disable form while submitting', async () => {
    const user = userEvent.setup();
    mockAuthService.signIn.mockImplementation(() => 
      new Promise(resolve => setTimeout(resolve, 1000))
    );
    
    renderWithProviders(<LoginForm />);
    
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /^sign in$/i });
    
    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'SecurePass123!');
    await user.click(submitButton);
    
    expect(submitButton).toBeDisabled();
    expect(screen.getByText(/signing in/i)).toBeInTheDocument();
  });
});