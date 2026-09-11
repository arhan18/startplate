import { describe, it, expect } from 'vitest';
import { formatPrice, slugify, truncate } from './utils';

describe('formatPrice', () => {
  it('formats USD correctly', () => {
    expect(formatPrice(9.99)).toBe('$9.99');
  });

  it('formats whole numbers', () => {
    expect(formatPrice(10)).toBe('$10.00');
  });

  it('handles zero', () => {
    expect(formatPrice(0)).toBe('$0.00');
  });
});

describe('slugify', () => {
  it('converts text to slug', () => {
    expect(slugify('Hello World')).toBe('hello-world');
  });

  it('handles special characters', () => {
    expect(slugify('What?! No way...')).toBe('what-no-way');
  });

  it('handles multiple spaces', () => {
    expect(slugify('Hello   World')).toBe('hello-world');
  });
});

describe('truncate', () => {
  it('truncates long text', () => {
    expect(truncate('Hello World', 5)).toBe('Hello...');
  });

  it('does not truncate short text', () => {
    expect(truncate('Hi', 5)).toBe('Hi');
  });

  it('handles empty string', () => {
    expect(truncate('', 5)).toBe('');
  });
});
