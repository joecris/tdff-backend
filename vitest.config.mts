import { defineConfig } from 'vitest/config';

/**
 * Unit tests only — must never touch the network or a database. Real
 * Postgres-backed adapter tests live under `test/integration/` with their
 * own config (`vitest.integration.config.mts`) and `npm run test:integration`
 * script, deliberately excluded here so `npm test` stays fast and hermetic.
 */
export default defineConfig({
  resolve: {
    tsconfigPaths: true,
  },
  test: {
    environment: 'node',
    include: ['test/**/*.test.ts'],
    exclude: ['test/integration/**'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      include: ['src/modules/**/domain/**', 'src/modules/**/application/**', 'src/shared/**'],
      exclude: [
        // Type-only/port files and DTO shape declarations have nothing to
        // execute — coverage on them is meaningless noise, not signal.
        'src/**/*.port.ts',
        'src/**/dto/**',
      ],
      // v1 baseline (set just below the actual measured numbers at the
      // time this was added), not an aspirational target — a floor that
      // fails CI on a real regression, raise it as real tests are added.
      // The gap to 100% is concentrated in two honest, deliberate places,
      // not neglect: `*.service.ts` facades are thin delegation to use
      // cases (the use cases are what's unit-tested directly, against
      // fakes — the facade's own wiring is instead covered by the real
      // end-to-end smoke test in test/integration/api-smoke.test.ts,
      // which unit coverage can't see); and entity branches for invariants
      // already covered by a sibling module's identical shared validation
      // helper (e.g. `selection-validation.ts`) aren't re-asserted line-by-
      // line in every entity that calls it.
      thresholds: {
        lines: 80,
        functions: 72,
        branches: 68,
        statements: 78,
      },
    },
  },
});
