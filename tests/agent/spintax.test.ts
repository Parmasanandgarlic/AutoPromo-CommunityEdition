import { describe, expect, it } from 'vitest';
import { parseSpintax } from '../../src/agent/spintax.js';

describe('Spintax parser security and reliability', () => {
  it('correctly handles basic spintax alternation', () => {
    const template = '{Hello|Hi} world';
    const result = parseSpintax(template);
    expect(['Hello world', 'Hi world']).toContain(result);
  });

  it('handles nested spintax cleanly', () => {
    const template = '{Greetings|{Hello|Hi}} traveler';
    const result = parseSpintax(template);
    expect(['Greetings traveler', 'Hello traveler', 'Hi traveler']).toContain(result);
  });

  it('safely handles strings with dollar signs and special replacement patterns', () => {
    const template = 'Discount: {$100|$200} off!';
    const result = parseSpintax(template);
    expect(['Discount: $100 off!', 'Discount: $200 off!']).toContain(result);
  });

  it('handles non-string or empty input without crashing', () => {
    expect(parseSpintax('')).toBe('');
    expect(parseSpintax(null as any)).toBe('');
    expect(parseSpintax(undefined as any)).toBe('');
  });

  it('handles identical multiple placeholders accurately', () => {
    const template = '{A|A} then {A|A}';
    expect(parseSpintax(template)).toBe('A then A');
  });
});
