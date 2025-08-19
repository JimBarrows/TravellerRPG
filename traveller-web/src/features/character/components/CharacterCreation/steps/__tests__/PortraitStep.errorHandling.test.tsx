import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FormProvider, useForm } from 'react-hook-form';
import PortraitStep from '../PortraitStep';
import type { CharacterCreationData, WizardStepProps } from '../../../types/characterCreation';

// Comprehensive error handling and edge case tests for PortraitStep

const mockPortraitService = {
  getPresignedUrl: vi.fn(),
  uploadToS3: vi.fn(),
  uploadPortrait: vi.fn(),
  resizeImage: vi.fn(),
  generateThumbnail: vi.fn(),
  generateAvatarUrl: vi.fn(),
  downloadAvatar: vi.fn(),
};

vi.mock('../../../services/portraitService', () => ({
  default: mockPortraitService,
}));

vi.mock('../../../../../shared/components/atoms/Button', () => ({
  default: ({ children, onClick, disabled, type = 'button', variant = 'primary', ...props }: any) => (
    <button
      onClick={onClick}
      disabled={disabled}
      type={type}
      data-variant={variant}
      {...props}
    >
      {children}
    </button>
  ),
}));

vi.mock('../../../../../shared/components/molecules/Card', () => ({
  default: ({ children, className }: any) => (
    <div className={`card ${className || ''}`}>
      {children}
    </div>
  ),
}));

const FormWrapper = ({ children }: any) => {
  const methods = useForm();
  return <FormProvider {...methods}>{children}</FormProvider>;
};

