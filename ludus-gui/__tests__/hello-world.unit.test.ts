import { describe, it, expect } from 'vitest';

describe('Hello World', () => {
  it('should pass a basic test', () => {
    expect(true).toBe(true);
  });

  it('should handle string operations', () => {
    const greeting = 'Hello World';
    expect(greeting).toBe('Hello World');
    expect(greeting.length).toBe(11);
  });

  it('should work with numbers', () => {
    expect(1 + 1).toBe(2);
    expect(10 * 10).toBe(100);
  });
});
