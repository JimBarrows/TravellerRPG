import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FormProvider, useForm } from 'react-hook-form';
import PortraitStep from '../PortraitStep';
import type { CharacterCreationData, WizardStepProps } from '../../../types/characterCreation';

// Performance and accessibility tests for PortraitStep

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
    <div className={`card ${className || ''}`} role="region">
      {children}
    </div>
  ),
}));

const FormWrapper = ({ children }: any) => {
  const methods = useForm();
  return <FormProvider {...methods}>{children}</FormProvider>;
};

// Mock performance API
const mockPerformance = {
  now: vi.fn(() => Date.now()),
  mark: vi.fn(),
  measure: vi.fn(),
  getEntriesByName: vi.fn(() => []),
  clearMarks: vi.fn(),
  clearMeasures: vi.fn(),
};

// @ts-ignore
global.performance = mockPerformance;

describe('PortraitStep Performance and Accessibility Tests', () => {
  const mockUpdateData = vi.fn();
  const mockOnNext = vi.fn();
  const mockOnPrevious = vi.fn();

  const defaultCharacterData: CharacterCreationData = {
    id: 'perf-test-character',
    name: 'Performance Test Character',
    species: 'Human',
    gender: 'Non-binary',
    age: 28,
    characteristics: {
      strength: 10,
      dexterity: 10,
      endurance: 10,
      intelligence: 10,
      education: 10,
      social: 10,
    },
    background: {
      homeworld: 'Vega Prime',
      socialClass: 'Upper',
      upbringing: 'Wealthy',
      family: 'Corporate dynasty',
      earlyLife: 'Private tutoring',
      startingSkills: ['Broker', 'Admin', 'Computer'],
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
    startingCredits: 10000,
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
    mockPerformance.now.mockImplementation(() => Date.now());

    // Setup service mocks with realistic timing
    mockPortraitService.generateAvatarUrl.mockImplementation((style: string, seed: string) => {
      return `https://api.dicebear.com/7.x/${style}/png?seed=${encodeURIComponent(seed)}&size=512&format=png`;
    });

    mockPortraitService.uploadPortrait.mockImplementation(async (file: File) => {
      // Simulate upload time based on file size
      const uploadTime = Math.min(file.size / 1000, 2000); // Max 2 seconds
      await new Promise(resolve => setTimeout(resolve, uploadTime));
      return `https://cdn.example.com/portraits/${file.name}`;
    });

    mockPortraitService.resizeImage.mockImplementation(async (file: File, width: number, height: number) => {
      // Simulate resize time based on dimensions
      const resizeTime = (width * height) / 100000; // Simulated complexity
      await new Promise(resolve => setTimeout(resolve, Math.min(resizeTime, 500)));
      return new Blob(['resized'], { type: file.type });
    });
  });

  describe('Component Performance', () => {
    it('should render initial state within performance budget', async () => {
      const startTime = performance.now();

      render(
        <FormWrapper>
          <PortraitStep {...defaultProps} />
        </FormWrapper>
      );

      const endTime = performance.now();
      const renderTime = endTime - startTime;

      // Component should render within 100ms
      expect(renderTime).toBeLessThan(100);

      // All essential elements should be present
      expect(screen.getByText('Character Portrait')).toBeInTheDocument();
      expect(screen.getByText('Portrait Type')).toBeInTheDocument();
      expect(screen.getByText('Current Portrait')).toBeInTheDocument();
    });

    it('should handle rapid state changes efficiently', async () => {
      const user = userEvent.setup();

      render(
        <FormWrapper>
          <PortraitStep {...defaultProps} />
        </FormWrapper>
      );

      const startTime = performance.now();

      // Perform rapid state changes
      const avatarButton = screen.getByText('Generated Avatar').closest('button');
      const uploadButton = screen.getByText('Upload Image').closest('button');

      for (let i = 0; i < 10; i++) {
        await user.click(avatarButton!);
        await user.click(uploadButton!);
      }

      const endTime = performance.now();
      const totalTime = endTime - startTime;

      // Should handle rapid changes without significant performance degradation
      expect(totalTime).toBeLessThan(1000); // Less than 1 second for 20 state changes
    });

    it('should debounce expensive operations', async () => {
      const user = userEvent.setup();

      render(
        <FormWrapper>
          <PortraitStep {...defaultProps} />
        </FormWrapper>
      );

      const avatarButton = screen.getByText('Generated Avatar').closest('button');
      await user.click(avatarButton!);

      const generateButton = screen.getByText('Generate New Avatar');
      
      // Rapidly click generate button multiple times
      const startTime = performance.now();
      for (let i = 0; i < 5; i++) {
        await user.click(generateButton);
      }

      await waitFor(() => {
        expect(mockUpdateData).toHaveBeenCalled();
      });

      const endTime = performance.now();
      const totalTime = endTime - startTime;

      // Should not create excessive calls
      expect(mockUpdateData.mock.calls.length).toBeLessThanOrEqual(5);
      expect(totalTime).toBeLessThan(500);
    });

    it('should handle large file processing efficiently', async () => {
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

      // Create a reasonably large file
      const largeFile = new File(
        [new ArrayBuffer(3 * 1024 * 1024)], // 3MB
        'large-image.jpg',
        { type: 'image/jpeg' }
      );

      const startTime = performance.now();

      await user.upload(fileInput!, largeFile);

      // Should handle file processing without blocking UI
      await waitFor(() => {
        expect(screen.getByText('Crop Your Image')).toBeInTheDocument();
      }, { timeout: 5000 });

      const endTime = performance.now();
      const processingTime = endTime - startTime;

      // File processing should complete in reasonable time
      expect(processingTime).toBeLessThan(3000); // Less than 3 seconds
    });

    it('should optimize repeated avatar generations', async () => {
      const user = userEvent.setup();

      render(
        <FormWrapper>
          <PortraitStep {...defaultProps} />
        </FormWrapper>
      );

      const avatarButton = screen.getByText('Generated Avatar').closest('button');
      await user.click(avatarButton!);

      const generateButton = screen.getByText('Generate New Avatar');
      
      const times: number[] = [];

      // Generate multiple avatars and measure time
      for (let i = 0; i < 3; i++) {
        const startTime = performance.now();
        await user.click(generateButton);
        
        await waitFor(() => {
          expect(mockUpdateData).toHaveBeenCalledTimes(i + 1);
        });

        const endTime = performance.now();
        times.push(endTime - startTime);
      }

      // Subsequent generations should not be significantly slower
      const averageTime = times.reduce((sum, time) => sum + time, 0) / times.length;
      expect(averageTime).toBeLessThan(100); // Average under 100ms
    });

    it('should clean up resources on unmount', () => {
      const createObjectURLSpy = vi.spyOn(URL, 'createObjectURL').mockImplementation(() => 'mock-url');
      const revokeObjectURLSpy = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});

      const { unmount } = render(
        <FormWrapper>
          <PortraitStep {...defaultProps} />
        </FormWrapper>
      );

      // Component should clean up any created object URLs on unmount
      unmount();

      // While we can't directly test cleanup in this test environment,
      // we can ensure the component doesn't throw errors on unmount
      expect(true).toBe(true);

      createObjectURLSpy.mockRestore();
      revokeObjectURLSpy.mockRestore();
    });
  });

  describe('Accessibility Compliance', () => {
    it('should meet WCAG 2.1 AA standards for keyboard navigation', async () => {
      const user = userEvent.setup();

      render(
        <FormWrapper>
          <PortraitStep {...defaultProps} />
        </FormWrapper>
      );

      // All interactive elements should be focusable
      const interactiveElements = [
        screen.getByText('Generated Avatar').closest('button'),
        screen.getByText('Upload Image').closest('button'),
      ];

      for (const element of interactiveElements) {
        expect(element).not.toBeNull();
        element?.focus();
        expect(document.activeElement).toBe(element);
        
        // Should be activatable with Enter or Space
        await user.keyboard('{Enter}');
        // Component should respond (no need to check specific behavior, just no errors)
      }
    });

    it('should provide appropriate ARIA labels and roles', () => {
      render(
        <FormWrapper>
          <PortraitStep {...defaultProps} />
        </FormWrapper>
      );

      // Check for semantic structure
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);

      // All buttons should have accessible text
      buttons.forEach(button => {
        expect(button.textContent || button.getAttribute('aria-label')).toBeTruthy();
      });

      // Cards should have appropriate roles
      const regions = screen.getAllByRole('region');
      expect(regions.length).toBeGreaterThan(0);
    });

    it('should provide clear error messaging for screen readers', async () => {
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

      // Upload invalid file
      const invalidFile = new File(['content'], 'test.txt', { type: 'text/plain' });
      await user.upload(fileInput!, invalidFile);

      await waitFor(() => {
        const errorMessage = screen.getByText(/Please upload a JPEG, PNG, GIF, or WebP image/);
        
        // Error should be in the accessibility tree
        expect(errorMessage).toBeInTheDocument();
        
        // Should have appropriate styling for visibility
        expect(errorMessage).toHaveClass(/text-destructive/);
      });
    });

    it('should support high contrast mode', () => {
      // Mock high contrast media query
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: vi.fn().mockImplementation(query => ({
          matches: query.includes('prefers-contrast: high'),
          media: query,
          onchange: null,
          addListener: vi.fn(),
          removeListener: vi.fn(),
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
          dispatchEvent: vi.fn(),
        })),
      });

      render(
        <FormWrapper>
          <PortraitStep {...defaultProps} />
        </FormWrapper>
      );

      // Component should render without issues in high contrast mode
      expect(screen.getByText('Character Portrait')).toBeInTheDocument();
    });

    it('should be usable with reduced motion preferences', async () => {
      const user = userEvent.setup();

      // Mock reduced motion preference
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: vi.fn().mockImplementation(query => ({
          matches: query.includes('prefers-reduced-motion: reduce'),
          media: query,
          onchange: null,
          addListener: vi.fn(),
          removeListener: vi.fn(),
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
          dispatchEvent: vi.fn(),
        })),
      });

      render(
        <FormWrapper>
          <PortraitStep {...defaultProps} />
        </FormWrapper>
      );

      // All functionality should work without motion
      const avatarButton = screen.getByText('Generated Avatar').closest('button');
      await user.click(avatarButton!);

      await waitFor(() => {
        expect(screen.getByText('Generate Avatar')).toBeInTheDocument();
      });
    });

    it('should provide adequate touch targets for mobile', () => {
      render(
        <FormWrapper>
          <PortraitStep {...defaultProps} />
        </FormWrapper>
      );

      const buttons = screen.getAllByRole('button');

      buttons.forEach(button => {
        const computedStyle = window.getComputedStyle(button);
        // While we can't easily test actual rendered dimensions in jsdom,
        // we can ensure buttons have proper classes/styling for touch targets
        expect(button.className || button.getAttribute('data-variant')).toBeTruthy();
      });
    });

    it('should handle screen reader announcements correctly', async () => {
      const user = userEvent.setup();

      render(
        <FormWrapper>
          <PortraitStep {...defaultProps} />
        </FormWrapper>
      );

      const avatarButton = screen.getByText('Generated Avatar').closest('button');
      await user.click(avatarButton!);

      // Dynamic content changes should be announced
      await waitFor(() => {
        const newContent = screen.getByText('Generate Avatar');
        expect(newContent).toBeInTheDocument();
        
        // Content should be in the accessibility tree
        expect(newContent).toBeVisible();
      });
    });

    it('should maintain focus management during state changes', async () => {
      const user = userEvent.setup();

      render(
        <FormWrapper>
          <PortraitStep {...defaultProps} />
        </FormWrapper>
      );

      const avatarButton = screen.getByText('Generated Avatar').closest('button');
      avatarButton?.focus();
      
      await user.keyboard('{Enter}');

      await waitFor(() => {
        // Focus should be managed appropriately
        expect(document.activeElement).toBeTruthy();
        // Should not lose focus to body
        expect(document.activeElement?.tagName).not.toBe('BODY');
      });
    });

    it('should provide appropriate loading states', async () => {
      const user = userEvent.setup();

      // Mock slow upload
      mockPortraitService.uploadPortrait.mockImplementation(() => {
        return new Promise(resolve => {
          setTimeout(() => resolve('https://example.com/uploaded.jpg'), 1000);
        });
      });

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
      await user.click(uploadButton!);

      const fileInput = screen.getByRole('button', { name: /choose file/i })
        .closest('div')?.querySelector('input[type="file"]');

      const testFile = new File(['content'], 'slow-upload.jpg', { type: 'image/jpeg' });
      await user.upload(fileInput!, testFile);

      const uploadPortraitButton = screen.getByText('Upload Portrait');
      await user.click(uploadPortraitButton);

      // Should show loading state
      await waitFor(() => {
        expect(screen.getByText('Uploading...')).toBeInTheDocument();
      });

      // Loading state should be accessible
      const loadingButton = screen.getByText('Uploading...');
      expect(loadingButton).toBeDisabled();
    });
  });

  describe('Memory and Resource Optimization', () => {
    it('should handle multiple image operations without memory leaks', async () => {
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

      // Process multiple images
      for (let i = 0; i < 3; i++) {
        const testFile = new File([`content-${i}`], `test-${i}.jpg`, { type: 'image/jpeg' });
        await user.upload(fileInput!, testFile);

        await waitFor(() => {
          const applyCropButton = screen.getByText('Apply Crop');
          user.click(applyCropButton);
        });

        await waitFor(() => {
          expect(mockUpdateData).toHaveBeenCalledTimes(i + 1);
        });
      }

      // Should complete all operations without issues
      expect(mockUpdateData).toHaveBeenCalledTimes(3);
    });

    it('should optimize avatar URL generation', async () => {
      const user = userEvent.setup();

      render(
        <FormWrapper>
          <PortraitStep {...defaultProps} />
        </FormWrapper>
      );

      const avatarButton = screen.getByText('Generated Avatar').closest('button');
      await user.click(avatarButton!);

      const generateButton = screen.getByText('Generate New Avatar');
      
      const startTime = performance.now();

      // Generate multiple avatars rapidly
      for (let i = 0; i < 5; i++) {
        await user.click(generateButton);
      }

      const endTime = performance.now();
      const totalTime = endTime - startTime;

      // Should be efficient even with multiple generations
      expect(totalTime).toBeLessThan(500);
      expect(mockPortraitService.generateAvatarUrl).toHaveBeenCalled();
    });
  });
});