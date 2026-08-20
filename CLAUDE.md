# CLAUDE.md

Orientation for an AI coding assistant picking up work in this repo — not
a human onboarding doc (see `README.md` for that). Read this before
making changes; it captures conventions that aren't obvious from any
single file in isolation.

## What this is

A fantasy sports backend for cycling Grand Tours: users join leagues tied
to a Grand Tour, compete in one or more admin-defined "competitions"
(e.g. General Classification Top 3, King of the Mountain, a per-stage
winner) by submitting picks, get scored against admin-entered results,
and see a persisted league leaderboard. Express + TypeScript + Postgres
(Drizzle ORM, schema-and-migrations-as-code in this repo).

## Current status

All seven modules are built end-to-end (entity → ports → use cases →
service → Drizzle repository/mapper → HTTP controller/routes/DTOs), wired
through the DI composition root, seeded, and unit-tested: `user`,
`grand-tours` (+ start-list participation sub-resource),
`teams`, `riders`, `fantasy-leagues` (+ membership), `competitions`
(entries + admin-entered results), `scoring` (recalculation +
leaderboard). Excel bulk import exists for `teams`/`riders`. Integration
tests, coverage thresholds, and CI are in place. No real deploy target
yet — see `.github/workflows/ci.yml`'s `deploy` job, which is a
placeholder.

**Known, deliberate gaps** (not oversights — see inline comments at the
cited files for the reasoning): `entry_lock_at` on `competitions` is
provisioned but not enforced (locking is a frontend concern); anyone with
a valid user id can submit a competition entry regardless of league
membership; `AUTH_MODE=auth0` is not implemented (dev mode only, see
below).

## Architecture rules — do not violate these

**Hexagonal layering**, enforced by convention (no lint rule catches
violations, so review for this explicitly):

- `domain/` (entities, ports/interfaces, domain errors) never imports
  from `adapters/` or any framework (no Express, no Drizzle).
- `application/` (use cases, the module's service facade implementing its
  inbound port) depends only on domain ports — never a concrete adapter.
- `adapters/inbound/http/` (controller, routes, DTOs) and
  `adapters/outbound/persistence/` (Drizzle repository, mapper) are the
  only places framework/ORM types are allowed.
- Concrete adapters are wired to use cases in
  `src/infrastructure/config/di-container.ts` — the only place a
  `DrizzleXRepository` and an `XService` meet.

**Cross-module dependencies — same-module vs. cross-module rule**: a
module depending on ITS OWN data uses its own repository port (outbound).
A module depending on ANOTHER module's data uses that module's SERVICE
port (inbound), never its repository port. Example: `riders`' create-use
case validates a `teamId` via `TeamServicePort.getTeamById`, not
`TeamRepositoryPort.findById`. This is load-bearing, not stylistic — it's
what keeps a module's internal invariants (e.g. "does this id actually
exist") enforced in exactly one place. The one documented exception is
`scoring`'s Drizzle repository, which deliberately reads across
`competitions`/`competition_entries`/`fantasy_league_members` tables
directly — see its own doc comment for why.

**Entity pattern**: private constructor, `static create(props)` (runs
invariants, generates timestamps), `static fromPersistence(props)`
(trusts the caller, no re-validation), getters only (no public setters —
mutation happens through named methods like `updateDetails`/`rename` that
also bump `updatedAt`), `toJSON()` for the mapper to consume.

**`CompetitionType` and `slot`** are both free-form strings, not Postgres
enums — deliberately, so a new competition category or a new pick slot is
a pure code/data change, never a migration. See
`competition.entity.ts`/`selection-slot.ts` doc comments.

## TypeScript-specific conventions

- `tsconfig.json` has `exactOptionalPropertyTypes: true` and
  `noUncheckedIndexedAccess: true` — expect to hit both constantly.
- The recurring idiom for an optional field crossing a type boundary
  (Zod DTO -> domain input, domain entity -> Drizzle row, etc.):
  `...(value !== undefined ? { field: value } : {})` — never assign
  `undefined` to an optional property directly.
