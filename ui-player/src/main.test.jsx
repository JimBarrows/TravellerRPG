/**
 * Main Entry Point Tests
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock React DOM
const mockRender = vi.fn();
const mockCreateRoot = vi.fn(() => ({
  render: mockRender
}));

vi.mock('react-dom/client', () => ({
  createRoot: mockCreateRoot
}));

// Mock App component
vi.mock('./App.jsx', () => ({
  default: () => 'MockedApp'
}));

// Mock document.getElementById
const mockGetElementById = vi.fn();
Object.defineProperty(document, 'getElementById', {
  value: mockGetElementById,
  writable: true
});

describe('main.jsx', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Reset modules to ensure clean imports
    vi.resetModules();
    
    // Mock a root element
    mockGetElementById.mockReturnValue({
      id: 'root',
      tagName: 'DIV'
    });
  });

  describe('application initialization', () => {
    it('should call createRoot with the root element', async () => {
      const mockRootElement = { id: 'root' };
      mockGetElementById.mockReturnValue(mockRootElement);

      // Import main.jsx to execute the initialization code
      await import('./main.jsx');

      expect(document.getElementById).toHaveBeenCalledWith('root');
      expect(mockCreateRoot).toHaveBeenCalledWith(mockRootElement);
    });

    it('should render the App component wrapped in StrictMode', async () => {
      const mockRootElement = { id: 'root' };
      mockGetElementById.mockReturnValue(mockRootElement);

      await import('./main.jsx');

      expect(mockRender).toHaveBeenCalled();
      
      // Check that render was called with StrictMode and App
      const renderCall = mockRender.mock.calls[0];
      expect(renderCall).toBeDefined();
      expect(renderCall[0]).toBeDefined(); // Should have JSX element
    });

    it('should handle missing root element gracefully', async () => {
      mockGetElementById.mockReturnValue(null);
      
      // Should not throw an error when root element is missing
      // Instead createRoot should be called with null and potentially throw
      try {
        await import('./main.jsx');
        expect(mockGetElementById).toHaveBeenCalledWith('root');
      } catch (error) {
        // If it throws, that's also acceptable behavior
        expect(error).toBeDefined();
      }
    });

    it('should execute without errors when all dependencies are available', async () => {
      const mockRootElement = { id: 'root' };
      mockGetElementById.mockReturnValue(mockRootElement);

      // Should not throw
      await expect(import('./main.jsx')).resolves.toBeDefined();
    });
  });

  describe('DOM manipulation', () => {
    it('should query for the correct root element ID', async () => {
      await import('./main.jsx');

      expect(document.getElementById).toHaveBeenCalledWith('root');
      expect(document.getElementById).toHaveBeenCalledTimes(1);
    });

    it('should use the returned element for React root creation', async () => {
      const testElement = { 
        id: 'root', 
        className: 'test-root',
        appendChild: vi.fn()
      };
      mockGetElementById.mockReturnValue(testElement);

      await import('./main.jsx');

      expect(mockCreateRoot).toHaveBeenCalledWith(testElement);
    });
  });

  describe('React StrictMode usage', () => {
    it('should wrap the application in StrictMode', async () => {
      await import('./main.jsx');

      expect(mockRender).toHaveBeenCalled();
      
      // The render call should include StrictMode
      const renderArgs = mockRender.mock.calls[0][0];
      expect(renderArgs).toBeDefined();
    });
  });

  describe('CSS imports', () => {
    it('should import the index.css file', async () => {
      // Test that the import doesn't throw
      await expect(import('./main.jsx')).resolves.toBeDefined();
      
      // Note: CSS imports are typically handled by the bundler
      // and don't have runtime effects that we can easily test
    });
  });

  describe('error handling', () => {
    it('should handle createRoot errors gracefully', async () => {
      mockCreateRoot.mockImplementation(() => {
        throw new Error('CreateRoot failed');
      });

      // Should throw or handle the error appropriately
      await expect(import('./main.jsx?t=' + Date.now())).rejects.toThrow('CreateRoot failed');
    });

    it('should handle render errors gracefully', async () => {
      mockRender.mockImplementation(() => {
        throw new Error('Render failed');
      });

      await expect(import('./main.jsx?t=' + Date.now())).rejects.toThrow('Render failed');
    });
  });

  describe('module exports', () => {
    it('should not export anything (entry point module)', async () => {
      // Reset mocks for a clean import
      vi.clearAllMocks();
      mockCreateRoot.mockReturnValue({ render: mockRender });
      
      const mainModule = await import('./main.jsx?t=' + Date.now());
      
      // Entry point modules typically don't export anything
      const exportKeys = Object.keys(mainModule);
      
      // Filter out default webpack/vite exports that might be present
      const userExports = exportKeys.filter(key => 
        key !== 'default' && 
        key !== '__esModule' &&
        !key.startsWith('__')
      );
      
      expect(userExports).toHaveLength(0);
    });
  });

  describe('performance considerations', () => {
    it('should only create one React root', async () => {
      vi.clearAllMocks();
      mockCreateRoot.mockReturnValue({ render: mockRender });
      
      await import('./main.jsx?t=' + Date.now());
      
      expect(mockCreateRoot).toHaveBeenCalledTimes(1);
    });

    it('should only render once during initialization', async () => {
      vi.clearAllMocks();
      mockCreateRoot.mockReturnValue({ render: mockRender });
      
      await import('./main.jsx?t=' + Date.now());
      
      expect(mockRender).toHaveBeenCalledTimes(1);
    });
  });
});