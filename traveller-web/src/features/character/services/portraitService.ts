import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export interface PresignedUrlResponse {
  uploadUrl: string;
  viewUrl: string;
  fileKey: string;
  expiresIn: number;
}

export interface UploadOptions {
  fileName: string;
  fileType: string;
  fileSize: number;
  userId: string;
  characterId?: string;
}

class PortraitService {
  /**
   * Get a presigned URL for uploading a portrait to S3
   */
  async getPresignedUrl(options: UploadOptions): Promise<PresignedUrlResponse> {
    try {
      const response = await axios.post<PresignedUrlResponse>(
        `${API_URL}/uploads/presigned-url`,
        options,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('authToken')}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error getting presigned URL:', error);
      throw new Error('Failed to get upload URL');
    }
  }

  /**
   * Upload a file directly to S3 using a presigned URL
   */
  async uploadToS3(uploadUrl: string, file: File): Promise<void> {
    try {
      await axios.put(uploadUrl, file, {
        headers: {
          'Content-Type': file.type,
        },
      });
    } catch (error) {
      console.error('Error uploading to S3:', error);
      throw new Error('Failed to upload file');
    }
  }

  /**
   * Upload a portrait image with automatic resizing
   */
  async uploadPortrait(file: File, characterId?: string): Promise<string> {
    // Validate file
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      throw new Error('Invalid file type. Please upload a JPEG, PNG, GIF, or WebP image.');
    }

    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      throw new Error('File size exceeds 5MB limit.');
    }

    // Get presigned URL
    const userId = localStorage.getItem('userId') || 'anonymous';
    const presignedData = await this.getPresignedUrl({
      fileName: file.name,
      fileType: file.type,
      fileSize: file.size,
      userId,
      characterId,
    });

    // Upload to S3
    await this.uploadToS3(presignedData.uploadUrl, file);

    return presignedData.viewUrl;
  }

  /**
   * Resize an image before upload
   */
  async resizeImage(file: File, maxWidth: number, maxHeight: number): Promise<Blob> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          // Calculate new dimensions while maintaining aspect ratio
          if (width > height) {
            if (width > maxWidth) {
              height = (height * maxWidth) / width;
              width = maxWidth;
            }
          } else {
            if (height > maxHeight) {
              width = (width * maxHeight) / height;
              height = maxHeight;
            }
          }

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('Failed to get canvas context'));
            return;
          }

          ctx.drawImage(img, 0, 0, width, height);

          canvas.toBlob(
            (blob) => {
              if (blob) {
                resolve(blob);
              } else {
                reject(new Error('Failed to create blob'));
              }
            },
            file.type,
            0.9
          );
        };
        img.onerror = () => reject(new Error('Failed to load image'));
        img.src = e.target?.result as string;
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    });
  }

  /**
   * Generate a thumbnail from an image file
   */
  async generateThumbnail(file: File): Promise<Blob> {
    return this.resizeImage(file, 256, 256);
  }

  /**
   * Generate a DiceBear avatar URL
   */
  generateAvatarUrl(style: string, seed: string): string {
    const baseUrl = 'https://api.dicebear.com/7.x';
    const params = new URLSearchParams({
      seed,
      size: '512',
      format: 'png',
    });
    return `${baseUrl}/${style}/png?${params}`;
  }

  /**
   * Download an avatar as a file
   */
  async downloadAvatar(style: string, seed: string): Promise<Blob> {
    const url = this.generateAvatarUrl(style, seed);
    const response = await axios.get(url, {
      responseType: 'blob',
    });
    return response.data;
  }
}

export default new PortraitService();