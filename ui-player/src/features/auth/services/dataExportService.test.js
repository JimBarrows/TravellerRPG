import { describe, it, expect, beforeEach, vi } from 'vitest';
import dataExportService from './dataExportService';
import { useAuth } from '../context/AuthContext';

// Mock the auth context
vi.mock('../context/AuthContext', () => ({
  useAuth: vi.fn()
}));

// Mock fetch
global.fetch = vi.fn();

describe('DataExportService', () => {
  const mockUser = {
    id: 'user123',
    username: 'testuser',
    email: 'test@example.com',
    attributes: {
      name: 'Test User',
      created_at: '2023-01-01T00:00:00Z'
    }
  };

  beforeEach(() => {
    vi.clearAllMocks();
    fetch.mockClear();
  });

  describe('exportUserData', () => {
    it('should export user data successfully', async () => {
      const mockExportData = {
        user: mockUser,
        characters: [
          { id: 'char1', name: 'Character 1' },
          { id: 'char2', name: 'Character 2' }
        ],
        campaigns: [
          { id: 'camp1', name: 'Campaign 1' }
        ],
        settings: {
          theme: 'dark',
          notifications: true
        }
      };

      fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          downloadUrl: 'http://example.com/export.json',
          expiresAt: new Date(Date.now() + 3600000).toISOString(),
          fileSize: 1024
        })
      });

      const result = await dataExportService.exportUserData(mockUser.id);

      expect(fetch).toHaveBeenCalledWith('/api/user/export', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': expect.any(String)
        },
        body: JSON.stringify({ userId: mockUser.id })
      });

      expect(result).toHaveProperty('downloadUrl');
      expect(result).toHaveProperty('expiresAt');
      expect(result).toHaveProperty('fileSize');
    });

    it('should handle export errors gracefully', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: () => Promise.resolve({ error: 'Export failed' })
      });

      await expect(dataExportService.exportUserData(mockUser.id))
        .rejects.toThrow('Export failed');
    });

    it('should handle network errors', async () => {
      fetch.mockRejectedValueOnce(new Error('Network error'));

      await expect(dataExportService.exportUserData(mockUser.id))
        .rejects.toThrow('Network error');
    });
  });

  describe('getExportProgress', () => {
    it('should get export progress successfully', async () => {
      const exportId = 'export123';
      const mockProgress = {
        status: 'processing',
        progress: 50,
        estimatedTimeRemaining: 30000
      };

      fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockProgress)
      });

      const result = await dataExportService.getExportProgress(exportId);

      expect(fetch).toHaveBeenCalledWith(`/api/user/export/${exportId}/progress`, {
        headers: {
          'Authorization': expect.any(String)
        }
      });

      expect(result).toEqual(mockProgress);
    });

    it('should handle progress check errors', async () => {
      const exportId = 'export123';
      
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: () => Promise.resolve({ error: 'Export not found' })
      });

      await expect(dataExportService.getExportProgress(exportId))
        .rejects.toThrow('Export not found');
    });
  });

  describe('prepareExportData', () => {
    it('should prepare comprehensive export data', async () => {
      const exportData = await dataExportService.prepareExportData(mockUser);

      expect(exportData).toHaveProperty('user');
      expect(exportData).toHaveProperty('exportMetadata');
      expect(exportData).toHaveProperty('characters');
      expect(exportData).toHaveProperty('campaigns');
      expect(exportData).toHaveProperty('settings');

      expect(exportData.user).toEqual(mockUser);
      expect(exportData.exportMetadata).toHaveProperty('exportDate');
      expect(exportData.exportMetadata).toHaveProperty('version');
      expect(exportData.exportMetadata).toHaveProperty('format');
    });

    it('should include privacy information in export', async () => {
      const exportData = await dataExportService.prepareExportData(mockUser);

      expect(exportData.exportMetadata).toHaveProperty('privacyNotice');
      expect(exportData.exportMetadata.privacyNotice).toContain('data portability');
    });

    it('should sanitize sensitive information', async () => {
      const userWithSensitiveData = {
        ...mockUser,
        internalId: 'internal123',
        passwordHash: 'hashed_password',
        tokens: ['token1', 'token2']
      };

      const exportData = await dataExportService.prepareExportData(userWithSensitiveData);

      expect(exportData.user).not.toHaveProperty('internalId');
      expect(exportData.user).not.toHaveProperty('passwordHash');
      expect(exportData.user).not.toHaveProperty('tokens');
    });
  });

  describe('downloadExportFile', () => {
    it('should create and trigger download', () => {
      const mockData = { user: mockUser };
      const createObjectURL = vi.fn(() => 'blob:http://localhost/mock-url');
      const revokeObjectURL = vi.fn();
      
      // Mock URL methods
      global.URL.createObjectURL = createObjectURL;
      global.URL.revokeObjectURL = revokeObjectURL;

      // Mock document.createElement and click
      const mockLink = {
        href: '',
        download: '',
        click: vi.fn()
      };
      
      vi.spyOn(document, 'createElement').mockReturnValue(mockLink);
      vi.spyOn(document.body, 'appendChild').mockImplementation(() => {});
      vi.spyOn(document.body, 'removeChild').mockImplementation(() => {});

      dataExportService.downloadExportFile(mockData, 'export.json');

      expect(createObjectURL).toHaveBeenCalled();
      expect(mockLink.download).toBe('export.json');
      expect(mockLink.click).toHaveBeenCalled();
      expect(revokeObjectURL).toHaveBeenCalled();
    });
  });

  describe('validateExportData', () => {
    it('should validate complete export data', () => {
      const validData = {
        user: mockUser,
        exportMetadata: {
          exportDate: new Date().toISOString(),
          version: '1.0'
        },
        characters: [],
        campaigns: [],
        settings: {}
      };

      const isValid = dataExportService.validateExportData(validData);
      expect(isValid).toBe(true);
    });

    it('should reject invalid export data', () => {
      const invalidData = {
        user: null,
        exportMetadata: {}
      };

      const isValid = dataExportService.validateExportData(invalidData);
      expect(isValid).toBe(false);
    });

    it('should reject data without required fields', () => {
      const incompleteData = {
        user: mockUser
        // Missing exportMetadata
      };

      const isValid = dataExportService.validateExportData(incompleteData);
      expect(isValid).toBe(false);
    });
  });

  describe('getExportFileSize', () => {
    it('should calculate export file size accurately', () => {
      const mockData = {
        user: mockUser,
        characters: new Array(100).fill({ name: 'Character' }),
        campaigns: new Array(10).fill({ name: 'Campaign' })
      };

      const size = dataExportService.getExportFileSize(mockData);
      
      expect(typeof size).toBe('number');
      expect(size).toBeGreaterThan(0);
    });

    it('should handle empty data', () => {
      const emptyData = {};
      const size = dataExportService.getExportFileSize(emptyData);
      
      expect(size).toBe(0);
    });
  });

  describe('formatExportForDownload', () => {
    it('should format data as JSON by default', () => {
      const mockData = { user: mockUser };
      const formatted = dataExportService.formatExportForDownload(mockData);
      
      const parsed = JSON.parse(formatted);
      expect(parsed).toEqual(mockData);
    });

    it('should format data with proper indentation', () => {
      const mockData = { user: mockUser };
      const formatted = dataExportService.formatExportForDownload(mockData);
      
      expect(formatted).toContain('\n');
      expect(formatted).toContain('  '); // Indentation spaces
    });

    it('should handle circular references', () => {
      const circularData = { user: mockUser };
      circularData.self = circularData;
      
      const formatted = dataExportService.formatExportForDownload(circularData);
      
      // Should not throw error and should be valid JSON
      expect(() => JSON.parse(formatted)).not.toThrow();
    });
  });
});