import { defineConfig } from 'vitest/config';

/**
 * Real-Postgres adapter tests — see test/integration/README.md. Kept in a
 * separate config (not just a separate `include`) so it never accidentally
 * runs as part of `npm test`. `fileParallelism: false` is load-bearing, not
 * a style choice: every integration test file truncates the whole test
 * database in its own `beforeEach` (reusing the app's own `clearDb()`), so
 * two files racing against the same disposable DB in parallel worker
 * threads would flake each other's state.
 */
export default defineConfig({
  resolve: {
    tsconfigPaths: true,
  },
  test: {
    environment: 'node',
    include: ['test/integration/**/*.test.ts'],
    fileParallelism: false,
    testTimeout: 15_000,
  },
});
