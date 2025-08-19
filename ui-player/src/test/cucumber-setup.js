// Import mocks first to set up global expect
import './cucumber-mocks.js';

// Set up DOM environment synchronously
function setupDOM() {
  try {
    // Try to set up Happy-DOM for better DOM simulation
    const { GlobalWindow } = require('happy-dom');
    const happyDOM = new GlobalWindow({
      url: 'http://localhost:3000',
      width: 1024,
      height: 768,
    });

    // Set up global DOM environment
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

    console.log('Happy-DOM environment initialized');
  } catch (error) {
    console.warn('Happy-DOM not available, using minimal DOM setup:', error.message);
    
    // Fallback to minimal DOM setup
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
      document: {},
      navigator: {},
    };
    global.document = global.window.document;
    global.HTMLElement = class HTMLElement {};
    global.Event = class Event {};
  }
}

// Set up DOM immediately
setupDOM();

// Set up additional DOM APIs that might be missing
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

// Mock localStorage and sessionStorage
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

// Set up basic console methods if not available
if (typeof console === 'undefined') {
  global.console = {
    log: () => {},
    error: () => {},
    warn: () => {},
    info: () => {},
  };
}

// Try to load jest-dom matchers synchronously
try {
  require('@testing-library/jest-dom');
  console.log('Jest-DOM matchers loaded');
} catch (error) {
  console.warn('Jest-DOM not available, using basic matchers');
}

console.log('Cucumber setup complete');