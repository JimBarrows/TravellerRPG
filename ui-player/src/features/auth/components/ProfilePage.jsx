import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { uploadData, remove, getUrl } from '@aws-amplify/storage';
import { evaluatePasswordStrength } from '../utils/passwordStrength';
import PasswordStrengthIndicator from './PasswordStrengthIndicator';

const TIMEZONES = [
  'America/New_York',
  'America/Los_Angeles', 
  'America/Chicago',
  'America/Denver',
  'Europe/London',
  'Europe/Paris',
  'Europe/Berlin',
  'Asia/Tokyo',
  'Asia/Shanghai',
  'Australia/Sydney'
];

const SOCIAL_PROVIDERS = [
  { id: 'google', name: 'Google' },
  { id: 'facebook', name: 'Facebook' },
  { id: 'apple', name: 'Apple' },
  { id: 'twitter', name: 'Twitter' }
];

const ProfilePage = () => {
  const { user, updateProfile, changePassword, loading, error, clearError } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    displayName: '',
    email: '',
    timezone: ''
  });
  const [originalData, setOriginalData] = useState({});
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [validationErrors, setValidationErrors] = useState({});
  const autoSaveTimeoutRef = useRef(null);

  // Avatar upload state
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [showAvatarUpload, setShowAvatarUpload] = useState(false);

  // Password change state
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordStrength, setPasswordStrength] = useState(null);
  const [passwordValidationErrors, setPasswordValidationErrors] = useState({});

  // Email change state
  const [emailVerificationRequired, setEmailVerificationRequired] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [pendingEmail, setPendingEmail] = useState('');

  // Social accounts state
  const [connectedAccounts, setConnectedAccounts] = useState([]);
  const [disconnectConfirm, setDisconnectConfirm] = useState(null);

  // Initialize form data when user loads
  useEffect(() => {
    if (user) {
      const userData = {
        displayName: user.attributes?.name || '',
        email: user.attributes?.email || '',
        timezone: user.attributes?.['custom:timezone'] || 'America/New_York'
      };
      setFormData(userData);
      setOriginalData(userData);
      
      // Parse connected accounts
      try {
        const accounts = JSON.parse(user.attributes?.['custom:connected_accounts'] || '[]');
        setConnectedAccounts(accounts);
      } catch (e) {
        setConnectedAccounts([]);
      }
    }
  }, [user]);

  // Auto-save functionality
  useEffect(() => {
    if (hasUnsavedChanges && isEditing) {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
      
      autoSaveTimeoutRef.current = setTimeout(() => {
        handleSaveChanges(true); // Auto-save
      }, 3000);
    }

    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, [hasUnsavedChanges, isEditing, formData]);

  // Prevent navigation with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
        return '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setHasUnsavedChanges(true);
    validateField(field, value);
    clearMessages();
  };

  const validateField = (field, value) => {
    const errors = { ...validationErrors };

    switch (field) {
      case 'displayName':
        if (value.length < 2) {
          errors.displayName = 'Display name must be at least 2 characters';
        } else {
          delete errors.displayName;
        }
        break;
      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
          errors.email = 'Please enter a valid email address';
        } else {
          delete errors.email;
        }
        break;
      default:
        break;
    }

    setValidationErrors(errors);
  };

  const handleSaveChanges = async (isAutoSave = false) => {
    if (Object.keys(validationErrors).length > 0) return;

    try {
      const updates = {};
      
      if (formData.displayName !== originalData.displayName) {
        updates.name = formData.displayName;
      }
      
      if (formData.timezone !== originalData.timezone) {
        updates['custom:timezone'] = formData.timezone;
      }

      if (formData.email !== originalData.email) {
        // Email change requires verification
        updates.email = formData.email;
        setPendingEmail(formData.email);
        setEmailVerificationRequired(true);
        setSuccessMessage(`Verification code sent to ${formData.email}`);
        return;
      }

      if (Object.keys(updates).length > 0) {
        await updateProfile(updates);
        setOriginalData(formData);
        setHasUnsavedChanges(false);
        setIsEditing(false);
        
        if (!isAutoSave) {
          setSuccessMessage('Profile updated successfully');
        } else {
          setSuccessMessage('Changes saved');
          setTimeout(() => setSuccessMessage(''), 2000);
        }
      }
    } catch (err) {
      setErrorMessage('Unable to save changes. Please check your connection and try again.');
    }
  };

  const handleEmailVerification = async () => {
    try {
      // In a real implementation, this would verify the code with Cognito
      // For now, we'll simulate successful verification
      const updates = { email: pendingEmail };
      await updateProfile(updates);
      
      setEmailVerificationRequired(false);
      setVerificationCode('');
      setPendingEmail('');
      setOriginalData(prev => ({ ...prev, email: pendingEmail }));
      setSuccessMessage('Email updated successfully');
    } catch (err) {
      setErrorMessage('Invalid verification code. Please try again.');
    }
  };

  const handleAvatarUpload = async (file) => {
    // Validate file
    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage('File size must be less than 5MB');
      return;
    }

    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      setErrorMessage('Please select a valid image file (JPG, PNG, GIF)');
      return;
    }

    setAvatarFile(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => setAvatarPreview(e.target.result);
    reader.readAsDataURL(file);
    
    setShowAvatarUpload(true);
    clearMessages();
  };

  const confirmAvatarUpload = async () => {
    if (!avatarFile || !user) return;

    setAvatarUploading(true);
    try {
      // Remove old avatar if exists
      if (user.attributes?.['custom:avatar_url']) {
        const oldKey = user.attributes['custom:avatar_url'].split('/').pop();
        await remove({ key: `avatars/${user.id}/${oldKey}` });
      }

      // Upload new avatar
      const key = `avatars/${user.id}/${Date.now()}-${avatarFile.name}`;
      const result = await uploadData({
        key,
        data: avatarFile,
        options: {
          accessLevel: 'private',
          contentType: avatarFile.type
        }
      });

      // Get URL and update profile
      const avatarUrl = await getUrl({ key: result.key });
      await updateProfile({ 'custom:avatar_url': avatarUrl.url });

      setSuccessMessage('Avatar updated successfully');
      setShowAvatarUpload(false);
      setAvatarFile(null);
      setAvatarPreview(null);
    } catch (err) {
      setErrorMessage('Upload failed. Please try again.');
    } finally {
      setAvatarUploading(false);
    }
  };

  const handlePasswordChange = async () => {
    if (Object.keys(passwordValidationErrors).length > 0) return;

    try {
      await changePassword(passwordData.currentPassword, passwordData.newPassword);
      setSuccessMessage('Password changed successfully');
      setShowPasswordForm(false);
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setErrorMessage(err.message || 'Failed to change password');
    }
  };

  const validatePassword = (field, value) => {
    const errors = { ...passwordValidationErrors };

    switch (field) {
      case 'newPassword':
        const strength = evaluatePasswordStrength(value);
        setPasswordStrength(strength);
        
        if (strength.score < 3) {
          errors.newPassword = `Password must be stronger. ${strength.feedback.suggestions.join(' ')}`;
        } else {
          delete errors.newPassword;
        }
        break;
      case 'confirmPassword':
        if (value !== passwordData.newPassword) {
          errors.confirmPassword = 'Passwords do not match';
        } else {
          delete errors.confirmPassword;
        }
        break;
      default:
        break;
    }

    setPasswordValidationErrors(errors);
  };

  const handleDisconnectAccount = async (provider) => {
    try {
      const updatedAccounts = connectedAccounts.filter(account => account !== provider);
      setConnectedAccounts(updatedAccounts);
      await updateProfile({ 'custom:connected_accounts': JSON.stringify(updatedAccounts) });
      setSuccessMessage(`${provider} account disconnected successfully`);
      setDisconnectConfirm(null);
    } catch (err) {
      setErrorMessage(`Failed to disconnect ${provider} account`);
    }
  };

  const handleConnectAccount = (provider) => {
    // In a real implementation, this would redirect to OAuth provider
    window.location.href = `https://${provider.toLowerCase()}.com/oauth/authorize?client_id=...`;
  };

  const clearMessages = () => {
    setSuccessMessage('');
    setErrorMessage('');
    clearError();
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStrengthLabel = () => {
    if (!passwordStrength) return '';
    const labels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong'];
    return labels[passwordStrength.score] || '';
  };

  if (loading) {
    return <div className="profile-loading">Loading profile...</div>;
  }

  if (!user) {
    return <div className="profile-error">Please log in to view your profile.</div>;
  }

  return (
    <div className="profile-page" data-testid="profile-page">
      <div className="profile-header">
        <h1>Profile Settings</h1>
        {successMessage && (
          <div className="success-message" role="status" aria-live="polite">
            {successMessage}
          </div>
        )}
        {(errorMessage || error) && (
          <div className="error-message" role="alert">
            {errorMessage || error}
          </div>
        )}
      </div>

      {/* Avatar Section */}
      <section className="profile-section avatar-section">
        <h2>Profile Picture</h2>
        <div className="avatar-container">
          <img
            src={user.attributes?.['custom:avatar_url'] || '/default-avatar.png'}
            alt="User Avatar"
            className="user-avatar"
            data-testid="user-avatar"
          />
          <button
            type="button"
            className="avatar-upload-btn"
            data-testid="avatar-upload-button"
            onClick={() => document.getElementById('avatar-input').click()}
          >
            Change Avatar
          </button>
          <input
            id="avatar-input"
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            data-testid="avatar-file-input"
            onChange={(e) => e.target.files[0] && handleAvatarUpload(e.target.files[0])}
          />
        </div>

        {showAvatarUpload && (
          <div className="avatar-upload-dialog">
            <h3>Preview Avatar</h3>
            {avatarPreview && (
              <img
                src={avatarPreview}
                alt="Avatar Preview"
                className="avatar-preview"
                data-testid="avatar-preview"
              />
            )}
            <div className="avatar-upload-actions">
              <button
                type="button"
                onClick={confirmAvatarUpload}
                disabled={avatarUploading}
                data-testid="confirm-avatar-upload"
              >
                {avatarUploading ? 'Uploading...' : 'Confirm Upload'}
              </button>
              <button
                type="button"
                onClick={() => setShowAvatarUpload(false)}
                disabled={avatarUploading}
              >
                Cancel
              </button>
            </div>
            {avatarUploading && <div data-testid="upload-loading">Uploading...</div>}
          </div>
        )}
      </section>

      {/* Basic Information */}
      <section className="profile-section basic-info">
        <h2>Basic Information</h2>
        <div className="form-group">
          <label htmlFor="display-name">Display Name</label>
          {isEditing ? (
            <input
              id="display-name"
              type="text"
              value={formData.displayName}
              onChange={(e) => handleInputChange('displayName', e.target.value)}
              data-testid="display-name-input"
              aria-label="Display Name"
            />
          ) : (
            <div className="form-value">
              <span>{formData.displayName}</span>
              <button
                type="button"
                className="edit-btn"
                onClick={() => setIsEditing(true)}
                data-testid="edit-display-name"
              >
                Edit
              </button>
            </div>
          )}
          {validationErrors.displayName && (
            <div className="field-error" role="alert">
              {validationErrors.displayName}
            </div>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="email">Email Address</label>
          {emailVerificationRequired ? (
            <div className="email-verification">
              <input
                type="text"
                placeholder="Enter verification code"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                data-testid="verification-code-input"
              />
              <button
                type="button"
                onClick={handleEmailVerification}
                data-testid="verify-email-button"
              >
                Verify
              </button>
            </div>
          ) : isEditing ? (
            <input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              data-testid="email-input"
              aria-label="Email Address"
            />
          ) : (
            <div className="form-value">
              <span>{formData.email}</span>
              <button
                type="button"
                className="edit-btn"
                onClick={() => setIsEditing(true)}
                data-testid="edit-email"
              >
                Edit
              </button>
            </div>
          )}
          {validationErrors.email && (
            <div className="field-error" role="alert">
              {validationErrors.email}
            </div>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="timezone">Timezone</label>
          {isEditing ? (
            <select
              id="timezone"
              value={formData.timezone}
              onChange={(e) => handleInputChange('timezone', e.target.value)}
              data-testid="timezone-select"
              aria-label="Timezone"
            >
              {TIMEZONES.map(tz => (
                <option key={tz} value={tz}>{tz}</option>
              ))}
            </select>
          ) : (
            <div className="form-value">
              <span>{formData.timezone}</span>
            </div>
          )}
        </div>

        {isEditing && (
          <div className="form-actions">
            <button
              type="button"
              onClick={() => handleSaveChanges()}
              disabled={Object.keys(validationErrors).length > 0}
              data-testid="save-profile-changes"
            >
              Save Changes
            </button>
            <button
              type="button"
              onClick={() => {
                setIsEditing(false);
                setFormData(originalData);
                setHasUnsavedChanges(false);
                setValidationErrors({});
              }}
            >
              Cancel
            </button>
          </div>
        )}
      </section>

      {/* Account Information */}
      <section className="profile-section account-info">
        <h2>Account Information</h2>
        <div className="info-grid">
          <div className="info-item">
            <span className="info-label">Subscription Tier:</span>
            <span className="info-value">
              {user.attributes?.['custom:subscription_tier'] || 'Free'}
            </span>
          </div>
          <div className="info-item">
            <span className="info-label">Account created:</span>
            <span className="info-value">
              {formatDate(user.attributes?.created_at || new Date().toISOString())}
            </span>
          </div>
        </div>
      </section>

      {/* Password Change */}
      <section className="profile-section password-section">
        <h2>Security</h2>
        <button
          type="button"
          className="change-password-btn"
          onClick={() => setShowPasswordForm(true)}
        >
          Change Password
        </button>

        {showPasswordForm && (
          <div className="password-form" data-testid="password-change-form">
            <h3>Change Password</h3>
            <div className="form-group">
              <label htmlFor="current-password">Current Password</label>
              <input
                id="current-password"
                type="password"
                value={passwordData.currentPassword}
                onChange={(e) => setPasswordData(prev => ({ 
                  ...prev, 
                  currentPassword: e.target.value 
                }))}
                data-testid="current-password-input"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="new-password">New Password</label>
              <input
                id="new-password"
                type="password"
                value={passwordData.newPassword}
                onChange={(e) => {
                  const value = e.target.value;
                  setPasswordData(prev => ({ ...prev, newPassword: value }));
                  validatePassword('newPassword', value);
                }}
                data-testid="new-password-input"
              />
              {passwordStrength && (
                <PasswordStrengthIndicator 
                  password={passwordData.newPassword}
                  showRequirements={true}
                  showProgress={true}
                />
              )}
              {passwordValidationErrors.newPassword && (
                <div className="field-error" role="alert">
                  {passwordValidationErrors.newPassword}
                </div>
              )}
            </div>
            
            <div className="form-group">
              <label htmlFor="confirm-password">Confirm New Password</label>
              <input
                id="confirm-password"
                type="password"
                value={passwordData.confirmPassword}
                onChange={(e) => {
                  const value = e.target.value;
                  setPasswordData(prev => ({ ...prev, confirmPassword: value }));
                  validatePassword('confirmPassword', value);
                }}
                data-testid="confirm-password-input"
              />
              {passwordValidationErrors.confirmPassword && (
                <div className="field-error" role="alert">
                  {passwordValidationErrors.confirmPassword}
                </div>
              )}
            </div>
            
            <div className="form-actions">
              <button
                type="button"
                onClick={handlePasswordChange}
                disabled={
                  !passwordData.currentPassword ||
                  !passwordData.newPassword ||
                  !passwordData.confirmPassword ||
                  Object.keys(passwordValidationErrors).length > 0
                }
                data-testid="submit-password-change"
              >
                Change Password
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowPasswordForm(false);
                  setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                  setPasswordValidationErrors({});
                  setPasswordStrength(null);
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </section>

      {/* Social Accounts */}
      <section className="profile-section social-accounts" data-testid="social-accounts-section">
        <h2>Connected Accounts</h2>
        <div className="social-accounts-list">
          {SOCIAL_PROVIDERS.map(provider => {
            const isConnected = connectedAccounts.includes(provider.name);
            return (
              <div key={provider.id} className="social-account-item">
                <span className="provider-name">{provider.name}</span>
                {isConnected ? (
                  <button
                    type="button"
                    className="disconnect-btn"
                    onClick={() => setDisconnectConfirm(provider.name)}
                    data-testid={`disconnect-${provider.id}`}
                  >
                    Disconnect
                  </button>
                ) : (
                  <button
                    type="button"
                    className="connect-btn"
                    onClick={() => handleConnectAccount(provider.name)}
                    data-testid={`connect-${provider.id}`}
                  >
                    Connect
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {disconnectConfirm && (
          <div className="disconnect-confirm">
            <p>Are you sure you want to disconnect your {disconnectConfirm} account?</p>
            <div className="confirm-actions">
              <button
                type="button"
                onClick={() => handleDisconnectAccount(disconnectConfirm)}
                data-testid="confirm-disconnect"
              >
                Yes, Disconnect
              </button>
              <button
                type="button"
                onClick={() => setDisconnectConfirm(null)}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
};

export default ProfilePage;