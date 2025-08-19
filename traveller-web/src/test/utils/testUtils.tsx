import React from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { FormProvider, UseFormReturn, useForm } from 'react-hook-form';
import type { CharacterCreationData } from '../../features/character/types/characterCreation';

// Common test utilities for portrait system testing

export interface TestFormWrapperProps {
  children: React.ReactNode;
  defaultValues?: any;
  methods?: UseFormReturn<any>;
}

export const TestFormWrapper = ({ children, defaultValues = {}, methods }: TestFormWrapperProps) => {
  const formMethods = methods || useForm({ defaultValues });
  return <FormProvider {...formMethods}>{children}</FormProvider>;
};

export const createMockCharacterData = (overrides: Partial<CharacterCreationData> = {}): CharacterCreationData => ({
  id: 'test-character-id',
  name: 'Test Character',
  species: 'Human',
  gender: 'Male',
  age: 25,
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
    family: 'Nuclear family',
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
  ...overrides,
});

export const createMockFile = (
  name: string = 'test-file.jpg',
  type: string = 'image/jpeg',
  content: string = 'mock file content',
  size?: number
): File => {
  const file = new File([content], name, { type });
  
  if (size !== undefined) {
    Object.defineProperty(file, 'size', { value: size, writable: false });
  }
  
  return file;
};

export const createLargeFile = (sizeInMB: number, name: string = 'large-file.jpg'): File => {
  const sizeInBytes = sizeInMB * 1024 * 1024;
  const content = new ArrayBuffer(sizeInBytes);
  return new File([content], name, { type: 'image/jpeg' });
};

export const mockImageLoad = (width: number = 512, height: number = 512, shouldFail: boolean = false) => {
  const OriginalImage = global.Image;
  global.Image = class MockImage {
    src = '';
    width = width;
    height = height;
    onload: (() => void) | null = null;
    onerror: (() => void) | null = null;

    constructor() {
      setTimeout(() => {
        if (shouldFail && this.onerror) {
          this.onerror();
        } else if (!shouldFail && this.onload) {
          this.onload();
        }
      }, 0);
    }
  } as any;

  return () => {
    global.Image = OriginalImage;
  };
};

export const mockFileReader = (result: string | ArrayBuffer | null = 'data:image/jpeg;base64,mockdata', shouldFail: boolean = false) => {
  const OriginalFileReader = global.FileReader;
  global.FileReader = class MockFileReader {
    result: string | ArrayBuffer | null = result;
    error: any = null;
    readyState: number = 0;
    
    onload: ((this: FileReader, ev: ProgressEvent<FileReader>) => any) | null = null;
    onerror: ((this: FileReader, ev: ProgressEvent<FileReader>) => any) | null = null;
    onabort: ((this: FileReader, ev: ProgressEvent<FileReader>) => any) | null = null;
    onloadstart: ((this: FileReader, ev: ProgressEvent<FileReader>) => any) | null = null;
    onloadend: ((this: FileReader, ev: ProgressEvent<FileReader>) => any) | null = null;
    onprogress: ((this: FileReader, ev: ProgressEvent<FileReader>) => any) | null = null;

    readAsDataURL(_file: File) {
      setTimeout(() => {
        if (shouldFail && this.onerror) {
          this.onerror({} as ProgressEvent<FileReader>);
        } else if (!shouldFail && this.onload) {
          this.result = result;
          this.onload({ target: this } as ProgressEvent<FileReader>);
        }
      }, 0);
    }

    readAsText(_file: File) {
      setTimeout(() => {
        if (shouldFail && this.onerror) {
          this.onerror({} as ProgressEvent<FileReader>);
        } else if (!shouldFail && this.onload) {
          this.result = typeof result === 'string' ? result : 'mock text content';
          this.onload({ target: this } as ProgressEvent<FileReader>);
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

  return () => {
    global.FileReader = OriginalFileReader;
  };
};

export const mockCanvas = (shouldFailToBlob: boolean = false, shouldFailGetContext: boolean = false) => {
  const originalGetContext = HTMLCanvasElement.prototype.getContext;
  const originalToBlob = HTMLCanvasElement.prototype.toBlob;

  HTMLCanvasElement.prototype.getContext = vi.fn(() => {
    if (shouldFailGetContext) return null;
    
    return {
      drawImage: vi.fn(),
      getImageData: vi.fn(),
      putImageData: vi.fn(),
      clearRect: vi.fn(),
      fillRect: vi.fn(),
      strokeRect: vi.fn(),
      beginPath: vi.fn(),
      closePath: vi.fn(),
      moveTo: vi.fn(),
      lineTo: vi.fn(),
      arc: vi.fn(),
      fill: vi.fn(),
      stroke: vi.fn(),
      save: vi.fn(),
      restore: vi.fn(),
      scale: vi.fn(),
      rotate: vi.fn(),
      translate: vi.fn(),
      transform: vi.fn(),
      setTransform: vi.fn(),
      fillText: vi.fn(),
      measureText: vi.fn(() => ({ width: 0 })),
    };
  });

  HTMLCanvasElement.prototype.toBlob = vi.fn((callback) => {
    setTimeout(() => {
      if (shouldFailToBlob) {
        callback(null);
      } else {
        const blob = new Blob(['mock canvas data'], { type: 'image/png' });
        callback(blob);
      }
    }, 0);
  });

  return () => {
    HTMLCanvasElement.prototype.getContext = originalGetContext;
    HTMLCanvasElement.prototype.toBlob = originalToBlob;
  };
};

export const mockURL = () => {
  const originalCreateObjectURL = URL.createObjectURL;
  const originalRevokeObjectURL = URL.revokeObjectURL;

  const createdUrls = new Set<string>();

  URL.createObjectURL = vi.fn((object: File | MediaSource | Blob) => {
    const url = `blob:mock-${Date.now()}-${Math.random()}`;
    createdUrls.add(url);
    return url;
  });

  URL.revokeObjectURL = vi.fn((url: string) => {
    createdUrls.delete(url);
  });

  return {
    restore: () => {
      URL.createObjectURL = originalCreateObjectURL;
      URL.revokeObjectURL = originalRevokeObjectURL;
    },
    getCreatedUrls: () => Array.from(createdUrls),
  };
};

export const mockLocalStorage = (initialValues: Record<string, string> = {}) => {
  const store = new Map(Object.entries(initialValues));

  const mockStorage = {
    getItem: vi.fn((key: string) => store.get(key) || null),
    setItem: vi.fn((key: string, value: string) => {
      store.set(key, value);
    }),
    removeItem: vi.fn((key: string) => {
      store.delete(key);
    }),
    clear: vi.fn(() => {
      store.clear();
    }),
    length: 0,
    key: vi.fn((index: number) => {
      const keys = Array.from(store.keys());
      return keys[index] || null;
    }),
  };

  Object.defineProperty(mockStorage, 'length', {
    get: () => store.size,
  });

  Object.defineProperty(window, 'localStorage', {
    value: mockStorage,
    writable: true,
  });

  return {
    store,
    mockStorage,
  };
};

export const mockEnvironment = (env: Record<string, any> = {}) => {
  const originalEnv = import.meta.env;
  
  Object.defineProperty(import.meta, 'env', {
    value: {
      ...originalEnv,
      ...env,
    },
    writable: true,
    configurable: true,
  });

  return () => {
    Object.defineProperty(import.meta, 'env', {
      value: originalEnv,
      writable: true,
      configurable: true,
    });
  };
};

export const waitForImageLoad = async (container: HTMLElement, altText: string, timeout: number = 5000) => {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error(`Image with alt text "${altText}" did not load within ${timeout}ms`));
    }, timeout);

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node instanceof HTMLImageElement && node.alt === altText) {
            clearTimeout(timer);
            observer.disconnect();
            resolve(node);
          }
        });
      });
    });

    observer.observe(container, { childList: true, subtree: true });

    // Check if image is already present
    const existingImage = container.querySelector(`img[alt="${altText}"]`) as HTMLImageElement;
    if (existingImage) {
      clearTimeout(timer);
      observer.disconnect();
      resolve(existingImage);
    }
  });
};

