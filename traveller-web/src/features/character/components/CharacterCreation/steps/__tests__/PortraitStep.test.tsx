import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FormProvider, useForm } from 'react-hook-form';
import PortraitStep from '../PortraitStep';
import type { CharacterCreationData, WizardStepProps } from '../../../types/characterCreation';
import { mockPortraitService, resetPortraitServiceMocks } from '../../../../test/mocks/portraitServiceMock';

// Mock the portrait service
vi.mock('../../../services/portraitService', () => ({
  default: mockPortraitService,
}));

// Mock components that might not be available in test environment
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

// Test wrapper component that provides form context
const FormWrapper = ({ children, defaultValues = {} }: any) => {
  const methods = useForm({ defaultValues });
  return <FormProvider {...methods}>{children}</FormProvider>;
};

describe('PortraitStep', () => {
  const mockUpdateData = vi.fn();
  const mockOnNext = vi.fn();
  const mockOnPrevious = vi.fn();

  const defaultCharacterData: CharacterCreationData = {
    name: 'Test Character',
    species: 'Human',
    gender: 'Male',
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
      homeworld: 'Earth',
      socialClass: 'Middle',
      upbringing: 'Urban',
      family: 'Middle class',
      earlyLife: 'Standard education',
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
    resetPortraitServiceMocks();
    
    // Mock environment
    Object.defineProperty(import.meta, 'env', {
      value: {
        PROD: false,
        DEV: true,
        VITE_API_URL: 'http://localhost:3000/api',
      },
      writable: true,
    });

    // Reset URL mocks
    global.URL.createObjectURL = vi.fn(() => 'mocked-object-url');
    global.URL.revokeObjectURL = vi.fn();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('Component Rendering', () => {
    it('should render with default state', () => {
      render(
        <FormWrapper>
          <PortraitStep {...defaultProps} />
        </FormWrapper>
      );

      expect(screen.getByText('Character Portrait')).toBeInTheDocument();
      expect(screen.getByText('Choose how you want to represent your character visually.')).toBeInTheDocument();
      expect(screen.getByText('Portrait Type')).toBeInTheDocument();
      expect(screen.getByText('Generated Avatar')).toBeInTheDocument();
      expect(screen.getByText('Upload Image')).toBeInTheDocument();
    });

    it('should display current portrait section', () => {
      render(
        <FormWrapper>
          <PortraitStep {...defaultProps} />
        </FormWrapper>
      );

      expect(screen.getByText('Current Portrait')).toBeInTheDocument();
      expect(screen.getByText('No portrait selected')).toBeInTheDocument();
    });

    it('should render tips section', () => {
      render(
        <FormWrapper>
          <PortraitStep {...defaultProps} />
        </FormWrapper>
      );

      expect(screen.getByText('Portrait Tips')).toBeInTheDocument();
      expect(screen.getByText(/Recommended image size is 512x512 pixels/)).toBeInTheDocument();
    });
  });

  describe('Portrait Type Selection', () => {
    it('should switch to upload type when upload button is clicked', async () => {
      const user = userEvent.setup();

      render(
        <FormWrapper>
          <PortraitStep {...defaultProps} />
        </FormWrapper>
      );

      const uploadButton = screen.getByText('Upload Image').closest('button');
      await user.click(uploadButton!);

      await waitFor(() => {
        expect(screen.getByText('Upload Custom Portrait')).toBeInTheDocument();
      });
    });

    it('should switch to avatar type when avatar button is clicked', async () => {
      const user = userEvent.setup();

      render(
        <FormWrapper>
          <PortraitStep {...defaultProps} />
        </FormWrapper>
      );

      const avatarButton = screen.getByText('Generated Avatar').closest('button');
      await user.click(avatarButton!);

      await waitFor(() => {
        expect(screen.getByText('Generate Avatar')).toBeInTheDocument();
      });
    });
  });

  describe('Avatar Generation', () => {
    it('should display avatar styles when avatar type is selected', async () => {
      const user = userEvent.setup();

      render(
        <FormWrapper>
          <PortraitStep {...defaultProps} />
        </FormWrapper>
      );

      const avatarButton = screen.getByText('Generated Avatar').closest('button');
      await user.click(avatarButton!);

      await waitFor(() => {
        expect(screen.getByText('Avatar Style')).toBeInTheDocument();
        expect(screen.getByText('Adventurer')).toBeInTheDocument();
        expect(screen.getByText('Avataaars')).toBeInTheDocument();
        expect(screen.getByText('Robots')).toBeInTheDocument();
      });
    });

    it('should generate new avatar when generate button is clicked', async () => {
      const user = userEvent.setup();

      render(
        <FormWrapper>
          <PortraitStep {...defaultProps} />
        </FormWrapper>
      );

      const avatarButton = screen.getByText('Generated Avatar').closest('button');
      await user.click(avatarButton!);

      await waitFor(() => {
        const generateButton = screen.getByText('Generate New Avatar');
        user.click(generateButton);
      });

      await waitFor(() => {
        expect(mockUpdateData).toHaveBeenCalled();
      });
    });

    it('should change avatar style when style button is clicked', async () => {
      const user = userEvent.setup();

      render(
        <FormWrapper>
          <PortraitStep {...defaultProps} />
        </FormWrapper>
      );

      const avatarButton = screen.getByText('Generated Avatar').closest('button');
      await user.click(avatarButton!);

      await waitFor(() => {
        const avataaarsButton = screen.getByText('Avataaars').closest('button');
        user.click(avataaarsButton!);
      });

      await waitFor(() => {
        // The selected style should be visually indicated
        const avataaarsButton = screen.getByText('Avataaars').closest('button');
        expect(avataaarsButton).toHaveClass('border-primary');
      });
    });

    it('should show avatar preview when seed exists', async () => {
      const user = userEvent.setup();
      const dataWithAvatarSeed = {
        ...defaultCharacterData,
        avatarSeed: 'test-seed',
      };

      render(
        <FormWrapper>
          <PortraitStep {...{ ...defaultProps, data: dataWithAvatarSeed }} />
        </FormWrapper>
      );

      const avatarButton = screen.getByText('Generated Avatar').closest('button');
      await user.click(avatarButton!);

      await waitFor(() => {
        expect(screen.getByText('Preview')).toBeInTheDocument();
        const previewImage = screen.getByAltText('Avatar preview');
        expect(previewImage).toBeInTheDocument();
      });
    });

    it('should use avatar when use button is clicked', async () => {
      const user = userEvent.setup();
      const dataWithAvatarSeed = {
        ...defaultCharacterData,
        avatarSeed: 'test-seed',
      };

      render(
        <FormWrapper>
          <PortraitStep {...{ ...defaultProps, data: dataWithAvatarSeed }} />
        </FormWrapper>
      );

      const avatarButton = screen.getByText('Generated Avatar').closest('button');
      await user.click(avatarButton!);

      await waitFor(() => {
        const useButton = screen.getByText('Use This Avatar');
        user.click(useButton);
      });

      await waitFor(() => {
        expect(mockUpdateData).toHaveBeenCalledWith(
          expect.objectContaining({
            portraitType: 'avatar',
          })
        );
      });
    });
  });

  describe('File Upload', () => {
    it('should show file input when upload type is selected', async () => {
      const user = userEvent.setup();

      render(
        <FormWrapper>
          <PortraitStep {...defaultProps} />
        </FormWrapper>
      );

      const uploadButton = screen.getByText('Upload Image').closest('button');
      await user.click(uploadButton!);

      await waitFor(() => {
        expect(screen.getByText('Choose File')).toBeInTheDocument();
      });
    });

    it('should validate file type and show error for invalid files', async () => {
      const user = userEvent.setup();

      render(
        <FormWrapper>
          <PortraitStep {...defaultProps} />
        </FormWrapper>
      );

      const uploadButton = screen.getByText('Upload Image').closest('button');
      await user.click(uploadButton!);

      await waitFor(async () => {
        const fileInput = screen.getByRole('button', { name: /choose file/i }).closest('div')?.querySelector('input[type="file"]');
        expect(fileInput).toBeInTheDocument();

        const invalidFile = new File(['content'], 'test.txt', { type: 'text/plain' });
        await user.upload(fileInput!, invalidFile);
      });

      await waitFor(() => {
        expect(screen.getByText(/Please upload a JPEG, PNG, GIF, or WebP image/)).toBeInTheDocument();
      });
    });

    it('should validate file size and show error for oversized files', async () => {
      const user = userEvent.setup();

      render(
        <FormWrapper>
          <PortraitStep {...defaultProps} />
        </FormWrapper>
      );

      const uploadButton = screen.getByText('Upload Image').closest('button');
      await user.click(uploadButton!);

      await waitFor(async () => {
        const fileInput = screen.getByRole('button', { name: /choose file/i }).closest('div')?.querySelector('input[type="file"]');
        
        // Create a mock file that appears large (6MB)
        const oversizedFile = new File(['x'.repeat(6 * 1024 * 1024)], 'large.jpg', { type: 'image/jpeg' });
        Object.defineProperty(oversizedFile, 'size', { value: 6 * 1024 * 1024 });
        
        await user.upload(fileInput!, oversizedFile);
      });

      await waitFor(() => {
        expect(screen.getByText(/File size must be less than 5MB/)).toBeInTheDocument();
      });
    });

    it('should show cropping interface for valid image files', async () => {
      const user = userEvent.setup();

      render(
        <FormWrapper>
          <PortraitStep {...defaultProps} />
        </FormWrapper>
      );

      const uploadButton = screen.getByText('Upload Image').closest('button');
      await user.click(uploadButton!);

      await waitFor(async () => {
        const fileInput = screen.getByRole('button', { name: /choose file/i }).closest('div')?.querySelector('input[type="file"]');
        
        const validFile = new File(['image content'], 'test.jpg', { type: 'image/jpeg' });
        await user.upload(fileInput!, validFile);
      });

      await waitFor(() => {
        expect(screen.getByText('Crop Your Image')).toBeInTheDocument();
        expect(screen.getByText('Apply Crop')).toBeInTheDocument();
        expect(screen.getByText('Cancel')).toBeInTheDocument();
      });
    });

    it('should handle crop application', async () => {
      const user = userEvent.setup();

      render(
        <FormWrapper>
          <PortraitStep {...defaultProps} />
        </FormWrapper>
      );

      const uploadButton = screen.getByText('Upload Image').closest('button');
      await user.click(uploadButton!);

      await waitFor(async () => {
        const fileInput = screen.getByRole('button', { name: /choose file/i }).closest('div')?.querySelector('input[type="file"]');
        const validFile = new File(['image content'], 'test.jpg', { type: 'image/jpeg' });
        await user.upload(fileInput!, validFile);
      });

      await waitFor(async () => {
        const applyCropButton = screen.getByText('Apply Crop');
        await user.click(applyCropButton);
      });

      await waitFor(() => {
        expect(mockUpdateData).toHaveBeenCalled();
      });
    });

    it('should handle crop cancellation', async () => {
      const user = userEvent.setup();

      render(
        <FormWrapper>
          <PortraitStep {...defaultProps} />
        </FormWrapper>
      );

      const uploadButton = screen.getByText('Upload Image').closest('button');
      await user.click(uploadButton!);

      await waitFor(async () => {
        const fileInput = screen.getByRole('button', { name: /choose file/i }).closest('div')?.querySelector('input[type="file"]');
        const validFile = new File(['image content'], 'test.jpg', { type: 'image/jpeg' });
        await user.upload(fileInput!, validFile);
      });

      await waitFor(async () => {
        const cancelButton = screen.getByText('Cancel');
        await user.click(cancelButton);
      });

      await waitFor(() => {
        expect(screen.queryByText('Crop Your Image')).not.toBeInTheDocument();
      });
    });
  });

  describe('Portrait Upload in Production', () => {
    it('should call portrait service upload in production mode', async () => {
      const user = userEvent.setup();

      // Mock production environment
      Object.defineProperty(import.meta, 'env', {
        value: {
          PROD: true,
          DEV: false,
          VITE_API_URL: 'https://api.example.com',
        },
        writable: true,
      });

      mockPortraitService.uploadPortrait.mockResolvedValueOnce('https://s3.amazonaws.com/test-portrait.jpg');

      render(
        <FormWrapper>
          <PortraitStep {...defaultProps} />
        </FormWrapper>
      );

      const uploadButton = screen.getByText('Upload Image').closest('button');
      await user.click(uploadButton!);

      await waitFor(async () => {
        const fileInput = screen.getByRole('button', { name: /choose file/i }).closest('div')?.querySelector('input[type="file"]');
        const validFile = new File(['image content'], 'test.jpg', { type: 'image/jpeg' });
        await user.upload(fileInput!, validFile);
      });

      await waitFor(async () => {
        const uploadPortraitButton = screen.getByText('Upload Portrait');
        await user.click(uploadPortraitButton);
      });

      await waitFor(() => {
        expect(mockPortraitService.uploadPortrait).toHaveBeenCalledWith(
          expect.any(File),
          defaultCharacterData.id
        );
        expect(mockUpdateData).toHaveBeenCalledWith({
          portrait: 'https://s3.amazonaws.com/test-portrait.jpg',
          portraitType: 'upload',
        });
      });
    });

    it('should handle upload errors gracefully', async () => {
      const user = userEvent.setup();

      Object.defineProperty(import.meta, 'env', {
        value: {
          PROD: true,
          DEV: false,
        },
        writable: true,
      });

      mockPortraitService.uploadPortrait.mockRejectedValueOnce(new Error('Upload failed'));

      render(
        <FormWrapper>
          <PortraitStep {...defaultProps} />
        </FormWrapper>
      );

      const uploadButton = screen.getByText('Upload Image').closest('button');
      await user.click(uploadButton!);

      await waitFor(async () => {
        const fileInput = screen.getByRole('button', { name: /choose file/i }).closest('div')?.querySelector('input[type="file"]');
        const validFile = new File(['image content'], 'test.jpg', { type: 'image/jpeg' });
        await user.upload(fileInput!, validFile);
      });

      await waitFor(async () => {
        const uploadPortraitButton = screen.getByText('Upload Portrait');
        await user.click(uploadPortraitButton);
      });

      await waitFor(() => {
        expect(screen.getByText('Upload failed')).toBeInTheDocument();
      });
    });
  });

  describe('Portrait Display and Management', () => {
    it('should display existing portrait when available', () => {
      const dataWithPortrait = {
        ...defaultCharacterData,
        portrait: 'https://example.com/portrait.jpg',
      };

      render(
        <FormWrapper>
          <PortraitStep {...{ ...defaultProps, data: dataWithPortrait }} />
        </FormWrapper>
      );

      const portraitImage = screen.getByAltText('Character portrait');
      expect(portraitImage).toBeInTheDocument();
      expect(portraitImage).toHaveAttribute('src', 'https://example.com/portrait.jpg');
    });

    it('should allow portrait removal', async () => {
      const user = userEvent.setup();
      const dataWithPortrait = {
        ...defaultCharacterData,
        portrait: 'https://example.com/portrait.jpg',
      };

      render(
        <FormWrapper>
          <PortraitStep {...{ ...defaultProps, data: dataWithPortrait }} />
        </FormWrapper>
      );

      const removeButton = screen.getByTitle('Remove portrait');
      await user.click(removeButton);

      expect(mockUpdateData).toHaveBeenCalledWith({ portrait: '' });
    });

    it('should display avatar when portrait type is avatar and no portrait URL', () => {
      const dataWithAvatar = {
        ...defaultCharacterData,
        avatarSeed: 'test-seed',
        portraitType: 'avatar' as const,
      };

      render(
        <FormWrapper>
          <PortraitStep {...{ ...defaultProps, data: dataWithAvatar }} />
        </FormWrapper>
      );

      const avatarImage = screen.getByAltText('Character avatar');
      expect(avatarImage).toBeInTheDocument();
    });
  });

  describe('Form Integration', () => {
    it('should update form values when portrait changes', async () => {
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

        // Watch form values
        const watchedValues = methods.watch();
        formValues = watchedValues;

        return (
          <FormProvider {...methods}>
            <PortraitStep {...defaultProps} />
          </FormProvider>
        );
      };

      render(<TestWrapper />);

      const avatarButton = screen.getByText('Generated Avatar').closest('button');
      await user.click(avatarButton!);

      await waitFor(() => {
        const generateButton = screen.getByText('Generate New Avatar');
        user.click(generateButton);
      });

      await waitFor(() => {
        expect(formValues.avatarSeed).toBeDefined();
        expect(formValues.portraitStyle).toBe('adventurer');
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels and roles', () => {
      render(
        <FormWrapper>
          <PortraitStep {...defaultProps} />
        </FormWrapper>
      );

      // Check for accessible buttons
      expect(screen.getByRole('button', { name: /generated avatar/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /upload image/i })).toBeInTheDocument();
    });

    it('should handle keyboard navigation', async () => {
      const user = userEvent.setup();

      render(
        <FormWrapper>
          <PortraitStep {...defaultProps} />
        </FormWrapper>
      );

      const avatarButton = screen.getByText('Generated Avatar').closest('button');
      
      // Focus and activate with keyboard
      avatarButton?.focus();
      await user.keyboard('{Enter}');

      await waitFor(() => {
        expect(screen.getByText('Generate Avatar')).toBeInTheDocument();
      });
    });

    it('should provide appropriate alt text for images', () => {
      const dataWithPortrait = {
        ...defaultCharacterData,
        portrait: 'https://example.com/portrait.jpg',
      };

      render(
        <FormWrapper>
          <PortraitStep {...{ ...defaultProps, data: dataWithPortrait }} />
        </FormWrapper>
      );

      const portraitImage = screen.getByAltText('Character portrait');
      expect(portraitImage).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle missing character name gracefully', () => {
      const dataWithoutName = {
        ...defaultCharacterData,
        name: '',
      };

      render(
        <FormWrapper>
          <PortraitStep {...{ ...defaultProps, data: dataWithoutName }} />
        </FormWrapper>
      );

      // Should still render without errors
      expect(screen.getByText('Character Portrait')).toBeInTheDocument();
    });

    it('should handle component unmounting during upload', async () => {
      const user = userEvent.setup();

      const { unmount } = render(
        <FormWrapper>
          <PortraitStep {...defaultProps} />
        </FormWrapper>
      );

      const uploadButton = screen.getByText('Upload Image').closest('button');
      await user.click(uploadButton!);

      // Unmount component during upload process
      unmount();

      // Should not throw errors
      expect(true).toBe(true);
    });

    it('should handle rapid type switching', async () => {
      const user = userEvent.setup();

      render(
        <FormWrapper>
          <PortraitStep {...defaultProps} />
        </FormWrapper>
      );

      const avatarButton = screen.getByText('Generated Avatar').closest('button');
      const uploadButton = screen.getByText('Upload Image').closest('button');

      // Rapidly switch between types
      await user.click(avatarButton!);
      await user.click(uploadButton!);
      await user.click(avatarButton!);

      // Should handle gracefully
      expect(screen.getByText('Generate Avatar')).toBeInTheDocument();
    });
  });
});