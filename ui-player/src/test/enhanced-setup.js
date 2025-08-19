// Enhanced setup for Cucumber tests with React support

// Set up basic expect function
const createExpect = (actual) => {
  const expectObj = {
    toBe: (expected) => {
      if (actual !== expected) {
        throw new Error(`Expected ${actual} to be ${expected}`);
      }
    },
    toEqual: (expected) => {
      if (JSON.stringify(actual) !== JSON.stringify(expected)) {
        throw new Error(
          `Expected ${JSON.stringify(actual)} to equal ${JSON.stringify(expected)}`,
        );
      }
    },
    toBeTruthy: () => {
      if (!actual) {
        throw new Error(`Expected ${actual} to be truthy`);
      }
    },
    toBeInTheDocument: () => {
      // Basic check for DOM element
      if (!actual || typeof actual.ownerDocument === "undefined") {
        throw new Error("Expected element to be in the document");
      }
    },
    toHaveClass: (className) => {
      if (
        !actual ||
        !actual.classList ||
        !actual.classList.contains(className)
      ) {
        throw new Error(`Expected element to have class "${className}"`);
      }
    },
    toBeEnabled: () => {
      if (!actual || actual.disabled) {
        throw new Error("Expected element to be enabled");
      }
    },
    toBeDisabled: () => {
      if (!actual || !actual.disabled) {
        throw new Error("Expected element to be disabled");
      }
    },
    not: {
      toBeInTheDocument: () => {
        if (actual && typeof actual.ownerDocument !== "undefined") {
          throw new Error("Expected element not to be in the document");
        }
      },
    },
  };

  return expectObj;
};

global.expect = createExpect;

// Set up DOM environment with Happy-DOM if available
try {
  const { GlobalWindow } = require("happy-dom");
  const happyDOM = new GlobalWindow({
    url: "http://localhost:3000",
    width: 1024,
    height: 768,
  });

  global.window = happyDOM.window;
  global.document = happyDOM.window.document;
  global.navigator = happyDOM.window.navigator;
  global.HTMLElement = happyDOM.window.HTMLElement;
  global.HTMLFormElement = happyDOM.window.HTMLFormElement;
  global.HTMLInputElement = happyDOM.window.HTMLInputElement;
  global.HTMLButtonElement = happyDOM.window.HTMLButtonElement;
  global.Event = happyDOM.window.Event;
  global.KeyboardEvent = happyDOM.window.KeyboardEvent;
  global.MouseEvent = happyDOM.window.MouseEvent;

  console.log("Happy-DOM environment initialized for React testing");
} catch (error) {
  console.warn("Happy-DOM not available, using basic DOM setup");

  // Basic DOM setup
  global.window = {
    matchMedia: (query) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => {},
    }),
    document: {
      createElement: (tag) => ({
        tagName: tag,
        classList: {
          contains: () => false,
          add: () => {},
          remove: () => {},
        },
        addEventListener: () => {},
        removeEventListener: () => {},
        setAttribute: () => {},
        getAttribute: () => null,
      }),
      body: {},
    },
    navigator: {},
    location: { pathname: "/" },
  };

  global.document = global.window.document;
  global.HTMLElement = class HTMLElement {};
  global.Event = class Event {};
}

// Mock additional APIs
global.ResizeObserver = class ResizeObserver {
  constructor(callback) {
    this.callback = callback;
  }
  observe() {}
  unobserve() {}
  disconnect() {}
};

global.IntersectionObserver = class IntersectionObserver {
  constructor(callback, options = {}) {
    this.callback = callback;
    this.options = options;
  }
  observe() {}
  unobserve() {}
  disconnect() {}
};

global.localStorage = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {},
  clear: () => {},
};

global.sessionStorage = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {},
  clear: () => {},
};

// Mock function factory
const createMockFn = (implementation) => {
  const mockFn = (...args) => mockFn.implementation(...args);
  mockFn.implementation = implementation || (() => {});
  mockFn.calls = [];

  mockFn.mockImplementation = (fn) => {
    mockFn.implementation = fn;
    return mockFn;
  };

  mockFn.mockReturnValue = (value) => {
    mockFn.implementation = () => value;
    return mockFn;
  };

  mockFn.mockResolvedValue = (value) => {
    mockFn.implementation = () => Promise.resolve(value);
    return mockFn;
  };

  mockFn.mockRejectedValue = (value) => {
    mockFn.implementation = () => Promise.reject(value);
    return mockFn;
  };

  mockFn.mockClear = () => {
    mockFn.calls = [];
    return mockFn;
  };

  mockFn.mockReset = () => {
    mockFn.calls = [];
    mockFn.implementation = () => {};
    return mockFn;
  };

  return new Proxy(mockFn, {
    apply(target, thisArg, argumentsList) {
      target.calls.push(argumentsList);
      return target.implementation.apply(thisArg, argumentsList);
    },
  });
};

global.jest = { fn: createMockFn };
global.createMockFn = createMockFn;

console.log("Enhanced Cucumber setup loaded with React support");