- Drizzle nullable columns are `T | null`; domain entity props are
  `T | undefined`. Every mapper's `toDomain` conditionally spreads on
  `!== null`; every mapper's `toPersistence` conditionally spreads on
  `!== undefined`. Getting this backwards is the single most common typo
  in this codebase's history — double-check it in every new mapper.
- `noUncheckedIndexedAccess` means `ruleSet[slot]` is `T | undefined` even
  on a plain `Record` — see `scoring-calculator.ts` for the
  `?? 0` fallback pattern this forces.

## Testing

- **Unit** (`test/unit/`, `npm test`): an in-memory `FakeXRepository`
  implementing the same port the Drizzle adapter implements, real
  application-layer services/use cases wired over the fakes (never
  mocked) — see `test/unit/user/` as the template. Deep cross-module
  chains get a shared fixture builder (`test/unit/competitions/fixtures.ts`
  is the largest example). Must never touch the network or a real
  database — enforced by `vitest.config.mts`'s `exclude`, not just
  convention.
- **Integration** (`test/integration/`, `npm run test:integration`): real
  Drizzle adapters against a real, disposable Postgres — DB-level
  constraints and cross-table queries a fake can't verify. Every file
  truncates the whole DB in its own `beforeEach`; `fileParallelism: false`
  in `vitest.integration.config.mts` is load-bearing, not incidental.
  Requires `DATABASE_URL` pointed at a throwaway database — see
  `test/integration/README.md`.
- Coverage thresholds (`vitest.config.mts`) apply to `domain/`/`application/`
  only — DTOs and port (interface) files are excluded, nothing to
  meaningfully cover there.

## Commands

```bash
npm run dev              # hot-reload dev server
npm run build             # tsc + path alias rewrite, validates the prod build compiles
npm run typecheck         # tsc --noEmit
npm run lint               # eslint .
npm run format:check        # prettier --check . (CI); `format` (no :check) writes
npm test                    # unit tests
npm run test:coverage        # unit tests + coverage thresholds
npm run test:integration      # real-Postgres tests — see test/integration/README.md first
npm run db:generate            # generate a migration from schema changes
npm run db:migrate               # apply migrations
npm run db:seed                   # non-prod only; clears the DB, then seeds every module
npm run openapi:generate           # regenerate openapi.json from the live Zod DTOs/routes
npm run openapi:check               # CI's drift gate — fails if openapi.json is stale
npm run templates:generate           # regenerate samples/*.xlsx from TEAM_COLUMNS/RIDER_COLUMNS
```

## Auth

Dev-only seam: `AUTH_MODE=dev` (the only implemented mode) reads an
unverified `x-user-id` header, looks up that user's real `role` via
`UserRepositoryPort` (falls back to a synthetic `dev-admin` principal if
the header is absent — **note**: that synthetic principal is not a real
DB row, so any admin action that also does a real user lookup on the
acting principal, e.g. `submitResults`'s `submittedByUserId`, will fail
against it; use a real seeded/created admin user's id instead). Swapping
in real Auth0 JWT verification later is a new `AuthVerifierPort`
implementation plus an env flag change — no route/controller changes.

## Adding a new module

Copy the `user` module's file layout as the template (it's the smallest
complete example): entity → ports (repository + service) → use cases →
service → Drizzle repository + mapper → controller/routes/DTOs. Then:
schema file added to `src/infrastructure/db/schema/index.ts`'s barrel,
table added to `src/infrastructure/db/seed/clear-db.ts`'s truncate list,
a `seed/*.seed.ts` file wired into `seed/index.ts`, wired into
`di-container.ts` (mind the dependency order — a module that needs
another module's service must be built after it) and
`src/infrastructure/http/routes.ts` (**leading `/` on every mount path**
— a bare path without it silently 404s instead of erroring at startup),
and fake-repository + Vitest tests before moving on.
