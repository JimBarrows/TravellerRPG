import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AccountPage } from './AccountPage';
import { useAuth } from '../context/AuthContext';

// Mock the auth context
vi.mock('../context/AuthContext', () => ({
  useAuth: vi.fn()
}));

// Mock the services
vi.mock('../services/dataExportService', () => ({
  default: {
    exportUserData: vi.fn(),
    getExportProgress: vi.fn()
  }
}));

vi.mock('../services/subscriptionService', () => ({
  default: {
    getUserSubscription: vi.fn(),
    updateSubscription: vi.fn(),
    cancelSubscription: vi.fn(),
    getSubscriptionTiers: vi.fn(),
    getUpgradeOptions: vi.fn(),
    getDowngradeOptions: vi.fn()
  }
}));

describe('AccountPage', () => {
  const mockUser = {
    id: 'user123',
    username: 'testuser',
    email: 'test@example.com',
    attributes: {
      name: 'Test User',
      email: 'test@example.com',
      created_at: '2023-01-01T00:00:00Z'
    }
  };

  const mockSubscription = {
    tier: 'Standard',
    status: 'active',
    nextBillingDate: '2024-02-01',
    features: ['Feature A', 'Feature B'],
    limits: { maxCharacters: 10 }
  };

  const mockAuthContext = {
    user: mockUser,
    loading: false,
    error: null,
    signOut: vi.fn(),
    updateProfile: vi.fn()
  };

  beforeEach(async () => {
    vi.clearAllMocks();
    useAuth.mockReturnValue(mockAuthContext);
    
    // Setup default mock implementations
    const mockSubscriptionService = (await import('../services/subscriptionService')).default;
    mockSubscriptionService.getSubscriptionTiers.mockReturnValue([
      { name: 'Free', price: 0, features: [], limits: {} },
      { name: 'Standard', price: 999, features: [], limits: {} },
      { name: 'Premium', price: 1999, features: [], limits: {} }
    ]);
    mockSubscriptionService.getUpgradeOptions.mockReturnValue([]);
    mockSubscriptionService.getDowngradeOptions.mockReturnValue([]);
  });

  it('should render account information correctly', () => {
    render(<AccountPage />);
    
    expect(screen.getByText('Account Management')).toBeInTheDocument();
    expect(screen.getByText('test@example.com')).toBeInTheDocument();
    expect(screen.getByText('Test User')).toBeInTheDocument();
  });

  it('should display subscription information', async () => {
    const mockSubscriptionService = await import('../services/subscriptionService');
    mockSubscriptionService.default.getUserSubscription.mockResolvedValue(mockSubscription);

    render(<AccountPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Standard')).toBeInTheDocument();
      expect(screen.getByText('Active')).toBeInTheDocument();
    });
  });

  it('should handle data export request', async () => {
    const user = userEvent.setup();
    const mockDataExportService = await import('../services/dataExportService');
    mockDataExportService.default.exportUserData.mockResolvedValue({
      downloadUrl: 'http://example.com/export.json',
      expiresAt: new Date(Date.now() + 3600000)
    });

    render(<AccountPage />);
    
    const exportButton = screen.getByRole('button', { name: /export data/i });
    await user.click(exportButton);
    
    await waitFor(() => {
      expect(screen.getByText(/preparing your data/i)).toBeInTheDocument();
    });
    
    await waitFor(() => {
      expect(screen.getByRole('link', { name: /download/i })).toBeInTheDocument();
    });
  });

  it('should show account deletion confirmation dialog', async () => {
    const user = userEvent.setup();
    
    render(<AccountPage />);
    
    const deleteButton = screen.getByRole('button', { name: /delete account/i });
    await user.click(deleteButton);
    
    expect(screen.getByText(/delete your account/i)).toBeInTheDocument();
    expect(screen.getByText(/this action cannot be undone/i)).toBeInTheDocument();
  });

  it('should require typing DELETE to confirm account deletion', async () => {
    const user = userEvent.setup();
    
    render(<AccountPage />);
    
    const deleteButton = screen.getByRole('button', { name: /delete account/i });
    await user.click(deleteButton);
    
    const confirmInput = screen.getByPlaceholderText(/type delete/i);
    const confirmButton = screen.getByRole('button', { name: /confirm delete/i });
    
    expect(confirmButton).toBeDisabled();
    
    await user.type(confirmInput, 'DELETE');
    
    expect(confirmButton).toBeEnabled();
  });

  it('should handle account deletion process', async () => {
    const user = userEvent.setup();
    
    render(<AccountPage />);
    
    const deleteButton = screen.getByRole('button', { name: /delete account/i });
    await user.click(deleteButton);
    
    const confirmInput = screen.getByPlaceholderText(/type delete/i);
    await user.type(confirmInput, 'DELETE');
    
    const confirmButton = screen.getByRole('button', { name: /confirm delete/i });
    await user.click(confirmButton);
    
    await waitFor(() => {
      expect(mockAuthContext.signOut).toHaveBeenCalled();
    });
  });

  it('should display subscription upgrade options for Free tier', async () => {
    const freeSubscription = { ...mockSubscription, tier: 'Free' };
    const mockSubscriptionService = await import('../services/subscriptionService');
    mockSubscriptionService.default.getUserSubscription.mockResolvedValue(freeSubscription);

    render(<AccountPage />);
    
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /upgrade/i })).toBeInTheDocument();
    });
  });

  it('should display subscription downgrade options for Premium tier', async () => {
    const premiumSubscription = { ...mockSubscription, tier: 'Premium' };
    const mockSubscriptionService = await import('../services/subscriptionService');
    mockSubscriptionService.default.getUserSubscription.mockResolvedValue(premiumSubscription);

    render(<AccountPage />);
    
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /downgrade/i })).toBeInTheDocument();
    });
  });

  it('should handle subscription tier changes', async () => {
    const user = userEvent.setup();
    const mockSubscriptionService = await import('../services/subscriptionService');
    mockSubscriptionService.default.getUserSubscription.mockResolvedValue(mockSubscription);
    mockSubscriptionService.default.updateSubscription.mockResolvedValue({ success: true });

    render(<AccountPage />);
    
    await waitFor(() => {
      const upgradeButton = screen.getByRole('button', { name: /upgrade/i });
      return user.click(upgradeButton);
    });
    
    await waitFor(() => {
      expect(mockSubscriptionService.default.updateSubscription).toHaveBeenCalled();
    });
  });

  it('should show loading state while fetching data', () => {
    useAuth.mockReturnValue({ ...mockAuthContext, loading: true });
    
    render(<AccountPage />);
    
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it('should handle error states gracefully', () => {
    useAuth.mockReturnValue({ ...mockAuthContext, error: 'Failed to load account' });
    
    render(<AccountPage />);
    
    expect(screen.getByText(/failed to load account/i)).toBeInTheDocument();
  });

  it('should be accessible with proper ARIA attributes', () => {
    render(<AccountPage />);
    
    const main = screen.getByRole('main');
    expect(main).toBeInTheDocument();
    
    const headings = screen.getAllByRole('heading');
    expect(headings.length).toBeGreaterThan(0);
    
    const buttons = screen.getAllByRole('button');
    buttons.forEach(button => {
      expect(button).toHaveAccessibleName();
    });
  });

  it('should validate email updates', async () => {
    const user = userEvent.setup();
    
    render(<AccountPage />);
    
    const editButton = screen.getByRole('button', { name: /edit profile/i });
    await user.click(editButton);
    
    const emailInput = screen.getByLabelText(/email/i);
    await user.clear(emailInput);
    await user.type(emailInput, 'invalid-email');
    
    const saveButton = screen.getByRole('button', { name: /save/i });
    await user.click(saveButton);
    
    expect(screen.getByText(/invalid email/i)).toBeInTheDocument();
  });

  it('should display last login information', () => {
    const userWithLoginInfo = {
      ...mockUser,
      attributes: {
        ...mockUser.attributes,
        last_login: '2024-01-15T10:30:00Z'
      }
    };
    
    useAuth.mockReturnValue({ ...mockAuthContext, user: userWithLoginInfo });
    
    render(<AccountPage />);
    
    expect(screen.getByText(/last login/i)).toBeInTheDocument();
  });
});