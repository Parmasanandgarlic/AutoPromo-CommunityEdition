import { describe, expect, it } from 'vitest';
import { db } from '../../src/agent/db.js';

describe('Database engine robust scaling & security', () => {
  it('does not exceed maximum call stack size on large collections', () => {
    // Generate an array of 70,000 items to test the call stack limit
    const largeList = Array.from({ length: 70000 }, (_, i) => ({ id: i + 1 }));
    // Access the private generateId via indexing
    const nextId = (db as any).generateId(largeList);
    expect(nextId).toBe(70001);
  });

  it('handles empty collections safely', () => {
    const nextId = (db as any).generateId([]);
    expect(nextId).toBe(1);
  });
});
