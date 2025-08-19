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
    getExportProgress: vi.fn(),
    prepareExportData: vi.fn(),
    downloadExportFile: vi.fn()
  }
}));

vi.mock('../services/subscriptionService', () => ({
  default: {
    getUserSubscription: vi.fn(),
    updateSubscription: vi.fn(),
    cancelSubscription: vi.fn(),
    getSubscriptionTiers: vi.fn(),
    getUpgradeOptions: vi.fn(),
    getDowngradeOptions: vi.fn(),
    hasFeatureAccess: vi.fn(),
    calculateProration: vi.fn(),
    getSubscriptionFeatures: vi.fn(),
    getSubscriptionLimits: vi.fn(),
    isWithinLimits: vi.fn(),
    validateSubscriptionChange: vi.fn(),
    formatPrice: vi.fn()
  }
}));

import dataExportService from '../services/dataExportService';
import subscriptionService from '../services/subscriptionService';

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

  beforeEach(() => {
    vi.clearAllMocks();
    useAuth.mockReturnValue(mockAuthContext);
    
    // Mock window.confirm
    global.confirm = vi.fn(() => true);
    
    // Setup default mock implementations
    subscriptionService.getSubscriptionTiers.mockReturnValue([
      { name: 'Free', price: 0, features: [], limits: {} },
      { name: 'Standard', price: 999, features: [], limits: {} },
      { name: 'Premium', price: 1999, features: [], limits: {} }
    ]);
    subscriptionService.getUpgradeOptions.mockReturnValue([]);
    subscriptionService.getDowngradeOptions.mockReturnValue([]);
    subscriptionService.getUserSubscription.mockResolvedValue(mockSubscription);
    subscriptionService.getSubscriptionFeatures.mockReturnValue(['Feature A', 'Feature B']);
    subscriptionService.getSubscriptionLimits.mockReturnValue({ maxCharacters: 10 });
    subscriptionService.isWithinLimits.mockReturnValue(true);
    subscriptionService.validateSubscriptionChange.mockReturnValue({ isValid: true });
    subscriptionService.formatPrice.mockReturnValue('$9.99');
  });

  it('should render account information correctly', () => {
    render(<AccountPage />);
    
    expect(screen.getByText('Account Management')).toBeInTheDocument();
    expect(screen.getByText('test@example.com')).toBeInTheDocument();
    expect(screen.getByText('Test User')).toBeInTheDocument();
  });

  it('should display subscription information', async () => {
    render(<AccountPage />);
    
    await waitFor(() => {
      expect(screen.getByText((content, element) => {
        return content.includes('Standard');
      })).toBeInTheDocument();
      expect(screen.getByText('active')).toBeInTheDocument();
    });
  });

  it('should handle data export request', async () => {
    const user = userEvent.setup();
    dataExportService.prepareExportData.mockResolvedValue({
      user: mockUser,
      characters: [],
      campaigns: [],
      settings: {}
    });
    dataExportService.downloadExportFile.mockImplementation(() => {});

    render(<AccountPage />);
    
    const exportButton = screen.getByRole('button', { name: /export data/i });
    await user.click(exportButton);
    
    // Wait for the export process to complete
    await waitFor(() => {
      expect(dataExportService.prepareExportData).toHaveBeenCalledWith(mockUser);
    });

    // The downloadExportFile should be called after prepareExportData and processing delay
    await waitFor(() => {
      expect(dataExportService.downloadExportFile).toHaveBeenCalled();
    }, { timeout: 2000 }); // Account for the 1 second delay in component
  });

  it('should show account deletion confirmation dialog', async () => {
    const user = userEvent.setup();
    
    render(<AccountPage />);
    
    const deleteButton = screen.getByRole('button', { name: /delete account/i });
    await user.click(deleteButton);
    
    // Should show the custom deletion modal
    await waitFor(() => {
      expect(screen.getByText('Delete Your Account')).toBeInTheDocument();
      expect(screen.getByText((content, element) => {
        return content.includes('Type') && content.includes('to confirm:');
      })).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Type DELETE to confirm')).toBeInTheDocument();
    });
  });

  it('should require typing DELETE to confirm account deletion', async () => {
    const user = userEvent.setup();
    
    render(<AccountPage />);
    
    const deleteButton = screen.getByRole('button', { name: /delete account/i });
    await user.click(deleteButton);
    
    // Should show the custom modal
    await waitFor(() => {
      expect(screen.getByText('Delete Your Account')).toBeInTheDocument();
    });

    // The confirm button should be disabled initially
    const confirmButton = screen.getByRole('button', { name: /confirm delete/i });
    expect(confirmButton).toBeDisabled();

    // Type "DELETE" in the confirmation input
    const confirmInput = screen.getByPlaceholderText('Type DELETE to confirm');
    await user.type(confirmInput, 'DELETE');

    // Now the button should be enabled
    expect(confirmButton).toBeEnabled();

    // Click the confirm button to trigger the deletion
    await user.click(confirmButton);

    // Should call signOut (since the component doesn't have a real delete API)
    await waitFor(() => {
      expect(mockAuthContext.signOut).toHaveBeenCalled();
    });
  });

  it('should handle account deletion process', async () => {
    const user = userEvent.setup();
    
    render(<AccountPage />);
    
    const deleteButton = screen.getByRole('button', { name: /delete account/i });
    await user.click(deleteButton);
    
    // Should call signOut when user confirms deletion
    await waitFor(() => {
      expect(mockAuthContext.signOut).toHaveBeenCalled();
    });
  });

  it('should display subscription upgrade options for Free tier', async () => {
    const freeSubscription = { ...mockSubscription, tier: 'Free' };
    subscriptionService.getUserSubscription.mockResolvedValue(freeSubscription);
    subscriptionService.getUpgradeOptions.mockReturnValue([
      { name: 'Standard', price: 999 },
      { name: 'Premium', price: 1999 }
    ]);

    render(<AccountPage />);
    
    await waitFor(() => {
      expect(screen.getByText(/upgrade to standard/i)).toBeInTheDocument();
    });
  });

  it('should display subscription downgrade options for Premium tier', async () => {
    const premiumSubscription = { ...mockSubscription, tier: 'Premium' };
    subscriptionService.getUserSubscription.mockResolvedValue(premiumSubscription);
    subscriptionService.getDowngradeOptions.mockReturnValue([
      { name: 'Standard', price: 999 },
      { name: 'Free', price: 0 }
    ]);

    render(<AccountPage />);
    
    await waitFor(() => {
      expect(screen.getByText(/downgrade to standard/i)).toBeInTheDocument();
    });
  });

  it('should handle subscription tier changes', async () => {
    const user = userEvent.setup();
    subscriptionService.updateSubscription.mockResolvedValue({ success: true });
    subscriptionService.getUpgradeOptions.mockReturnValue([
      { name: 'Premium', price: 1999 }
    ]);

    render(<AccountPage />);
    
    await waitFor(() => {
      const upgradeButton = screen.getByText(/upgrade to premium/i);
      return user.click(upgradeButton);
    });
    
    await waitFor(() => {
      expect(subscriptionService.updateSubscription).toHaveBeenCalled();
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