export const createPortraitServiceMock = () => {
  return {
    getPresignedUrl: vi.fn(),
    uploadToS3: vi.fn(),
    uploadPortrait: vi.fn(),
    resizeImage: vi.fn(),
    generateThumbnail: vi.fn(),
    generateAvatarUrl: vi.fn(),
    downloadAvatar: vi.fn(),
    
    // Helper methods to setup common scenarios
    setupSuccessfulUpload: function(viewUrl: string = 'https://example.com/success.jpg') {
      this.uploadPortrait.mockResolvedValue(viewUrl);
    },
    
    setupFailedUpload: function(error: string | Error = 'Upload failed') {
      this.uploadPortrait.mockRejectedValue(typeof error === 'string' ? new Error(error) : error);
    },
    
    setupAvatarGeneration: function() {
      this.generateAvatarUrl.mockImplementation((style: string, seed: string) => {
        return `https://api.dicebear.com/7.x/${style}/png?seed=${encodeURIComponent(seed)}&size=512&format=png`;
      });
    },
    
    reset: function() {
      Object.values(this).forEach(mock => {
        if (typeof mock === 'function' && 'mockReset' in mock) {
          mock.mockReset();
        }
      });
    }
  };
};

// Custom render function that includes common providers
export const renderWithProviders = (
  ui: React.ReactElement,
  options: RenderOptions & {
    formDefaultValues?: any;
    formMethods?: UseFormReturn<any>;
  } = {}
) => {
  const { formDefaultValues, formMethods, ...renderOptions } = options;

  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <TestFormWrapper defaultValues={formDefaultValues} methods={formMethods}>
      {children}
    </TestFormWrapper>
  );

  return render(ui, { wrapper: Wrapper, ...renderOptions });
};

// Performance measurement utilities
export const measurePerformance = (name: string) => {
  const startTime = performance.now();
  
  return {
    end: () => {
      const endTime = performance.now();
      const duration = endTime - startTime;
      return { duration, startTime, endTime };
    },
  };
};

// Accessibility testing helpers
export const checkKeyboardNavigation = async (elements: HTMLElement[]) => {
  for (const element of elements) {
    element.focus();
    expect(document.activeElement).toBe(element);
  }
};

export const checkAriaLabels = (elements: HTMLElement[]) => {
  elements.forEach(element => {
    const hasAccessibleName = 
      element.textContent || 
      element.getAttribute('aria-label') || 
      element.getAttribute('aria-labelledby');
    
    expect(hasAccessibleName).toBeTruthy();
  });
};