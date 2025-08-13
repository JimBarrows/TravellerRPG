/**
 * Data Export Service
 * Handles exporting user data for GDPR compliance and data portability
 */

import { tokenManager } from '../utils/tokenUtils';

class DataExportService {
  /**
   * Exports all user data and provides download link
   * @param {string} userId - User ID to export data for
   * @returns {Promise<object>} Export result with download URL
   */
  async exportUserData(userId) {
    try {
      const tokens = await tokenManager.getTokens();
      if (!tokens || !tokens.accessToken) {
        throw new Error('Authentication required');
      }

      const response = await fetch('/api/user/export', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${tokens.accessToken}`
        },
        body: JSON.stringify({ userId })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Export failed');
      }

      const result = await response.json();
      return {
        downloadUrl: result.downloadUrl,
        expiresAt: new Date(result.expiresAt),
        fileSize: result.fileSize,
        exportId: result.exportId
      };
    } catch (error) {
      console.error('Data export error:', error);
      throw error;
    }
  }

  /**
   * Gets the progress of an ongoing export
   * @param {string} exportId - Export ID to check progress for
   * @returns {Promise<object>} Export progress information
   */
  async getExportProgress(exportId) {
    try {
      const tokens = await tokenManager.getTokens();
      if (!tokens || !tokens.accessToken) {
        throw new Error('Authentication required');
      }

      const response = await fetch(`/api/user/export/${exportId}/progress`, {
        headers: {
          'Authorization': `Bearer ${tokens.accessToken}`
        }
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to get export progress');
      }

      return await response.json();
    } catch (error) {
      console.error('Export progress error:', error);
      throw error;
    }
  }

  /**
   * Prepares user data for export in a comprehensive format
   * @param {object} user - User object to export data for
   * @returns {Promise<object>} Prepared export data
   */
  async prepareExportData(user) {
    try {
      const exportData = {
        // User information (sanitized)
        user: this.sanitizeUserData(user),
        
        // Export metadata
        exportMetadata: {
          exportDate: new Date().toISOString(),
          version: '1.0',
          format: 'JSON',
          privacyNotice: 'This export contains all your personal data stored in the Traveller RPG application as per data portability rights under GDPR.',
          dataCategories: [
            'Profile Information',
            'Characters',
            'Campaigns',
            'Settings',
            'Activity Logs'
          ]
        },

        // Application data
        characters: await this.getUserCharacters(user.id),
        campaigns: await this.getUserCampaigns(user.id),
        settings: await this.getUserSettings(user.id),
        activityLogs: await this.getUserActivityLogs(user.id),

        // Metadata about the export
        statistics: {
          totalCharacters: 0,
          totalCampaigns: 0,
          accountAge: this.calculateAccountAge(user.attributes?.created_at),
          lastLogin: user.attributes?.last_login
        }
      };

      // Calculate statistics
      exportData.statistics.totalCharacters = exportData.characters.length;
      exportData.statistics.totalCampaigns = exportData.campaigns.length;

      return exportData;
    } catch (error) {
      console.error('Error preparing export data:', error);
      throw error;
    }
  }

  /**
   * Sanitizes user data by removing sensitive information
   * @param {object} user - Raw user object
   * @returns {object} Sanitized user data
   */
  sanitizeUserData(user) {
    const sanitized = { ...user };
    
    // Remove sensitive fields that shouldn't be exported
    delete sanitized.internalId;
    delete sanitized.passwordHash;
    delete sanitized.tokens;
    delete sanitized.sessionData;
    delete sanitized.internalNotes;
    
    return sanitized;
  }

  /**
   * Downloads export data as a file
   * @param {object} data - Data to download
   * @param {string} filename - Name of the file
   */
  downloadExportFile(data, filename = 'traveller-rpg-export.json') {
    try {
      const jsonString = this.formatExportForDownload(data);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();

      // Cleanup
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download error:', error);
      throw new Error('Failed to download export file');
    }
  }

  /**
   * Formats export data for download
   * @param {object} data - Data to format
   * @returns {string} Formatted JSON string
   */
  formatExportForDownload(data) {
    try {
      // Use JSON.stringify with replacer to handle circular references
      return JSON.stringify(data, (key, value) => {
        // Handle circular references
        if (typeof value === 'object' && value !== null) {
          if (this._seen && this._seen.has(value)) {
            return '[Circular Reference]';
          }
          if (!this._seen) {
            this._seen = new WeakSet();
          }
          this._seen.add(value);
        }
        return value;
      }, 2);
    } catch (error) {
      console.error('Error formatting export data:', error);
      // Fallback to simple stringify
      return JSON.stringify(data, null, 2);
    } finally {
      // Clean up the seen set
      this._seen = null;
    }
  }

  /**
   * Validates export data structure
   * @param {object} data - Data to validate
   * @returns {boolean} True if data is valid
   */
  validateExportData(data) {
    try {
      // Check required top-level properties
      const requiredFields = ['user', 'exportMetadata'];
      for (const field of requiredFields) {
        if (!data.hasOwnProperty(field)) {
          return false;
        }
      }

      // Check user data
      if (!data.user || typeof data.user !== 'object') {
        return false;
      }

      // Check export metadata
      if (!data.exportMetadata || !data.exportMetadata.exportDate) {
        return false;
      }

      return true;
    } catch (error) {
      console.error('Export validation error:', error);
      return false;
    }
  }

  /**
   * Calculates the size of export data in bytes
   * @param {object} data - Data to calculate size for
   * @returns {number} Size in bytes
   */
  getExportFileSize(data) {
    try {
      const jsonString = JSON.stringify(data);
      return new Blob([jsonString]).size;
    } catch (error) {
      console.error('Error calculating file size:', error);
      return 0;
    }
  }

  /**
   * Calculates account age from creation date
   * @param {string} createdAt - ISO date string
   * @returns {object} Account age information
   */
  calculateAccountAge(createdAt) {
    if (!createdAt) {
      return null;
    }

    try {
      const created = new Date(createdAt);
      const now = new Date();
      const diffMs = now - created;
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      const diffMonths = Math.floor(diffDays / 30);
      const diffYears = Math.floor(diffDays / 365);

      return {
        days: diffDays,
        months: diffMonths,
        years: diffYears,
        createdDate: createdAt
      };
    } catch (error) {
      console.error('Error calculating account age:', error);
      return null;
    }
  }

  // Mock data fetching methods (would integrate with actual APIs)

  /**
   * Fetches user characters (mock implementation)
   * @param {string} userId - User ID
   * @returns {Promise<Array>} User characters
   */
  async getUserCharacters(userId) {
    // Mock implementation - would fetch from actual API
    return [];
  }

  /**
   * Fetches user campaigns (mock implementation)
   * @param {string} userId - User ID
   * @returns {Promise<Array>} User campaigns
   */
  async getUserCampaigns(userId) {
    // Mock implementation - would fetch from actual API
    return [];
  }

  /**
   * Fetches user settings (mock implementation)
   * @param {string} userId - User ID
   * @returns {Promise<object>} User settings
   */
  async getUserSettings(userId) {
    // Mock implementation - would fetch from actual API
    return {
      theme: 'dark',
      notifications: true,
      language: 'en'
    };
  }

  /**
   * Fetches user activity logs (mock implementation)
   * @param {string} userId - User ID
   * @returns {Promise<Array>} User activity logs
   */
  async getUserActivityLogs(userId) {
    // Mock implementation - would fetch from actual API
    return [];
  }
}

export default new DataExportService();