// Test setup - mock browser APIs
import { vi } from 'vitest';

// Mock localStorage
const localStorageMock = {
  store: {},
  getItem: vi.fn((key) => localStorageMock.store[key] || null),
  setItem: vi.fn((key, value) => {
    localStorageMock.store[key] = value;
  }),
  removeItem: vi.fn((key) => {
    delete localStorageMock.store[key];
  }),
  clear: vi.fn(() => {
    localStorageMock.store = {};
  })
};

Object.defineProperty(globalThis, 'localStorage', {
  value: localStorageMock,
  writable: true
});

// Mock window.location
Object.defineProperty(globalThis, 'location', {
  value: {
    hostname: 'localhost',
    search: '',
    href: 'http://localhost:3000'
  },
  writable: true
});

// Mock fetch
globalThis.fetch = vi.fn();

// Mock console methods
globalThis.console = {
  ...console,
  log: vi.fn(),
  warn: vi.fn(),
  error: vi.fn()
};

// Reset mocks before each test
beforeEach(() => {
  vi.clearAllMocks();
  localStorageMock.store = {};
  // Reset localStorage mock implementation
  localStorageMock.getItem.mockImplementation((key) => localStorageMock.store[key] || null);
  localStorageMock.setItem.mockImplementation((key, value) => {
    localStorageMock.store[key] = value;
  });
});