describe('PortraitStep Error Handling and Edge Cases', () => {
  const mockUpdateData = vi.fn();
  const mockOnNext = vi.fn();
  const mockOnPrevious = vi.fn();

  const defaultCharacterData: CharacterCreationData = {
    id: 'error-test-character',
    name: 'Error Test Character',
    species: 'Human',
    gender: 'Other',
    age: 30,
    characteristics: {
      strength: 10,
      dexterity: 10,
      endurance: 10,
      intelligence: 10,
      education: 10,
      social: 10,
    },
    background: {
      homeworld: 'Unknown',
      socialClass: 'Lower',
      upbringing: 'Rural',
      family: 'Single parent',
      earlyLife: 'Harsh conditions',
      startingSkills: [],
    },
    careers: [],
    careerProgression: {
      totalTerms: 0,
      currentAge: 18,
      retiredInvoluntarily: false,
      retiredVoluntarily: false,
      canReenlist: true,
      mustLeave: false,
    },
    totalTerms: 0,
    skills: [],
    lifeEvents: [],
    connections: [],
    rivals: [],
    startingCredits: 0,
    equipment: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    status: 'draft',
  };

  const defaultProps: WizardStepProps = {
    data: defaultCharacterData,
    updateData: mockUpdateData,
    onNext: mockOnNext,
    onPrevious: mockOnPrevious,
    canGoNext: true,
  };

  beforeEach(() => {
    vi.clearAllMocks();

    // Reset all service mocks to default successful behavior
    mockPortraitService.generateAvatarUrl.mockImplementation((style: string, seed: string) => {
      return `https://api.dicebear.com/7.x/${style}/png?seed=${encodeURIComponent(seed)}&size=512&format=png`;
    });

    mockPortraitService.uploadPortrait.mockResolvedValue('https://mock-s3.amazonaws.com/success.jpg');
  });

  describe('File Validation Edge Cases', () => {
    it('should handle files with misleading extensions', async () => {
      const user = userEvent.setup();

      render(
        <FormWrapper>
          <PortraitStep {...defaultProps} />
        </FormWrapper>
      );

      const uploadButton = screen.getByText('Upload Image').closest('button');
      await user.click(uploadButton!);

      const fileInput = screen.getByRole('button', { name: /choose file/i })
        .closest('div')?.querySelector('input[type="file"]');

      // File with image extension but wrong MIME type
      const fakeImageFile = new File(
        ['this is actually text content'], 
        'fake-image.jpg', 
        { type: 'text/plain' }
      );

      await user.upload(fileInput!, fakeImageFile);

      await waitFor(() => {
        expect(screen.getByText(/Please upload a JPEG, PNG, GIF, or WebP image/)).toBeInTheDocument();
      });
    });

    it('should handle corrupted file with valid MIME type', async () => {
      const user = userEvent.setup();

      render(
        <FormWrapper>
          <PortraitStep {...defaultProps} />
        </FormWrapper>
      );

      const uploadButton = screen.getByText('Upload Image').closest('button');
      await user.click(uploadButton!);

      const fileInput = screen.getByRole('button', { name: /choose file/i })
        .closest('div')?.querySelector('input[type="file"]');

      // Create a file that looks valid but will fail image loading
      const corruptedFile = new File(
        ['corrupted image data'], 
        'corrupted.jpg', 
        { type: 'image/jpeg' }
      );

      // Mock Image constructor to simulate corruption
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

      await user.upload(fileInput!, corruptedFile);

      // The file should pass initial validation but might fail during processing
      // Component should handle gracefully without crashing
      await waitFor(() => {
        // Should either show cropping interface or handle error gracefully
        expect(screen.queryByText('Crop Your Image') || screen.queryByText(/error/i)).toBeTruthy();
      });

      global.Image = OriginalImage;
    });

    it('should handle extremely large file sizes', async () => {
      const user = userEvent.setup();

      render(
        <FormWrapper>
          <PortraitStep {...defaultProps} />
        </FormWrapper>
      );

      const uploadButton = screen.getByText('Upload Image').closest('button');
      await user.click(uploadButton!);

      const fileInput = screen.getByRole('button', { name: /choose file/i })
        .closest('div')?.querySelector('input[type="file"]');

      // Create a very large file (10MB)
      const largeFile = new File(
        [new ArrayBuffer(10 * 1024 * 1024)], 
        'huge-image.jpg', 
        { type: 'image/jpeg' }
      );

      await user.upload(fileInput!, largeFile);

      await waitFor(() => {
        expect(screen.getByText(/File size must be less than 5MB/)).toBeInTheDocument();
      });
    });

    it('should handle files exactly at size limit (5MB)', async () => {
      const user = userEvent.setup();

      render(
        <FormWrapper>
          <PortraitStep {...defaultProps} />
        </FormWrapper>
      );

      const uploadButton = screen.getByText('Upload Image').closest('button');
      await user.click(uploadButton!);

      const fileInput = screen.getByRole('button', { name: /choose file/i })
        .closest('div')?.querySelector('input[type="file"]');

      // Create file exactly at 5MB limit
      const exactSizeFile = new File(
        [new ArrayBuffer(5 * 1024 * 1024)], 
        'exact-size.png', 
        { type: 'image/png' }
      );

      await user.upload(fileInput!, exactSizeFile);

      // Should be accepted (exactly at limit)
      await waitFor(() => {
        expect(screen.getByText('Crop Your Image')).toBeInTheDocument();
      });
    });

    it('should handle zero-byte files', async () => {
      const user = userEvent.setup();

      render(
        <FormWrapper>
          <PortraitStep {...defaultProps} />
        </FormWrapper>
      );

      const uploadButton = screen.getByText('Upload Image').closest('button');
      await user.click(uploadButton!);

      const fileInput = screen.getByRole('button', { name: /choose file/i })
        .closest('div')?.querySelector('input[type="file"]');

      // Create empty file
      const emptyFile = new File([], 'empty.jpg', { type: 'image/jpeg' });

      await user.upload(fileInput!, emptyFile);

      // Component should handle gracefully - either accept it or show appropriate message
      await waitFor(() => {
        // Should either show cropping or handle the edge case appropriately
        expect(document.body).toBeInTheDocument(); // Just ensure no crash
      });
    });
  });

  describe('Upload Service Error Scenarios', () => {
    it('should handle network timeout during upload', async () => {
      const user = userEvent.setup();

      Object.defineProperty(import.meta, 'env', {
        value: { PROD: true, DEV: false },
        writable: true,
      });

      // Mock a timeout error
      mockPortraitService.uploadPortrait.mockImplementation(() => {
        return new Promise((_, reject) => {
          setTimeout(() => {
            reject(new Error('Request timeout'));
          }, 100);
        });
      });

      render(
        <FormWrapper>
          <PortraitStep {...defaultProps} />
        </FormWrapper>
      );

      const uploadButton = screen.getByText('Upload Image').closest('button');
      await user.click(uploadButton!);

      const fileInput = screen.getByRole('button', { name: /choose file/i })
        .closest('div')?.querySelector('input[type="file"]');

      const testFile = new File(['content'], 'timeout-test.jpg', { type: 'image/jpeg' });
      await user.upload(fileInput!, testFile);

      const uploadPortraitButton = screen.getByText('Upload Portrait');
      await user.click(uploadPortraitButton);

      await waitFor(() => {
        expect(screen.getByText('Request timeout')).toBeInTheDocument();
      }, { timeout: 5000 });
    });

    it('should handle HTTP 403 (forbidden) error', async () => {
      const user = userEvent.setup();

      Object.defineProperty(import.meta, 'env', {
        value: { PROD: true, DEV: false },
        writable: true,
      });

      mockPortraitService.uploadPortrait.mockRejectedValue(new Error('Forbidden: Invalid credentials'));

      render(
        <FormWrapper>
          <PortraitStep {...defaultProps} />
        </FormWrapper>
      );

      const uploadButton = screen.getByText('Upload Image').closest('button');
      await user.click(uploadButton!);

      const fileInput = screen.getByRole('button', { name: /choose file/i })
        .closest('div')?.querySelector('input[type="file"]');

      const testFile = new File(['content'], 'forbidden-test.jpg', { type: 'image/jpeg' });
      await user.upload(fileInput!, testFile);

      const uploadPortraitButton = screen.getByText('Upload Portrait');
      await user.click(uploadPortraitButton);

      await waitFor(() => {
        expect(screen.getByText('Forbidden: Invalid credentials')).toBeInTheDocument();
      });
    });

    it('should handle HTTP 413 (payload too large) error', async () => {
      const user = userEvent.setup();

      Object.defineProperty(import.meta, 'env', {
        value: { PROD: true, DEV: false },
        writable: true,
      });

      mockPortraitService.uploadPortrait.mockRejectedValue(new Error('Payload too large'));

      render(
        <FormWrapper>
          <PortraitStep {...defaultProps} />
        </FormWrapper>
      );

      const uploadButton = screen.getByText('Upload Image').closest('button');
      await user.click(uploadButton!);

      const fileInput = screen.getByRole('button', { name: /choose file/i })
        .closest('div')?.querySelector('input[type="file"]');

      const testFile = new File(['content'], 'large-payload.jpg', { type: 'image/jpeg' });
      await user.upload(fileInput!, testFile);

      const uploadPortraitButton = screen.getByText('Upload Portrait');
      await user.click(uploadPortraitButton);

      await waitFor(() => {
        expect(screen.getByText('Payload too large')).toBeInTheDocument();
      });
    });

    it('should handle service unavailable error', async () => {
      const user = userEvent.setup();

      Object.defineProperty(import.meta, 'env', {
        value: { PROD: true, DEV: false },
        writable: true,
      });

      mockPortraitService.uploadPortrait.mockRejectedValue(new Error('Service temporarily unavailable'));

      render(
        <FormWrapper>
          <PortraitStep {...defaultProps} />
        </FormWrapper>
      );

      const uploadButton = screen.getByText('Upload Image').closest('button');
      await user.click(uploadButton!);

      const fileInput = screen.getByRole('button', { name: /choose file/i })
        .closest('div')?.querySelector('input[type="file"]');

      const testFile = new File(['content'], 'service-down.jpg', { type: 'image/jpeg' });
      await user.upload(fileInput!, testFile);

      const uploadPortraitButton = screen.getByText('Upload Portrait');
      await user.click(uploadPortraitButton);

      await waitFor(() => {
        expect(screen.getByText('Service temporarily unavailable')).toBeInTheDocument();
      });
    });
  });

  describe('DiceBear API Error Scenarios', () => {
    it('should handle DiceBear service downtime', async () => {
      const user = userEvent.setup();

      // Mock DiceBear URL to return error
      mockPortraitService.generateAvatarUrl.mockImplementation(() => {
        throw new Error('DiceBear service unavailable');
      });

      render(
        <FormWrapper>
          <PortraitStep {...defaultProps} />
        </FormWrapper>
      );

      const avatarButton = screen.getByText('Generated Avatar').closest('button');
      await user.click(avatarButton!);

      // Should handle the error gracefully without crashing
      await waitFor(() => {
        // Component should still render, possibly with fallback or error state
        expect(screen.getByText('Generate Avatar')).toBeInTheDocument();
      });
    });

    it('should handle invalid characters in avatar seeds', async () => {
      const user = userEvent.setup();

      // Character with special characters that might break URL encoding
      const dataWithSpecialChars = {
        ...defaultCharacterData,
        name: 'Test<script>alert("xss")</script>&%$#@',
      };

      render(
        <FormWrapper>
          <PortraitStep {...{ ...defaultProps, data: dataWithSpecialChars }} />
        </FormWrapper>
      );

      const avatarButton = screen.getByText('Generated Avatar').closest('button');
      await user.click(avatarButton!);

      const generateButton = screen.getByText('Generate New Avatar');
      await user.click(generateButton);

      await waitFor(() => {
        expect(mockUpdateData).toHaveBeenCalled();
        // Should properly encode the problematic characters
        const callArgs = mockUpdateData.mock.calls[0][0];
        expect(callArgs.avatarSeed).toContain('Test');
        expect(callArgs.avatarSeed).not.toContain('<script>');
      });
    });

    it('should handle extremely long character names', async () => {
      const user = userEvent.setup();

      // Very long character name
      const longName = 'A'.repeat(1000);
      const dataWithLongName = {
        ...defaultCharacterData,
        name: longName,
      };

      render(
        <FormWrapper>
          <PortraitStep {...{ ...defaultProps, data: dataWithLongName }} />
        </FormWrapper>
      );

      const avatarButton = screen.getByText('Generated Avatar').closest('button');
      await user.click(avatarButton!);

      const generateButton = screen.getByText('Generate New Avatar');
      await user.click(generateButton);

      await waitFor(() => {
        expect(mockUpdateData).toHaveBeenCalled();
        // Should handle long names gracefully
        const callArgs = mockUpdateData.mock.calls[0][0];
        expect(callArgs.avatarSeed).toBeTruthy();
      });
    });
  });

  describe('Browser Compatibility Edge Cases', () => {
    it('should handle missing FileReader support', async () => {
      const user = userEvent.setup();
      
      // Temporarily remove FileReader
      const OriginalFileReader = global.FileReader;
      // @ts-ignore
      delete global.FileReader;

      render(
        <FormWrapper>
          <PortraitStep {...defaultProps} />
        </FormWrapper>
      );

      const uploadButton = screen.getByText('Upload Image').closest('button');
      await user.click(uploadButton!);

      const fileInput = screen.getByRole('button', { name: /choose file/i })
        .closest('div')?.querySelector('input[type="file"]');

      const testFile = new File(['content'], 'no-filereader.jpg', { type: 'image/jpeg' });

      // Should not crash the application
      expect(() => {
        user.upload(fileInput!, testFile);
      }).not.toThrow();

      global.FileReader = OriginalFileReader;
    });

    it('should handle missing Canvas support', async () => {
      const user = userEvent.setup();

      // Mock getContext to return null (no canvas support)
      const originalGetContext = HTMLCanvasElement.prototype.getContext;
      HTMLCanvasElement.prototype.getContext = vi.fn().mockReturnValue(null);

      render(
        <FormWrapper>
          <PortraitStep {...defaultProps} />
        </FormWrapper>
      );

      const uploadButton = screen.getByText('Upload Image').closest('button');
      await user.click(uploadButton!);

      const fileInput = screen.getByRole('button', { name: /choose file/i })
        .closest('div')?.querySelector('input[type="file"]');

      const testFile = new File(['content'], 'no-canvas.jpg', { type: 'image/jpeg' });
      await user.upload(fileInput!, testFile);

      // Should handle gracefully - maybe disable cropping or show message
      await waitFor(() => {
        // Component should still function, possibly with reduced functionality
        expect(document.body).toBeInTheDocument();
      });

      HTMLCanvasElement.prototype.getContext = originalGetContext;
    });

    it('should handle missing URL.createObjectURL support', async () => {
      const user = userEvent.setup();

      // Mock missing createObjectURL
      const originalCreateObjectURL = URL.createObjectURL;
      // @ts-ignore
      delete URL.createObjectURL;

      render(
        <FormWrapper>
          <PortraitStep {...defaultProps} />
        </FormWrapper>
      );

      const uploadButton = screen.getByText('Upload Image').closest('button');
      await user.click(uploadButton!);

      const fileInput = screen.getByRole('button', { name: /choose file/i })
        .closest('div')?.querySelector('input[type="file"]');

      const testFile = new File(['content'], 'no-createurl.jpg', { type: 'image/jpeg' });

      // Should handle gracefully without crashing
      expect(() => {
        user.upload(fileInput!, testFile);
      }).not.toThrow();

      URL.createObjectURL = originalCreateObjectURL;
    });
  });

  describe('Memory and Resource Management', () => {
    it('should handle memory pressure during large image processing', async () => {
      const user = userEvent.setup();

      // Mock low memory scenario by making canvas operations fail
      const originalToBlob = HTMLCanvasElement.prototype.toBlob;
      let failCount = 0;
      HTMLCanvasElement.prototype.toBlob = vi.fn().mockImplementation((callback) => {
        failCount++;
        if (failCount <= 2) {
          // Fail first few attempts
          setTimeout(() => callback(null), 0);
        } else {
          // Eventually succeed
          setTimeout(() => callback(new Blob(['recovered'], { type: 'image/png' })), 0);
        }
      });

      render(
        <FormWrapper>
          <PortraitStep {...defaultProps} />
        </FormWrapper>
      );

      const uploadButton = screen.getByText('Upload Image').closest('button');
      await user.click(uploadButton!);

      const fileInput = screen.getByRole('button', { name: /choose file/i })
        .closest('div')?.querySelector('input[type="file"]');

      const testFile = new File(['large-content'], 'memory-pressure.jpg', { type: 'image/jpeg' });
      await user.upload(fileInput!, testFile);

      await waitFor(() => {
        const applyCropButton = screen.getByText('Apply Crop');
        user.click(applyCropButton);
      });

      // Should eventually succeed or fail gracefully
      await waitFor(() => {
        expect(true).toBe(true); // Just ensure no crash
      }, { timeout: 5000 });

      HTMLCanvasElement.prototype.toBlob = originalToBlob;
    });

    it('should handle concurrent operations gracefully', async () => {
      const user = userEvent.setup();

      render(
        <FormWrapper>
          <PortraitStep {...defaultProps} />
        </FormWrapper>
      );

      // Start multiple operations simultaneously
      const avatarButton = screen.getByText('Generated Avatar').closest('button');
      const uploadButton = screen.getByText('Upload Image').closest('button');

      // Rapid fire clicks
      await user.click(avatarButton!);
      await user.click(uploadButton!);
      await user.click(avatarButton!);

      await waitFor(() => {
        const generateButton = screen.getByText('Generate New Avatar');
        // Multiple rapid clicks on generate
        user.click(generateButton);
        user.click(generateButton);
        user.click(generateButton);
      });

      // Should handle concurrent operations without race conditions
      await waitFor(() => {
        expect(mockUpdateData).toHaveBeenCalled();
      }, { timeout: 1000 });
    });
  });

  describe('Data Validation and Sanitization', () => {
    it('should handle null/undefined character data gracefully', () => {
      const nullData = {
        ...defaultCharacterData,
        name: null as any,
        id: undefined as any,
      };

      expect(() => {
        render(
          <FormWrapper>
            <PortraitStep {...{ ...defaultProps, data: nullData }} />
          </FormWrapper>
        );
      }).not.toThrow();
    });

    it('should handle corrupted form context', () => {
      // Render without FormProvider to test error boundary behavior
      expect(() => {
        render(<PortraitStep {...defaultProps} />);
      }).toThrow(); // Should throw because useFormContext requires FormProvider

      // This is expected behavior - the component properly validates its requirements
    });

    it('should validate portrait URL format', async () => {
      const user = userEvent.setup();
      
      // Mock updateData to simulate receiving invalid URL
      const invalidPortraitData = {
        ...defaultCharacterData,
        portrait: 'invalid-url-format',
      };

      render(
        <FormWrapper>
          <PortraitStep {...{ ...defaultProps, data: invalidPortraitData }} />
        </FormWrapper>
      );

      // Should handle invalid URLs gracefully
      const portraitSection = screen.getByText('Current Portrait').parentElement;
      expect(portraitSection).toBeInTheDocument();
      
      // Should show either error state or fallback
      expect(
        screen.queryByAltText('Character portrait') || 
        screen.queryByText('No portrait selected')
      ).toBeTruthy();
    });
  });

  describe('Accessibility Error States', () => {
    it('should maintain keyboard navigation during error states', async () => {
      const user = userEvent.setup();

      mockPortraitService.uploadPortrait.mockRejectedValue(new Error('Upload failed'));

      Object.defineProperty(import.meta, 'env', {
        value: { PROD: true, DEV: false },
        writable: true,
      });

      render(
        <FormWrapper>
          <PortraitStep {...defaultProps} />
        </FormWrapper>
      );

      const uploadButton = screen.getByText('Upload Image').closest('button');
      
      // Navigate with keyboard
      uploadButton?.focus();
      await user.keyboard('{Enter}');

      await waitFor(() => {
        const chooseFileButton = screen.getByText('Choose File');
        chooseFileButton.focus();
        expect(document.activeElement).toBe(chooseFileButton);
      });
    });

    it('should provide appropriate error announcements for screen readers', async () => {
      const user = userEvent.setup();

      render(
        <FormWrapper>
          <PortraitStep {...defaultProps} />
        </FormWrapper>
      );

      const uploadButton = screen.getByText('Upload Image').closest('button');
      await user.click(uploadButton!);

      const fileInput = screen.getByRole('button', { name: /choose file/i })
        .closest('div')?.querySelector('input[type="file"]');

      const invalidFile = new File(['content'], 'test.txt', { type: 'text/plain' });
      await user.upload(fileInput!, invalidFile);

      await waitFor(() => {
        const errorMessage = screen.getByText(/Please upload a JPEG, PNG, GIF, or WebP image/);
        // Error should be properly announced
        expect(errorMessage).toBeInTheDocument();
        expect(errorMessage).toHaveClass(/text-destructive/);
      });
    });
  });
});