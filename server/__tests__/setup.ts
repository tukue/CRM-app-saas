import { beforeAll, afterAll, beforeEach } from '@jest/globals';

// Test setup configuration
beforeAll(async () => {
  // Setup test environment
  process.env.NODE_ENV = 'test';
});

afterAll(async () => {
  // Cleanup after all tests
});

beforeEach(() => {
  // Reset any shared state before each test
  jest.clearAllMocks();
});