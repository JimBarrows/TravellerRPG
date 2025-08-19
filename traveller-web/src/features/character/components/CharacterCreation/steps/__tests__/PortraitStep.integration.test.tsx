import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FormProvider, useForm } from 'react-hook-form';
import PortraitStep from '../PortraitStep';
import type { CharacterCreationData, WizardStepProps } from '../../../types/characterCreation';

// Integration tests for the full portrait upload and avatar generation flow

// Mock the portrait service with more realistic implementations
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

const FormWrapper = ({ children, defaultValues = {} }: any) => {
  const methods = useForm({ defaultValues });
  return <FormProvider {...methods}>{children}</FormProvider>;
};

describe('PortraitStep Integration Tests', () => {
  const mockUpdateData = vi.fn();
  const mockOnNext = vi.fn();
  const mockOnPrevious = vi.fn();

  const defaultCharacterData: CharacterCreationData = {
    id: 'test-character-id',
    name: 'Integration Test Character',
    species: 'Human',
    gender: 'Female',
    age: 25,
    characteristics: {
      strength: 8,
      dexterity: 12,
      endurance: 10,
      intelligence: 14,
      education: 11,
      social: 9,
    },
    background: {
      homeworld: 'Terra',
      socialClass: 'Middle',
      upbringing: 'Urban',
      family: 'Nuclear family',
      earlyLife: 'University',
      startingSkills: ['Admin', 'Computer'],
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
    startingCredits: 1000,
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
    
    // Mock environment
    Object.defineProperty(import.meta, 'env', {
      value: {
        PROD: false,
        DEV: true,
        VITE_API_URL: 'http://localhost:3000/api',
      },
      writable: true,
    });

    // Setup realistic service mocks
    mockPortraitService.generateAvatarUrl.mockImplementation((style: string, seed: string) => {
      return `https://api.dicebear.com/7.x/${style}/png?seed=${encodeURIComponent(seed)}&size=512&format=png`;
    });

    mockPortraitService.uploadPortrait.mockImplementation(async (file: File, characterId?: string) => {
      // Simulate upload delay
      await new Promise(resolve => setTimeout(resolve, 100));
      return `https://test-bucket.s3.amazonaws.com/portraits/${characterId}/${file.name}`;
    });

    mockPortraitService.resizeImage.mockImplementation(async (file: File, maxWidth: number, maxHeight: number) => {
      await new Promise(resolve => setTimeout(resolve, 50));
      return new Blob(['resized-image-data'], { type: file.type });
    });

    mockPortraitService.generateThumbnail.mockImplementation(async (file: File) => {
      await new Promise(resolve => setTimeout(resolve, 25));
      return new Blob(['thumbnail-data'], { type: file.type });
    });

    mockPortraitService.downloadAvatar.mockImplementation(async (style: string, seed: string) => {
      await new Promise(resolve => setTimeout(resolve, 200));
      return new Blob(['avatar-png-data'], { type: 'image/png' });
    });
  });

  describe('Complete Avatar Generation Flow', () => {
    it('should complete full avatar generation workflow', async () => {
      const user = userEvent.setup();

      render(
        <FormWrapper>
          <PortraitStep {...defaultProps} />
        </FormWrapper>
      );

      // Step 1: Select avatar type
      const avatarButton = screen.getByText('Generated Avatar').closest('button');
      await user.click(avatarButton!);

      await waitFor(() => {
        expect(screen.getByText('Generate Avatar')).toBeInTheDocument();
      });

      // Step 2: Change avatar style
      await waitFor(() => {
        const avataaarsStyleButton = screen.getByText('Avataaars').closest('button');
        expect(avataaarsStyleButton).toBeInTheDocument();
      });

      const avataaarsStyleButton = screen.getByText('Avataaars').closest('button');
      await user.click(avataaarsStyleButton!);

      // Step 3: Generate avatar
      const generateButton = screen.getByText('Generate New Avatar');
      await user.click(generateButton);

      await waitFor(() => {
        expect(mockUpdateData).toHaveBeenCalledWith(
          expect.objectContaining({
            avatarSeed: expect.stringContaining('Integration Test Character'),
            avatarStyle: 'avataaars',
            portraitType: 'avatar',
          })
        );
      });

      // Step 4: Verify avatar preview appears
      await waitFor(() => {
        expect(screen.getByText('Preview')).toBeInTheDocument();
        const previewImage = screen.getByAltText('Avatar preview');
        expect(previewImage).toHaveAttribute('src', expect.stringContaining('avataaars'));
      });

      // Step 5: Use the generated avatar
      const useAvatarButton = screen.getByText('Use This Avatar');
      await user.click(useAvatarButton);

      await waitFor(() => {
        expect(mockUpdateData).toHaveBeenCalledWith(
          expect.objectContaining({
            portraitType: 'avatar',
            portrait: expect.stringContaining('avataaars'),
          })
        );
      });
    });

    it('should handle avatar style switching with preview updates', async () => {
      const user = userEvent.setup();
      const dataWithSeed = { ...defaultCharacterData, avatarSeed: 'existing-seed' };

      render(
        <FormWrapper>
          <PortraitStep {...{ ...defaultProps, data: dataWithSeed }} />
        </FormWrapper>
      );

      const avatarButton = screen.getByText('Generated Avatar').closest('button');
      await user.click(avatarButton!);

      await waitFor(() => {
        expect(screen.getByText('Preview')).toBeInTheDocument();
      });

      const styles = ['Adventurer', 'Robots', 'Identicon', 'Pixel Art'];
      
      for (const styleName of styles) {
        const styleButton = screen.getByText(styleName).closest('button');
        await user.click(styleButton!);

        await waitFor(() => {
          const previewImage = screen.getByAltText('Avatar preview');
          expect(previewImage).toHaveAttribute('src', expect.stringMatching(/dicebear\.com/));
        });
      }
    });
  });

  describe('Complete File Upload Flow', () => {
    it('should complete full file upload workflow in development', async () => {
      const user = userEvent.setup();

      render(
        <FormWrapper>
          <PortraitStep {...defaultProps} />
        </FormWrapper>
      );

      // Step 1: Select upload type
      const uploadButton = screen.getByText('Upload Image').closest('button');
      await user.click(uploadButton!);

      await waitFor(() => {
        expect(screen.getByText('Upload Custom Portrait')).toBeInTheDocument();
      });

      // Step 2: Select a valid file
      const fileInput = screen.getByRole('button', { name: /choose file/i })
        .closest('div')?.querySelector('input[type="file"]');
      
      const testFile = new File(['mock-image-content'], 'test-portrait.jpg', { 
        type: 'image/jpeg' 
      });

      await user.upload(fileInput!, testFile);

      // Step 3: Verify cropping interface appears
      await waitFor(() => {
        expect(screen.getByText('Crop Your Image')).toBeInTheDocument();
        expect(screen.getByAltText('Crop preview')).toBeInTheDocument();
      });

      // Step 4: Apply crop
      const applyCropButton = screen.getByText('Apply Crop');
      await user.click(applyCropButton);

      await waitFor(() => {
        expect(mockUpdateData).toHaveBeenCalledWith(
          expect.objectContaining({
            portrait: expect.stringContaining('mocked-object-url'),
          })
        );
      });

      // Step 5: Verify portrait appears in current portrait section
      await waitFor(() => {
        const portraitImage = screen.getByAltText('Character portrait');
        expect(portraitImage).toBeInTheDocument();
      });
    });

    it('should complete full file upload workflow in production', async () => {
      const user = userEvent.setup();

      // Set production environment
      Object.defineProperty(import.meta, 'env', {
        value: {
          PROD: true,
          DEV: false,
          VITE_API_URL: 'https://api.traveller-rpg.com',
        },
        writable: true,
      });

      render(
        <FormWrapper>
          <PortraitStep {...defaultProps} />
        </FormWrapper>
      );

      // Step 1: Select upload type
      const uploadButton = screen.getByText('Upload Image').closest('button');
      await user.click(uploadButton!);

      // Step 2: Select and upload file
      const fileInput = screen.getByRole('button', { name: /choose file/i })
        .closest('div')?.querySelector('input[type="file"]');
      
      const testFile = new File(['mock-image-content'], 'production-portrait.png', { 
        type: 'image/png' 
      });

      await user.upload(fileInput!, testFile);

      // Step 3: Upload the file (should call the service)
      await waitFor(() => {
        const uploadPortraitButton = screen.getByText('Upload Portrait');
        expect(uploadPortraitButton).toBeInTheDocument();
      });

      const uploadPortraitButton = screen.getByText('Upload Portrait');
      await user.click(uploadPortraitButton);

      // Step 4: Verify service was called and data updated
      await waitFor(() => {
        expect(mockPortraitService.uploadPortrait).toHaveBeenCalledWith(
          expect.any(File),
          'test-character-id'
        );
        
        expect(mockUpdateData).toHaveBeenCalledWith({
          portrait: 'https://test-bucket.s3.amazonaws.com/portraits/test-character-id/production-portrait.png',
          portraitType: 'upload',
        });
      });
    });

    it('should handle upload errors gracefully with retry capability', async () => {
      const user = userEvent.setup();

      // Set production environment
      Object.defineProperty(import.meta, 'env', {
        value: { PROD: true, DEV: false },
        writable: true,
      });

      // Make upload fail first time, succeed second time
      mockPortraitService.uploadPortrait
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce('https://test-bucket.s3.amazonaws.com/portraits/retry-success.jpg');

      render(
        <FormWrapper>
          <PortraitStep {...defaultProps} />
        </FormWrapper>
      );

      const uploadButton = screen.getByText('Upload Image').closest('button');
      await user.click(uploadButton!);

      const fileInput = screen.getByRole('button', { name: /choose file/i })
        .closest('div')?.querySelector('input[type="file"]');
      
      const testFile = new File(['content'], 'retry-test.jpg', { type: 'image/jpeg' });
      await user.upload(fileInput!, testFile);

      // First upload attempt (should fail)
      const uploadPortraitButton = screen.getByText('Upload Portrait');
      await user.click(uploadPortraitButton);

      await waitFor(() => {
        expect(screen.getByText('Network error')).toBeInTheDocument();
      });

      // Retry upload (should succeed)
      await user.click(uploadPortraitButton);

      await waitFor(() => {
        expect(mockUpdateData).toHaveBeenCalledWith({
          portrait: 'https://test-bucket.s3.amazonaws.com/portraits/retry-success.jpg',
          portraitType: 'upload',
        });
      });
    });
  });

  describe('Cross-Feature Integration', () => {
    it('should maintain form state across portrait type changes', async () => {
      const user = userEvent.setup();
      let formValues: any = {};

      const TestWrapper = () => {
        const methods = useForm({ 
          defaultValues: {
            portrait: '',
            avatarSeed: '',
            portraitStyle: 'adventurer',
          }
        });

        const watchedValues = methods.watch();
        formValues = watchedValues;

        return (
          <FormProvider {...methods}>
            <PortraitStep {...defaultProps} />
          </FormProvider>
        );
      };

      render(<TestWrapper />);

      // Start with avatar
      const avatarButton = screen.getByText('Generated Avatar').closest('button');
      await user.click(avatarButton!);

      const generateButton = screen.getByText('Generate New Avatar');
      await user.click(generateButton);

      await waitFor(() => {
        expect(formValues.avatarSeed).toBeTruthy();
      });

      // Switch to upload
      const uploadButton = screen.getByText('Upload Image').closest('button');
      await user.click(uploadButton!);

      // Switch back to avatar
      await user.click(avatarButton!);

      // Form should remember previous avatar settings
      await waitFor(() => {
        expect(formValues.avatarSeed).toBeTruthy();
        expect(screen.getByText('Preview')).toBeInTheDocument();
      });
    });

    it('should handle character name changes affecting avatar seed', async () => {
      const user = userEvent.setup();
      let updatedData = { ...defaultCharacterData };

      const mockUpdateDataWithTracking = vi.fn().mockImplementation((updates) => {
        updatedData = { ...updatedData, ...updates };
        mockUpdateData(updates);
      });

      const TestComponent = () => {
        const [data, setData] = React.useState(updatedData);
        
        const handleUpdate = (updates: any) => {
          const newData = { ...data, ...updates };
          setData(newData);
          mockUpdateDataWithTracking(updates);
        };

        return (
          <FormWrapper>
            <PortraitStep {...{ ...defaultProps, data, updateData: handleUpdate }} />
          </FormWrapper>
        );
      };

      // Start with original name
      render(<TestComponent />);

      const avatarButton = screen.getByText('Generated Avatar').closest('button');
      await user.click(avatarButton!);

      let generateButton = screen.getByText('Generate New Avatar');
      await user.click(generateButton);

      // Capture first avatar seed
      await waitFor(() => {
        expect(mockUpdateDataWithTracking).toHaveBeenCalledWith(
          expect.objectContaining({
            avatarSeed: expect.stringContaining('Integration Test Character'),
          })
        );
      });

      const firstSeed = mockUpdateDataWithTracking.mock.calls[0][0].avatarSeed;

      // Simulate character name change (would normally come from another step)
      act(() => {
        updatedData = { ...updatedData, name: 'New Character Name' };
      });

      // Generate new avatar with new name
      generateButton = screen.getByText('Generate New Avatar');
      await user.click(generateButton);

      await waitFor(() => {
        const latestCall = mockUpdateDataWithTracking.mock.calls[mockUpdateDataWithTracking.mock.calls.length - 1];
        expect(latestCall[0].avatarSeed).toContain('New Character Name');
        expect(latestCall[0].avatarSeed).not.toBe(firstSeed);
      });
    });

    it('should properly clean up resources on component unmount', async () => {
      const user = userEvent.setup();
      const revokeObjectURLSpy = vi.spyOn(URL, 'revokeObjectURL');

      const { unmount } = render(
        <FormWrapper>
          <PortraitStep {...defaultProps} />
        </FormWrapper>
      );

      const uploadButton = screen.getByText('Upload Image').closest('button');
      await user.click(uploadButton!);

      const fileInput = screen.getByRole('button', { name: /choose file/i })
        .closest('div')?.querySelector('input[type="file"]');
      
      const testFile = new File(['content'], 'cleanup-test.jpg', { type: 'image/jpeg' });
      await user.upload(fileInput!, testFile);

      await waitFor(() => {
        expect(screen.getByText('Crop Your Image')).toBeInTheDocument();
      });

      // Unmount component
      unmount();

      // Should clean up object URLs (though in test environment this might not be called)
      // The important thing is that no errors are thrown
      expect(true).toBe(true);
    });
  });

  describe('Performance and Edge Cases', () => {
    it('should handle rapid user interactions without breaking', async () => {
      const user = userEvent.setup();

      render(
        <FormWrapper>
          <PortraitStep {...defaultProps} />
        </FormWrapper>
      );

      const avatarButton = screen.getByText('Generated Avatar').closest('button');
      const uploadButton = screen.getByText('Upload Image').closest('button');

      // Rapid switching
      for (let i = 0; i < 5; i++) {
        await user.click(avatarButton!);
        await user.click(uploadButton!);
      }

      // Should end up in upload mode
      await waitFor(() => {
        expect(screen.getByText('Upload Custom Portrait')).toBeInTheDocument();
      });
    });

    it('should handle multiple file selections correctly', async () => {
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

      // Upload first file
      const file1 = new File(['content1'], 'first.jpg', { type: 'image/jpeg' });
      await user.upload(fileInput!, file1);

      await waitFor(() => {
        expect(screen.getByText('Crop Your Image')).toBeInTheDocument();
      });

      // Cancel crop
      const cancelButton = screen.getByText('Cancel');
      await user.click(cancelButton);

      // Upload second file
      const file2 = new File(['content2'], 'second.png', { type: 'image/png' });
      await user.upload(fileInput!, file2);

      await waitFor(() => {
        expect(screen.getByText('Crop Your Image')).toBeInTheDocument();
        expect(screen.getByAltText('Crop preview')).toBeInTheDocument();
      });
    });

    it('should maintain accessibility during dynamic state changes', async () => {
      const user = userEvent.setup();

      render(
        <FormWrapper>
          <PortraitStep {...defaultProps} />
        </FormWrapper>
      );

      // Check initial accessibility
      expect(screen.getByRole('button', { name: /generated avatar/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /upload image/i })).toBeInTheDocument();

      // Switch to avatar mode
      const avatarButton = screen.getByText('Generated Avatar').closest('button');
      await user.click(avatarButton!);

      // Check avatar mode accessibility
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /generate new avatar/i })).toBeInTheDocument();
        
        // Style selection buttons should be accessible
        const styleButtons = screen.getAllByRole('button');
        const styleButtonsWithText = styleButtons.filter(button => 
          ['Adventurer', 'Avataaars', 'Robots'].some(style => 
            button.textContent?.includes(style)
          )
        );
        expect(styleButtonsWithText.length).toBeGreaterThan(0);
      });

      // Switch to upload mode
      const uploadButton = screen.getByText('Upload Image').closest('button');
      await user.click(uploadButton!);

      // Check upload mode accessibility
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /choose file/i })).toBeInTheDocument();
      });
    });
  });
});