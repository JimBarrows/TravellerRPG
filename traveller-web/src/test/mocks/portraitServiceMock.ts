import { vi } from 'vitest';
import type { PresignedUrlResponse, UploadOptions } from '../../features/character/services/portraitService';

// Mock implementation of portraitService
export const mockPortraitService = {
  getPresignedUrl: vi.fn<[UploadOptions], Promise<PresignedUrlResponse>>(),
  uploadToS3: vi.fn<[string, File], Promise<void>>(),
  uploadPortrait: vi.fn<[File, string?], Promise<string>>(),
  resizeImage: vi.fn<[File, number, number], Promise<Blob>>(),
  generateThumbnail: vi.fn<[File], Promise<Blob>>(),
  generateAvatarUrl: vi.fn<[string, string], string>(),
  downloadAvatar: vi.fn<[string, string], Promise<Blob>>(),
};

// Default mock implementations
mockPortraitService.getPresignedUrl.mockResolvedValue({
  uploadUrl: 'https://mock-s3-bucket.s3.amazonaws.com/test-upload-url',
  viewUrl: 'https://mock-s3-bucket.s3.amazonaws.com/test-view-url',
  fileKey: 'portraits/test-key',
  expiresIn: 3600,
});

mockPortraitService.uploadToS3.mockResolvedValue(undefined);

mockPortraitService.uploadPortrait.mockResolvedValue('https://mock-s3-bucket.s3.amazonaws.com/test-portrait.jpg');

mockPortraitService.resizeImage.mockImplementation(async (file: File) => {
  return new Blob(['resized image data'], { type: file.type });
});

mockPortraitService.generateThumbnail.mockImplementation(async (file: File) => {
  return new Blob(['thumbnail data'], { type: file.type });
});

mockPortraitService.generateAvatarUrl.mockImplementation((style: string, seed: string) => {
  return `https://api.dicebear.com/7.x/${style}/png?seed=${seed}&size=512&format=png`;
});

mockPortraitService.downloadAvatar.mockImplementation(async (style: string, seed: string) => {
  return new Blob(['mock avatar data'], { type: 'image/png' });
});

// Helper to reset all mocks
export const resetPortraitServiceMocks = () => {
  Object.values(mockPortraitService).forEach(mock => {
    if (typeof mock === 'function' && 'mockReset' in mock) {
      mock.mockReset();
    }
  });
};

// Mock axios for the actual service
export const mockAxios = {
  post: vi.fn(),
  put: vi.fn(),
  get: vi.fn(),
};

// Mock axios default implementation
mockAxios.post.mockResolvedValue({
  data: {
    uploadUrl: 'https://mock-s3-bucket.s3.amazonaws.com/test-upload-url',
    viewUrl: 'https://mock-s3-bucket.s3.amazonaws.com/test-view-url',
    fileKey: 'portraits/test-key',
    expiresIn: 3600,
  },
});

mockAxios.put.mockResolvedValue({ status: 200 });

mockAxios.get.mockResolvedValue({
  data: new Blob(['mock avatar data'], { type: 'image/png' }),
});

vi.mock('axios', () => ({
  default: mockAxios,
}));