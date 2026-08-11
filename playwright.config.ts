import { defineConfig } from '@playwright/test';

/**
 * Browser tests live under tests/e2e only. Keeping Playwright out of unit/security
 * Vitest suites prevents the two runners from installing competing global
 * expect implementations in the same process.
 */
export default defineConfig({
  testDir: './tests/e2e',
  testMatch: '**/*.@(spec|test).@(ts|tsx|js|jsx)',
});
