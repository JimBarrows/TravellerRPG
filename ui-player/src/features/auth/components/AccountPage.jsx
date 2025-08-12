import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import dataExportService from '../services/dataExportService';
import subscriptionService from '../services/subscriptionService';
import { SessionTimeoutWarning } from './SessionTimeoutWarning';
import { tokenManager } from '../utils/tokenUtils';
import './AccountPage.css';

/**
 * AccountPage Component
 * Provides account management, subscription management, and data export functionality
 */
export const AccountPage = () => {
  const { user, loading, error, signOut, updateProfile } = useAuth();
  const [subscription, setSubscription] = useState(null);
  const [subscriptionLoading, setSubscriptionLoading] = useState(true);
  const [exportLoading, setExportLoading] = useState(false);
  const [exportProgress, setExportProgress] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [showSessionWarning, setShowSessionWarning] = useState(false);
  const [sessionTimeRemaining, setSessionTimeRemaining] = useState(0);
  const [editMode, setEditMode] = useState(false);
  const [profileData, setProfileData] = useState({
    name: '',
    email: ''
  });
  const [profileErrors, setProfileErrors] = useState({});

  // Load subscription data
  useEffect(() => {
    const loadSubscription = async () => {
      if (!user?.id) return;

      try {
        setSubscriptionLoading(true);
        const sub = await subscriptionService.getUserSubscription(user.id, true);
        setSubscription(sub);
      } catch (error) {
        console.error('Failed to load subscription:', error);
      } finally {
        setSubscriptionLoading(false);
      }
    };

    loadSubscription();
  }, [user?.id]);

  // Initialize profile data
  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.attributes?.name || user.username || '',
        email: user.email || user.attributes?.email || ''
      });
    }
  }, [user]);

  // Session timeout monitoring
  useEffect(() => {
    const checkSessionTimeout = async () => {
      const shouldShow = await tokenManager.shouldShowSessionTimeoutWarning();
      const timeRemaining = await tokenManager.getTimeUntilExpiration();

      if (shouldShow && timeRemaining > 0) {
        setShowSessionWarning(true);
        setSessionTimeRemaining(timeRemaining);
        tokenManager.markSessionTimeoutWarningShown();
      }
    };

    const interval = setInterval(checkSessionTimeout, 30000); // Check every 30 seconds
    checkSessionTimeout(); // Initial check

    return () => clearInterval(interval);
  }, []);

  // Handle data export
  const handleExportData = async () => {
    if (!user?.id) return;

    try {
      setExportLoading(true);
      setExportProgress({ status: 'preparing', progress: 0 });

      const exportData = await dataExportService.prepareExportData(user);
      
      setExportProgress({ status: 'processing', progress: 50 });
      
      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const filename = `traveller-rpg-export-${user.id}-${new Date().toISOString().split('T')[0]}.json`;
      dataExportService.downloadExportFile(exportData, filename);
      
      setExportProgress({ status: 'completed', progress: 100 });
      
      // Reset after a delay
      setTimeout(() => {
        setExportProgress(null);
      }, 3000);
    } catch (error) {
      console.error('Export failed:', error);
      setExportProgress({ status: 'error', error: error.message });
    } finally {
      setExportLoading(false);
    }
  };

  // Handle account deletion
  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'DELETE') {
      return;
    }

    try {
      // In a real implementation, this would call a delete account API
      await signOut();
      // Redirect would be handled by the auth context
    } catch (error) {
      console.error('Account deletion failed:', error);
    }
  };

  // Handle subscription tier change
  const handleSubscriptionChange = async (newTier) => {
    if (!user?.id || !subscription) return;

    try {
      const validation = subscriptionService.validateSubscriptionChange(subscription.tier, newTier);
      if (!validation.isValid) {
        alert(validation.error);
        return;
      }

      const confirmMessage = validation.type === 'upgrade' 
        ? `Upgrade to ${newTier}?`
        : `Downgrade to ${newTier}? You will lose access to some features.`;

      if (!confirm(confirmMessage)) {
        return;
      }

      const updatedSubscription = await subscriptionService.updateSubscription(user.id, {
        tier: newTier
      });

      setSubscription(updatedSubscription);
    } catch (error) {
      console.error('Subscription change failed:', error);
      alert('Failed to update subscription. Please try again.');
    }
  };

  // Handle profile update
  const handleProfileUpdate = async () => {
    try {
      setProfileErrors({});

      // Validate email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(profileData.email)) {
        setProfileErrors({ email: 'Invalid email format' });
        return;
      }

      await updateProfile({
        name: profileData.name,
        email: profileData.email
      });

      setEditMode(false);
    } catch (error) {
      console.error('Profile update failed:', error);
      setProfileErrors({ general: 'Failed to update profile' });
    }
  };

  // Handle session extension
  const handleExtendSession = async () => {
    try {
      await tokenManager.refreshToken();
      setShowSessionWarning(false);
    } catch (error) {
      console.error('Failed to extend session:', error);
      await signOut();
    }
  };

  if (loading) {
    return (
      <div className="account-page loading">
        <div className="loading-spinner">Loading account information...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="account-page error">
        <h1>Error</h1>
        <p>{error}</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="account-page error">
        <h1>Not Authenticated</h1>
        <p>Please log in to view your account.</p>
      </div>
    );
  }

  const subscriptionTiers = subscriptionService.getSubscriptionTiers();
  const upgradeOptions = subscription ? subscriptionService.getUpgradeOptions(subscription.tier) : [];
  const downgradeOptions = subscription ? subscriptionService.getDowngradeOptions(subscription.tier) : [];

  return (
    <main className="account-page" role="main">
      <div className="account-container">
        <h1>Account Management</h1>

        {/* Profile Section */}
        <section className="account-section profile-section">
          <h2>Profile Information</h2>
          <div className="profile-info">
            {editMode ? (
              <div className="profile-edit">
                <div className="form-group">
                  <label htmlFor="name">Display Name</label>
                  <input
                    id="name"
                    type="text"
                    value={profileData.name}
                    onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))}
                    className={profileErrors.name ? 'error' : ''}
                  />
                  {profileErrors.name && <span className="error-text">{profileErrors.name}</span>}
                </div>
                <div className="form-group">
                  <label htmlFor="email">Email</label>
                  <input
                    id="email"
                    type="email"
                    value={profileData.email}
                    onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                    className={profileErrors.email ? 'error' : ''}
                  />
                  {profileErrors.email && <span className="error-text">{profileErrors.email}</span>}
                </div>
                {profileErrors.general && <div className="error-text">{profileErrors.general}</div>}
                <div className="profile-actions">
                  <button onClick={handleProfileUpdate} className="btn btn-primary">Save</button>
                  <button onClick={() => setEditMode(false)} className="btn btn-secondary">Cancel</button>
                </div>
              </div>
            ) : (
              <div className="profile-display">
                <div className="profile-field">
                  <label>Display Name:</label>
                  <span>{user.attributes?.name || user.username || 'Not set'}</span>
                </div>
                <div className="profile-field">
                  <label>Email:</label>
                  <span>{user.email || user.attributes?.email || 'Not set'}</span>
                </div>
                <div className="profile-field">
                  <label>Account Created:</label>
                  <span>{user.attributes?.created_at ? new Date(user.attributes.created_at).toLocaleDateString() : 'Unknown'}</span>
                </div>
                {user.attributes?.last_login && (
                  <div className="profile-field">
                    <label>Last Login:</label>
                    <span>{new Date(user.attributes.last_login).toLocaleString()}</span>
                  </div>
                )}
                <button onClick={() => setEditMode(true)} className="btn btn-secondary">Edit Profile</button>
              </div>
            )}
          </div>
        </section>

        {/* Subscription Section */}
        <section className="account-section subscription-section">
          <h2>Subscription</h2>
          {subscriptionLoading ? (
            <div className="loading-text">Loading subscription information...</div>
          ) : subscription ? (
            <div className="subscription-info">
              <div className="current-subscription">
                <h3>Current Plan: {subscription.tier}</h3>
                <p>Status: <span className={`status ${subscription.status}`}>{subscription.status}</span></p>
                {subscription.nextBillingDate && (
                  <p>Next billing: {new Date(subscription.nextBillingDate).toLocaleDateString()}</p>
                )}
              </div>

              <div className="subscription-features">
                <h4>Your Features</h4>
                <ul>
                  {subscriptionService.getSubscriptionFeatures(subscription.tier).map(feature => (
                    <li key={feature}>{feature.replace(/_/g, ' ')}</li>
                  ))}
                </ul>
              </div>

              <div className="subscription-limits">
                <h4>Your Limits</h4>
                <ul>
                  {Object.entries(subscriptionService.getSubscriptionLimits(subscription.tier)).map(([key, value]) => (
                    <li key={key}>{key}: {value}</li>
                  ))}
                </ul>
              </div>

              <div className="subscription-actions">
                {upgradeOptions.length > 0 && (
                  <div className="upgrade-options">
                    <h4>Upgrade Options</h4>
                    {upgradeOptions.map(tier => (
                      <button
                        key={tier.name}
                        onClick={() => handleSubscriptionChange(tier.name)}
                        className="btn btn-primary"
                      >
                        Upgrade to {tier.name} - {subscriptionService.formatPrice(tier.price)}/month
                      </button>
                    ))}
                  </div>
                )}

                {downgradeOptions.length > 0 && (
                  <div className="downgrade-options">
                    <h4>Downgrade Options</h4>
                    {downgradeOptions.map(tier => (
                      <button
                        key={tier.name}
                        onClick={() => handleSubscriptionChange(tier.name)}
                        className="btn btn-secondary"
                      >
                        Downgrade to {tier.name} - {subscriptionService.formatPrice(tier.price)}/month
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="subscription-error">Failed to load subscription information</div>
          )}
        </section>

        {/* Data Export Section */}
        <section className="account-section export-section">
          <h2>Data Export</h2>
          <p>Download all your data in JSON format for data portability.</p>
          
          {exportProgress ? (
            <div className="export-progress">
              {exportProgress.status === 'preparing' && <p>Preparing your data for export...</p>}
              {exportProgress.status === 'processing' && <p>Processing export file...</p>}
              {exportProgress.status === 'completed' && <p className="success">Export completed! Download should start automatically.</p>}
              {exportProgress.status === 'error' && <p className="error">Export failed: {exportProgress.error}</p>}
            </div>
          ) : (
            <button
              onClick={handleExportData}
              disabled={exportLoading}
              className="btn btn-secondary"
            >
              {exportLoading ? 'Exporting...' : 'Export Data'}
            </button>
          )}
        </section>

        {/* Danger Zone */}
        <section className="account-section danger-section">
          <h2>Danger Zone</h2>
          <div className="danger-actions">
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="btn btn-danger"
            >
              Delete Account
            </button>
          </div>
        </section>

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="modal-overlay" onClick={() => setShowDeleteConfirm(false)}>
            <div className="modal delete-modal" onClick={e => e.stopPropagation()}>
              <h3>Delete Your Account</h3>
              <p>This action cannot be undone. All your data will be permanently deleted.</p>
              <p>Type <strong>DELETE</strong> to confirm:</p>
              <input
                type="text"
                placeholder="Type DELETE to confirm"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                className="delete-confirm-input"
              />
              <div className="modal-actions">
                <button
                  onClick={handleDeleteAccount}
                  disabled={deleteConfirmText !== 'DELETE'}
                  className="btn btn-danger"
                >
                  Confirm Delete
                </button>
                <button
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    setDeleteConfirmText('');
                  }}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Session Timeout Warning */}
        <SessionTimeoutWarning
          isVisible={showSessionWarning}
          timeRemaining={sessionTimeRemaining}
          onExtendSession={handleExtendSession}
          onLogout={signOut}
          onClose={() => setShowSessionWarning(false)}
        />
      </div>
    </main>
  );
};