// Standalone mock implementation for Cucumber tests
// This replaces Vitest's vi.fn() and jest.fn() functionality

class MockFunction {
  constructor(implementation) {
    this.implementation = implementation || (() => {});
    this.calls = [];
    this.results = [];
    this.mockName = undefined;
  }

  // Mock function call
  (...args) {
    this.calls.push(args);
    try {
      const result = this.implementation(...args);
      this.results.push({ type: 'return', value: result });
      return result;
    } catch (error) {
      this.results.push({ type: 'throw', value: error });
      throw error;
    }
  }

  // Mock methods
  mockImplementation(fn) {
    this.implementation = fn;
    return this;
  }

  mockReturnValue(value) {
    this.implementation = () => value;
    return this;
  }

  mockReturnValueOnce(value) {
    const originalImpl = this.implementation;
    let called = false;
    this.implementation = (...args) => {
      if (!called) {
        called = true;
        return value;
      }
      return originalImpl(...args);
    };
    return this;
  }

  mockResolvedValue(value) {
    this.implementation = () => Promise.resolve(value);
    return this;
  }

  mockRejectedValue(value) {
    this.implementation = () => Promise.reject(value);
    return this;
  }

  mockReset() {
    this.calls = [];
    this.results = [];
    this.implementation = () => {};
    return this;
  }

  mockClear() {
    this.calls = [];
    this.results = [];
    return this;
  }

  // Getters for compatibility
  get mock() {
    return {
      calls: this.calls,
      results: this.results,
    };
  }

  // Jest-compatible assertions
  toHaveBeenCalled() {
    return this.calls.length > 0;
  }

  toHaveBeenCalledTimes(times) {
    return this.calls.length === times;
  }

  toHaveBeenCalledWith(...args) {
    return this.calls.some(call => 
      call.length === args.length && 
      call.every((arg, index) => arg === args[index])
    );
  }
}

// Create a mock function factory
export const createMockFn = (implementation) => {
  const mockFn = (...args) => mockFn.implementation(...args);
  Object.setPrototypeOf(mockFn, MockFunction.prototype);
  MockFunction.call(mockFn, implementation);
  return mockFn;
};

// Export for global use
export const mockFn = createMockFn;

// Create global mock functions for compatibility
global.jest = {
  fn: createMockFn,
};

// Create a basic expect implementation for standalone use
const createExpect = (actual) => {
  const expectObj = {
    toBe: (expected) => {
      if (actual !== expected) {
        throw new Error(`Expected ${actual} to be ${expected}`);
      }
    },
    toEqual: (expected) => {
      if (JSON.stringify(actual) !== JSON.stringify(expected)) {
        throw new Error(`Expected ${JSON.stringify(actual)} to equal ${JSON.stringify(expected)}`);
      }
    },
    toBeInTheDocument: () => {
      if (!actual || typeof actual.ownerDocument === 'undefined') {
        throw new Error(`Expected element to be in the document`);
      }
    },
    toHaveClass: (className) => {
      if (!actual || !actual.classList || !actual.classList.contains(className)) {
        throw new Error(`Expected element to have class "${className}"`);
      }
    },
    toBeEnabled: () => {
      if (!actual || actual.disabled) {
        throw new Error(`Expected element to be enabled`);
      }
    },
    toBeDisabled: () => {
      if (!actual || !actual.disabled) {
        throw new Error(`Expected element to be disabled`);
      }
    },
    not: {
      toBeInTheDocument: () => {
        if (actual && typeof actual.ownerDocument !== 'undefined') {
          throw new Error(`Expected element not to be in the document`);
        }
      },
      toHaveBeenCalled: () => {
        if (actual && typeof actual.toHaveBeenCalled === 'function' && actual.toHaveBeenCalled()) {
          throw new Error(`Expected mock function not to have been called`);
        }
      }
    }
  };

  // Add mock-specific matchers
  if (actual && typeof actual.toHaveBeenCalled === 'function') {
    expectObj.toHaveBeenCalled = () => {
      if (!actual.toHaveBeenCalled()) {
        throw new Error(`Expected mock function to have been called`);
      }
    };
    expectObj.toHaveBeenCalledTimes = (times) => {
      if (!actual.toHaveBeenCalledTimes(times)) {
        throw new Error(`Expected mock function to have been called ${times} times`);
      }
    };
    expectObj.toHaveBeenCalledWith = (...args) => {
      if (!actual.toHaveBeenCalledWith(...args)) {
        throw new Error(`Expected mock function to have been called with ${JSON.stringify(args)}`);
      }
    };
  }

  return expectObj;
};

global.expect = createExpect;

// Add expect matcher extensions for mock functions
if (global.expect && global.expect.extend) {
  global.expect.extend({
    toHaveBeenCalled(received) {
      const pass = received && typeof received.toHaveBeenCalled === 'function' 
        ? received.toHaveBeenCalled() 
        : false;
      
      return {
        message: () => pass 
          ? `expected mock function not to have been called`
          : `expected mock function to have been called`,
        pass,
      };
    },

    toHaveBeenCalledTimes(received, times) {
      const pass = received && typeof received.toHaveBeenCalledTimes === 'function'
        ? received.toHaveBeenCalledTimes(times)
        : false;
      
      return {
        message: () => pass
          ? `expected mock function not to have been called ${times} times`
          : `expected mock function to have been called ${times} times`,
        pass,
      };
    },

    toHaveBeenCalledWith(received, ...args) {
      const pass = received && typeof received.toHaveBeenCalledWith === 'function'
        ? received.toHaveBeenCalledWith(...args)
        : false;
      
      return {
        message: () => pass
          ? `expected mock function not to have been called with ${args}`
          : `expected mock function to have been called with ${args}`,
        pass,
      };
    },

    not: {
      toHaveBeenCalled(received) {
        const pass = !(received && typeof received.toHaveBeenCalled === 'function' 
          ? received.toHaveBeenCalled() 
          : false);
        
        return {
          message: () => pass 
            ? `expected mock function to have been called`
            : `expected mock function not to have been called`,
          pass,
        };
      },
    },
  });
}