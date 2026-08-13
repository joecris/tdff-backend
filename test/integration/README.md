# Integration tests

Tests here exercise real adapters (e.g. `DrizzleUserRepository`,
`DrizzleScoringRepository`) and real DB-level constraints (e.g. the
`competition_entry_selections` CHECK constraint) against an actual
Postgres instance — never against a fake. Kept strictly separate from
`test/unit`, which must never touch the network or a database: separate
directory, separate `vitest.integration.config.mts`, separate
`npm run test:integration` script. `npm test` never runs these.

Every file truncates the whole database in its own `beforeEach` (reusing
the app's own `clearDb()`), so these must run against a **disposable**
database — never your dev DB, never anything with data you care about.
`vitest.integration.config.mts` sets `fileParallelism: false` for exactly
this reason: two files racing the same DB in parallel workers would flake
each other's state.

## Running locally

```bash
docker compose up -d postgres-test     # separate container/port/volume from the dev DB
DATABASE_URL=postgres://tdff_test:tdff_test@localhost:5433/tdff_test npm run db:migrate
DATABASE_URL=postgres://tdff_test:tdff_test@localhost:5433/tdff_test npm run test:integration
```

CI does not use `postgres-test` at all — it spins up its own ephemeral
Postgres service container directly in the workflow instead (see
`.github/workflows/ci.yml`).
