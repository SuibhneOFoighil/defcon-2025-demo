import '@testing-library/jest-dom/vitest';
import { config } from 'dotenv';
import React from 'react';

// Make React available globally for all test files
global.React = React;

// Mock window.matchMedia for next-themes
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Load environment variables from .env.local for tests
config({ path: '.env.local' });

// Set up test environment variables if not already set
if (!process.env.LUDUS_API_BASE_URL) {
  process.env.LUDUS_API_BASE_URL = 'https://ludus.example.com:8081';
}

if (!process.env.LUDUS_API_KEY) {
  process.env.LUDUS_API_KEY = 'test-api-key-for-testing';
}

// Import MSW setup for integration tests
import('./__tests__/setup'); 