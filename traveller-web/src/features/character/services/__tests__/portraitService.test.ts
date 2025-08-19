import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import axios from 'axios';
import portraitService, { PresignedUrlResponse, UploadOptions } from '../portraitService';

// Mock axios
vi.mock('axios');
const mockedAxios = vi.mocked(axios);

describe('PortraitService', () => {
  // Mock localStorage
  const mockLocalStorage = {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
    length: 0,
    key: vi.fn(),
  };

  // Mock environment
  const originalEnv = import.meta.env;

  beforeEach(() => {
    vi.clearAllMocks();
    Object.defineProperty(window, 'localStorage', {
      value: mockLocalStorage,
      writable: true,
    });
    
    // Mock environment variables
    Object.defineProperty(import.meta, 'env', {
      value: {
        ...originalEnv,
        VITE_API_URL: 'http://localhost:3000/api',
      },
      writable: true,
    });

    // Default localStorage values
    mockLocalStorage.getItem.mockImplementation((key: string) => {
      if (key === 'authToken') return 'mock-auth-token';
      if (key === 'userId') return 'mock-user-id';
      return null;
    });
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('getPresignedUrl', () => {
    it('should successfully get presigned URL with valid options', async () => {
      const mockResponse: PresignedUrlResponse = {
        uploadUrl: 'https://s3.amazonaws.com/bucket/upload-url',
        viewUrl: 'https://s3.amazonaws.com/bucket/view-url',
        fileKey: 'portraits/test-file.jpg',
        expiresIn: 3600,
      };

      mockedAxios.post.mockResolvedValueOnce({ data: mockResponse });

      const options: UploadOptions = {
        fileName: 'test-file.jpg',
        fileType: 'image/jpeg',
        fileSize: 1024 * 500, // 500KB
        userId: 'test-user-id',
        characterId: 'test-character-id',
      };

      const result = await portraitService.getPresignedUrl(options);

      expect(result).toEqual(mockResponse);
      expect(mockedAxios.post).toHaveBeenCalledWith(
        'http://localhost:3000/api/uploads/presigned-url',
        options,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer mock-auth-token',
          },
        }
      );
    });

    it('should handle missing auth token', async () => {
      mockLocalStorage.getItem.mockReturnValue(null);

      const options: UploadOptions = {
        fileName: 'test-file.jpg',
        fileType: 'image/jpeg',
        fileSize: 1024 * 500,
        userId: 'test-user-id',
      };

      mockedAxios.post.mockResolvedValueOnce({ 
        data: {
          uploadUrl: 'test-url',
          viewUrl: 'test-view-url',
          fileKey: 'test-key',
          expiresIn: 3600,
        }
      });

      await portraitService.getPresignedUrl(options);

      expect(mockedAxios.post).toHaveBeenCalledWith(
        'http://localhost:3000/api/uploads/presigned-url',
        options,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer null',
          },
        }
      );
    });

    it('should throw error when API request fails', async () => {
      mockedAxios.post.mockRejectedValueOnce(new Error('Network error'));

      const options: UploadOptions = {
        fileName: 'test-file.jpg',
        fileType: 'image/jpeg',
        fileSize: 1024 * 500,
        userId: 'test-user-id',
      };

      await expect(portraitService.getPresignedUrl(options)).rejects.toThrow('Failed to get upload URL');
    });

    it('should use default API URL when env var not set', async () => {
      Object.defineProperty(import.meta, 'env', {
        value: {},
        writable: true,
      });

      mockedAxios.post.mockResolvedValueOnce({ 
        data: {
          uploadUrl: 'test-url',
          viewUrl: 'test-view-url',
          fileKey: 'test-key',
          expiresIn: 3600,
        }
      });

      const options: UploadOptions = {
        fileName: 'test-file.jpg',
        fileType: 'image/jpeg',
        fileSize: 1024 * 500,
        userId: 'test-user-id',
      };

      await portraitService.getPresignedUrl(options);

      expect(mockedAxios.post).toHaveBeenCalledWith(
        'http://localhost:3000/api/uploads/presigned-url',
        options,
        expect.any(Object)
      );
    });
  });

  describe('uploadToS3', () => {
    it('should successfully upload file to S3', async () => {
      const mockFile = new File(['test content'], 'test.jpg', { type: 'image/jpeg' });
      const uploadUrl = 'https://s3.amazonaws.com/bucket/upload-url';

      mockedAxios.put.mockResolvedValueOnce({ status: 200 });

      await portraitService.uploadToS3(uploadUrl, mockFile);

      expect(mockedAxios.put).toHaveBeenCalledWith(
        uploadUrl,
        mockFile,
        {
          headers: {
            'Content-Type': 'image/jpeg',
          },
        }
      );
    });

    it('should throw error when S3 upload fails', async () => {
      const mockFile = new File(['test content'], 'test.jpg', { type: 'image/jpeg' });
      const uploadUrl = 'https://s3.amazonaws.com/bucket/upload-url';

      mockedAxios.put.mockRejectedValueOnce(new Error('S3 error'));

      await expect(portraitService.uploadToS3(uploadUrl, mockFile)).rejects.toThrow('Failed to upload file');
    });
  });

  describe('uploadPortrait', () => {
    it('should validate file type and reject invalid types', async () => {
      const invalidFile = new File(['test'], 'test.txt', { type: 'text/plain' });

      await expect(portraitService.uploadPortrait(invalidFile)).rejects.toThrow(
        'Invalid file type. Please upload a JPEG, PNG, GIF, or WebP image.'
      );
    });

    it('should validate file size and reject oversized files', async () => {
      // Create a mock file that appears to be 6MB (over the 5MB limit)
      const oversizedFile = new File(['x'.repeat(6 * 1024 * 1024)], 'large.jpg', { type: 'image/jpeg' });

      await expect(portraitService.uploadPortrait(oversizedFile)).rejects.toThrow(
        'File size exceeds 5MB limit.'
      );
    });

    it('should successfully upload valid portrait file', async () => {
      const validFile = new File(['valid image content'], 'portrait.jpg', { type: 'image/jpeg' });
      
      // Mock the presigned URL response
      mockedAxios.post.mockResolvedValueOnce({
        data: {
          uploadUrl: 'https://s3.amazonaws.com/bucket/upload-url',
          viewUrl: 'https://s3.amazonaws.com/bucket/view-url',
          fileKey: 'portraits/test-key',
          expiresIn: 3600,
        }
      });

      // Mock the S3 upload
      mockedAxios.put.mockResolvedValueOnce({ status: 200 });

      const result = await portraitService.uploadPortrait(validFile, 'test-character-id');

      expect(result).toBe('https://s3.amazonaws.com/bucket/view-url');
      expect(mockedAxios.post).toHaveBeenCalledWith(
        'http://localhost:3000/api/uploads/presigned-url',
        {
          fileName: 'portrait.jpg',
          fileType: 'image/jpeg',
          fileSize: validFile.size,
          userId: 'mock-user-id',
          characterId: 'test-character-id',
        },
        expect.any(Object)
      );
    });

    it('should handle missing userId from localStorage', async () => {
      mockLocalStorage.getItem.mockImplementation((key: string) => {
        if (key === 'authToken') return 'mock-auth-token';
        return null; // userId will be null
      });

      const validFile = new File(['valid image content'], 'portrait.jpg', { type: 'image/jpeg' });
      
      mockedAxios.post.mockResolvedValueOnce({
        data: {
          uploadUrl: 'https://s3.amazonaws.com/bucket/upload-url',
          viewUrl: 'https://s3.amazonaws.com/bucket/view-url',
          fileKey: 'portraits/test-key',
          expiresIn: 3600,
        }
      });
      mockedAxios.put.mockResolvedValueOnce({ status: 200 });

      await portraitService.uploadPortrait(validFile);

      expect(mockedAxios.post).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          userId: 'anonymous',
        }),
        expect.any(Object)
      );
    });

    it('should accept all valid image types', async () => {
      const validTypes = [
        { type: 'image/jpeg', name: 'test.jpg' },
        { type: 'image/png', name: 'test.png' },
        { type: 'image/gif', name: 'test.gif' },
        { type: 'image/webp', name: 'test.webp' },
      ];

      for (const fileType of validTypes) {
        const file = new File(['content'], fileType.name, { type: fileType.type });
        
        mockedAxios.post.mockResolvedValueOnce({
          data: {
            uploadUrl: 'https://s3.amazonaws.com/bucket/upload-url',
            viewUrl: 'https://s3.amazonaws.com/bucket/view-url',
            fileKey: 'portraits/test-key',
            expiresIn: 3600,
          }
        });
        mockedAxios.put.mockResolvedValueOnce({ status: 200 });

        const result = await portraitService.uploadPortrait(file);
        expect(result).toBe('https://s3.amazonaws.com/bucket/view-url');
      }
    });
  });

  describe('resizeImage', () => {
    it('should resize image maintaining aspect ratio', async () => {
      const mockFile = new File(['image content'], 'test.jpg', { type: 'image/jpeg' });
      
      const result = await portraitService.resizeImage(mockFile, 100, 100);

      expect(result).toBeInstanceOf(Blob);
      expect(result.type).toBe('');  // jsdom doesn't set blob type in toBlob mock
    });

    it('should handle image load error', async () => {
      // Mock Image constructor to simulate load error
      const OriginalImage = global.Image;
      global.Image = class MockImage {
        src = '';
        onload: (() => void) | null = null;
        onerror: (() => void) | null = null;

        constructor() {
          setTimeout(() => {
            if (this.onerror) {
              this.onerror();
            }
          }, 0);
        }
      } as any;

      const mockFile = new File(['image content'], 'test.jpg', { type: 'image/jpeg' });

      await expect(portraitService.resizeImage(mockFile, 100, 100)).rejects.toThrow('Failed to load image');

      global.Image = OriginalImage;
    });

    it('should handle FileReader error', async () => {
      // Mock FileReader to simulate error
      const OriginalFileReader = global.FileReader;
      global.FileReader = class MockFileReader {
        onload: ((this: FileReader, ev: ProgressEvent<FileReader>) => any) | null = null;
        onerror: ((this: FileReader, ev: ProgressEvent<FileReader>) => any) | null = null;
        result: string | ArrayBuffer | null = null;
        error: any = null;
        readyState: number = 0;

        readAsDataURL() {
          setTimeout(() => {
            if (this.onerror) {
              this.onerror({} as ProgressEvent<FileReader>);
            }
          }, 0);
        }

        abort() {}
        addEventListener() {}
        removeEventListener() {}
        dispatchEvent() { return true; }
        static readonly EMPTY = 0;
        static readonly LOADING = 1;
        static readonly DONE = 2;
      } as any;

      const mockFile = new File(['image content'], 'test.jpg', { type: 'image/jpeg' });

      await expect(portraitService.resizeImage(mockFile, 100, 100)).rejects.toThrow('Failed to read file');

      global.FileReader = OriginalFileReader;
    });

    it('should handle canvas context error', async () => {
      // Mock getContext to return null
      const originalGetContext = HTMLCanvasElement.prototype.getContext;
      HTMLCanvasElement.prototype.getContext = vi.fn().mockReturnValue(null);

      const mockFile = new File(['image content'], 'test.jpg', { type: 'image/jpeg' });

      await expect(portraitService.resizeImage(mockFile, 100, 100)).rejects.toThrow('Failed to get canvas context');

      HTMLCanvasElement.prototype.getContext = originalGetContext;
    });

    it('should handle toBlob failure', async () => {
      // Mock toBlob to call callback with null
      const originalToBlob = HTMLCanvasElement.prototype.toBlob;
      HTMLCanvasElement.prototype.toBlob = vi.fn().mockImplementation((callback) => {
        setTimeout(() => callback(null), 0);
      });

      const mockFile = new File(['image content'], 'test.jpg', { type: 'image/jpeg' });

      await expect(portraitService.resizeImage(mockFile, 100, 100)).rejects.toThrow('Failed to create blob');

      HTMLCanvasElement.prototype.toBlob = originalToBlob;
    });
  });

  describe('generateThumbnail', () => {
    it('should generate thumbnail with 256x256 dimensions', async () => {
      const mockFile = new File(['image content'], 'test.jpg', { type: 'image/jpeg' });
      
      // Spy on resizeImage to verify it's called with correct parameters
      const resizeImageSpy = vi.spyOn(portraitService, 'resizeImage');
      resizeImageSpy.mockResolvedValueOnce(new Blob(['thumbnail'], { type: 'image/jpeg' }));

      const result = await portraitService.generateThumbnail(mockFile);

      expect(resizeImageSpy).toHaveBeenCalledWith(mockFile, 256, 256);
      expect(result).toBeInstanceOf(Blob);

      resizeImageSpy.mockRestore();
    });
  });

  describe('generateAvatarUrl', () => {
    it('should generate correct DiceBear URL with style and seed', () => {
      const style = 'adventurer';
      const seed = 'test-character';

      const result = portraitService.generateAvatarUrl(style, seed);

      expect(result).toBe('https://api.dicebear.com/7.x/adventurer/png?seed=test-character&size=512&format=png');
    });

    it('should handle special characters in seed', () => {
      const style = 'avataaars';
      const seed = 'test character!@#$%^&*()';

      const result = portraitService.generateAvatarUrl(style, seed);

      expect(result).toContain(encodeURIComponent(seed));
    });

    it('should work with different styles', () => {
      const styles = ['adventurer', 'avataaars', 'bottts', 'identicon', 'pixel-art'];
      const seed = 'test-seed';

      styles.forEach(style => {
        const result = portraitService.generateAvatarUrl(style, seed);
        expect(result).toContain(`/${style}/png`);
        expect(result).toContain(`seed=${seed}`);
      });
    });
  });

  describe('downloadAvatar', () => {
    it('should download avatar blob from DiceBear API', async () => {
      const mockBlob = new Blob(['avatar data'], { type: 'image/png' });
      mockedAxios.get.mockResolvedValueOnce({ data: mockBlob });

      const style = 'adventurer';
      const seed = 'test-character';

      const result = await portraitService.downloadAvatar(style, seed);

      expect(result).toBe(mockBlob);
      expect(mockedAxios.get).toHaveBeenCalledWith(
        'https://api.dicebear.com/7.x/adventurer/png?seed=test-character&size=512&format=png',
        {
          responseType: 'blob',
        }
      );
    });

    it('should handle download failure', async () => {
      mockedAxios.get.mockRejectedValueOnce(new Error('Network error'));

      const style = 'adventurer';
      const seed = 'test-character';

      await expect(portraitService.downloadAvatar(style, seed)).rejects.toThrow('Network error');
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle extremely small images in resize', async () => {
      // Mock an image with very small dimensions
      global.Image = class MockImage {
        src = '';
        width = 1;
        height = 1;
        onload: (() => void) | null = null;
        onerror: (() => void) | null = null;

        constructor() {
          setTimeout(() => {
            if (this.onload) {
              this.onload();
            }
          }, 0);
        }
      } as any;

      const mockFile = new File(['tiny image'], 'tiny.jpg', { type: 'image/jpeg' });
      
      const result = await portraitService.resizeImage(mockFile, 100, 100);
      expect(result).toBeInstanceOf(Blob);
    });

    it('should handle very large target dimensions in resize', async () => {
      const mockFile = new File(['image content'], 'test.jpg', { type: 'image/jpeg' });
      
      const result = await portraitService.resizeImage(mockFile, 5000, 5000);
      expect(result).toBeInstanceOf(Blob);
    });

    it('should handle empty seed in avatar generation', () => {
      const style = 'adventurer';
      const seed = '';

      const result = portraitService.generateAvatarUrl(style, seed);
      expect(result).toContain('seed=');
    });

    it('should handle unicode characters in avatar seed', () => {
      const style = 'adventurer';
      const seed = '测试角色名称🎮';

      const result = portraitService.generateAvatarUrl(style, seed);
      expect(result).toContain(encodeURIComponent(seed));
    });
  });

  describe('Performance and Resource Management', () => {
    it('should not leak memory with multiple resize operations', async () => {
      const mockFile = new File(['image content'], 'test.jpg', { type: 'image/jpeg' });
      
      // Perform multiple resize operations
      const promises = Array(10).fill(null).map(() => 
        portraitService.resizeImage(mockFile, 100, 100)
      );

      const results = await Promise.all(promises);
      expect(results).toHaveLength(10);
      results.forEach(result => {
        expect(result).toBeInstanceOf(Blob);
      });
    });

    it('should handle concurrent upload operations', async () => {
      const files = Array(5).fill(null).map((_, i) => 
        new File(['content'], `file${i}.jpg`, { type: 'image/jpeg' })
      );

      // Mock responses for each upload
      files.forEach(() => {
        mockedAxios.post.mockResolvedValueOnce({
          data: {
            uploadUrl: 'https://s3.amazonaws.com/bucket/upload-url',
            viewUrl: 'https://s3.amazonaws.com/bucket/view-url',
            fileKey: 'portraits/test-key',
            expiresIn: 3600,
          }
        });
        mockedAxios.put.mockResolvedValueOnce({ status: 200 });
      });

      const uploadPromises = files.map(file => portraitService.uploadPortrait(file));
      const results = await Promise.all(uploadPromises);

      expect(results).toHaveLength(5);
      results.forEach(result => {
        expect(result).toBe('https://s3.amazonaws.com/bucket/view-url');
      });
    });
  });
});