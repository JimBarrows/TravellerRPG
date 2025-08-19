import '@testing-library/jest-dom';

// Mock environment variables
Object.defineProperty(import.meta, 'env', {
  value: {
    VITE_API_URL: 'http://localhost:3000/api',
    PROD: false,
    DEV: true,
  },
  writable: true,
});

// Mock localStorage
Object.defineProperty(window, 'localStorage', {
  value: {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
    length: 0,
    key: vi.fn(),
  },
  writable: true,
});

// Mock URL.createObjectURL and URL.revokeObjectURL
Object.defineProperty(global.URL, 'createObjectURL', {
  value: vi.fn(() => 'mocked-object-url'),
  writable: true,
});

Object.defineProperty(global.URL, 'revokeObjectURL', {
  value: vi.fn(),
  writable: true,
});

// Mock FileReader
global.FileReader = class MockFileReader {
  result: string | ArrayBuffer | null = null;
  error: any = null;
  readyState: number = 0;
  
  onload: ((this: FileReader, ev: ProgressEvent<FileReader>) => any) | null = null;
  onerror: ((this: FileReader, ev: ProgressEvent<FileReader>) => any) | null = null;
  onabort: ((this: FileReader, ev: ProgressEvent<FileReader>) => any) | null = null;
  onloadstart: ((this: FileReader, ev: ProgressEvent<FileReader>) => any) | null = null;
  onloadend: ((this: FileReader, ev: ProgressEvent<FileReader>) => any) | null = null;
  onprogress: ((this: FileReader, ev: ProgressEvent<FileReader>) => any) | null = null;

  readAsDataURL(file: File) {
    setTimeout(() => {
      this.result = `data:${file.type};base64,mockbase64data`;
      if (this.onload) {
        this.onload({ target: this } as ProgressEvent<FileReader>);
      }
    }, 0);
  }

  readAsText(file: File) {
    setTimeout(() => {
      this.result = 'mock file content';
      if (this.onload) {
        this.onload({ target: this } as ProgressEvent<FileReader>);
      }
    }, 0);
  }

  abort() {
    // Mock implementation
  }

  addEventListener() {
    // Mock implementation
  }

  removeEventListener() {
    // Mock implementation
  }

  dispatchEvent() {
    return true;
  }

  static readonly EMPTY = 0;
  static readonly LOADING = 1;
  static readonly DONE = 2;
};

// Mock Image
global.Image = class MockImage {
  src = '';
  width = 512;
  height = 512;
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

// Mock Canvas and 2D Context
const mockContext2D = {
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

global.HTMLCanvasElement.prototype.getContext = vi.fn(() => mockContext2D);
global.HTMLCanvasElement.prototype.toBlob = vi.fn((callback) => {
  const blob = new Blob(['mock canvas data'], { type: 'image/png' });
  setTimeout(() => callback(blob), 0);
});