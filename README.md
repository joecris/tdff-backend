# tdff-backend

A fantasy sports backend for cycling Grand Tours: users join leagues tied
to a Grand Tour, compete in one or more admin-defined "competitions" by
submitting picks, get scored against admin-entered results, and see a
league leaderboard. Express + TypeScript, hexagonal (ports & adapters)
architecture, Postgres/Drizzle with schema-and-migrations-as-code in this
repo.

For architecture rules, TypeScript conventions, and testing patterns, see
[`CLAUDE.md`](./CLAUDE.md). This file is the human-facing quickstart +
API reference.

## Layout

```
src/
├── modules/<name>/
│   ├── domain/          # entities, ports (interfaces), domain errors — no framework deps
│   ├── application/     # use cases + service implementing the inbound port
│   └── adapters/
│       ├── inbound/http/    # controllers, routes, DTOs
│       └── outbound/persistence/  # Drizzle repository implementing the outbound port
├── shared/               # framework-agnostic cross-cutting code (base entity, AppError, auth, excel)
├── infrastructure/
│   ├── http/              # express app assembly, middlewares, route aggregation
│   ├── db/                 # drizzle client, schema, migrations, seed scripts
│   └── config/              # env validation, DI composition root
└── main.ts                # entrypoint
```

## Current modules

`user` · `grand-tours` (+ start-list participation) · `teams` · `riders`
· `fantasy-leagues` (+ membership) · `competitions` (entries + results) ·
`scoring` (recalculation + leaderboard). All built end-to-end and unit
tested; see [`CLAUDE.md`](./CLAUDE.md#current-status) for the full status
and known deliberate gaps.

## Getting started

```bash
cp .env.example .env      # already done; edit DATABASE_URL if needed
docker compose up -d postgres   # starts local Postgres (requires Docker installed)
npm install
npm run db:migrate         # apply migrations
npm run db:seed             # optional — seeds every module with demo data (non-prod only)
npm run dev                  # start the API with hot reload
```

No Docker? Point `DATABASE_URL` in `.env` at any Postgres instance you
already have running instead.

Health check: `GET http://localhost:3000/api/health`

## Scripts

| Script                            | Purpose                                                      |
| --------------------------------- | ------------------------------------------------------------ |
| `npm run dev`                     | Run with hot reload (ts-node-dev)                            |
| `npm run build`                   | Compile to `dist/` (tsc + path-alias rewrite)                |
| `npm start`                       | Run compiled output                                          |
| `npm test`                        | Unit tests (vitest) — network-free                           |
| `npm run test:coverage`           | Unit tests + coverage thresholds                             |
| `npm run test:integration`        | Real-Postgres tests — see `test/integration/README.md` first |
| `npm run db:generate`             | Generate a migration from the Drizzle schema                 |
| `npm run db:migrate`              | Apply pending migrations                                     |
| `npm run db:seed`                 | Non-prod only; clears the DB, then seeds every module        |
| `npm run db:studio`               | Open Drizzle Studio against `DATABASE_URL`                   |
| `npm run lint`                    | ESLint                                                       |
| `npm run format` / `format:check` | Prettier write / check-only (CI uses the latter)             |

## Auth (dev mode)

There's no real login yet. Every request may carry an `x-user-id` header
naming a real user id (created via `POST /users` or the seed script) —
the API trusts it unverified and looks up that user's real `role` for
`admin`-gated routes. Omit the header entirely and you get a synthetic
`dev-admin` principal — **except** it isn't a real DB row, so any route
that also does a genuine lookup on the acting user (e.g. submitting
results as `submittedByUserId`) will fail against it. Use a real user
id you've created or promoted to `admin` (`role` in the `users` table)
for admin actions.

## API reference

All routes are mounted under `/api`. `[admin]` means `requireRole('admin')`
gates the route — pass `x-user-id` for a user whose `role` is `admin`.
Everything else just needs `x-user-id` for routes reading `req.auth`
(entry/result submission, joining a league), or nothing at all for public
reads.

### Users

```bash
curl -X POST localhost:3000/api/users \
  -H 'Content-Type: application/json' \
  -d '{"email":"alice@example.com","name":"Alice"}'

curl localhost:3000/api/users/<id>
```

### Grand tours (+ start list)

```bash
# [admin]
curl -X POST localhost:3000/api/grand-tours -H 'x-user-id: <adminId>' \
  -H 'Content-Type: application/json' \
  -d '{"name":"Tour de France","startDate":"01-07-2026","endDate":"23-07-2026"}'

curl localhost:3000/api/grand-tours/<id>

# [admin] — adds a team/rider to this grand tour's start list
curl -X POST localhost:3000/api/grand-tours/<id>/teams -H 'x-user-id: <adminId>' \
  -H 'Content-Type: application/json' -d '{"teamId":"<teamId>"}'
curl -X POST localhost:3000/api/grand-tours/<id>/riders -H 'x-user-id: <adminId>' \
  -H 'Content-Type: application/json' -d '{"riderId":"<riderId>"}'

# public — the start list; picks in a competition entry must reference these ids
curl localhost:3000/api/grand-tours/<id>/teams
curl localhost:3000/api/grand-tours/<id>/riders
```

### Teams & riders

```bash
# [admin]
curl -X POST localhost:3000/api/teams -H 'x-user-id: <adminId>' \
  -H 'Content-Type: application/json' -d '{"name":"UAE Team Emirates","logoUrl":"https://..."}'
curl -X POST localhost:3000/api/riders -H 'x-user-id: <adminId>' \
  -H 'Content-Type: application/json' \
  -d '{"name":"Tadej Pogačar","nationality":"Slovenia","type":"climber","teamId":"<teamId>"}'

curl localhost:3000/api/teams/<id>
curl localhost:3000/api/riders/<id>
```

See [Excel bulk import](#excel-bulk-import-teamsriders) below for
`/teams/import` and `/riders/import`.

### Fantasy leagues

```bash
# [admin] — grandTourId must already exist
curl -X POST localhost:3000/api/fantasy-leagues -H 'x-user-id: <adminId>' \
  -H 'Content-Type: application/json' \
  -d '{"name":"Office League","grandTourId":"<grandTourId>"}'

curl localhost:3000/api/fantasy-leagues/<id>

# any authenticated user — joins as the caller, never on someone else's behalf
curl -X POST localhost:3000/api/fantasy-leagues/<id>/join -H 'x-user-id: <userId>'

curl localhost:3000/api/fantasy-leagues/<id>/members
curl localhost:3000/api/fantasy-leagues/<id>/leaderboard
```

### Competitions, entries & results

A competition's required picks and their point values are set per
instance, not derived from `type` (`type` is a free-form display label —
`gc_top3`, `kom_top3`, `fantasy_team`, `overall_team`, `stage_winner`,
or anything else you want; see [FAQ](#faq)). Valid `slot` values:
`overall_team`, `top_1`, `top_2`, `top_3`, `climber`, `sprinter`,
`rouleur`, `puncheur`.

```bash
# [admin] — fantasyLeagueId must already exist
curl -X POST localhost:3000/api/competitions -H 'x-user-id: <adminId>' \
  -H 'Content-Type: application/json' \
  -d '{
    "name": "General Classification — Top 3",
    "type": "gc_top3",
    "fantasyLeagueId": "<leagueId>",
    "slots": [
      {"slot": "top_1", "points": 10},
      {"slot": "top_2", "points": 7},
      {"slot": "top_3", "points": 5}
    ]
  }'

curl localhost:3000/api/competitions/<id>

# [admin] — reshape slots/points; rejected (409) once a result exists
curl -X PUT localhost:3000/api/competitions/<id>/slots -H 'x-user-id: <adminId>' \
  -H 'Content-Type: application/json' \
  -d '{"slots":[{"slot":"top_1","points":15}]}'

# any authenticated user — submits/replaces THEIR OWN entry (full-replace on resubmit)
# grandTourRiderId/grandTourTeamId must be from THIS competition's grand tour's start list
curl -X POST localhost:3000/api/competitions/<id>/entries -H 'x-user-id: <userId>' \
  -H 'Content-Type: application/json' \
  -d '{"selections":[
    {"slot":"top_1","grandTourRiderId":"<grandTourRiderId>"},
    {"slot":"top_2","grandTourRiderId":"<grandTourRiderId2>"},
    {"slot":"top_3","grandTourRiderId":"<grandTourRiderId3>"}
  ]}'

curl localhost:3000/api/competitions/<id>/entries/me -H 'x-user-id: <userId>'
curl localhost:3000/api/competitions/<id>/entries -H 'x-user-id: <adminId>'   # [admin]

# [admin] — declares the outcome, same shape as an entry; triggers score
# recalculation for every entry in this competition + the league leaderboard
curl -X POST localhost:3000/api/competitions/<id>/results -H 'x-user-id: <adminId>' \
  -H 'Content-Type: application/json' \
  -d '{"selections":[{"slot":"top_1","grandTourRiderId":"<grandTourRiderId>"}]}'

curl localhost:3000/api/competitions/<id>/scores    # public — everyone's computed scores
```

### Excel bulk import (teams/riders)

```bash
# [admin] — .xlsx only, multipart field name "file"
curl -X POST localhost:3000/api/teams/import -H 'x-user-id: <adminId>' \
  -F 'file=@teams.xlsx'
curl -X POST localhost:3000/api/riders/import -H 'x-user-id: <adminId>' \
  -F 'file=@riders.xlsx'
```

Expected columns (case-insensitive, any order):

- **Teams**: `Name` (required), `Logo URL`
- **Riders**: `Name` (required), `Nationality`, `Image URL`, `Type`,
  `Team Name` (matched by exact string against existing teams — an
  unresolvable name is reported as a row error, not a crash)

Response shape: `{ created: number, updated: number, errors: [{ row, message }] }`.
Best-effort/partial-success — a bad row is reported and skipped, never
aborts the whole file. Re-importing the same file reconciles by exact
name match (updates existing rows) instead of duplicating them.

## FAQ

**A request 404s even though the route exists in the code.** Every route
is mounted under `/api` — `localhost:3000/users` 404s,
`localhost:3000/api/users` doesn't.

**Why did my `x-user-id`-less admin request fail with a weird error
about an invalid id?** See [Auth (dev mode)](#auth-dev-mode) above — the
synthetic `dev-admin` fallback isn't a real user row.

**How do I make a local user an admin?** There's no API for it
(deliberately — the public `POST /users` endpoint doesn't accept `role`).
Either pass `role: 'admin'` to `userService.createUser()` directly if
you're scripting/seeding, or update the row directly:
`UPDATE users SET role = 'admin' WHERE email = '...';`.

**How do competition slots/points actually work?** Each competition
instance declares its own required `slot`s and the points each is worth
via `slots` at creation (or later via `PUT /:id/slots`, until a result
exists). Scoring is exact-slot-match only — an entry's pick for a slot
scores that slot's points only if it's the _same_ rider/team as the
result's pick for that _same_ slot; there's no credit for picking someone
who landed in the real top 3 but in the wrong slot. See
`scoring-calculator.ts`.

**What does `npm run db:seed` actually do?** Clears every table
(non-prod only — refuses to run with `NODE_ENV=production`) and reseeds
users, a grand tour, teams/riders + start list, a fantasy league +
members, and six real competitions (GC Top 3, KOM Top 3, Fantasy Team,
Overall Team, two Stage Winner variants) with realistic slot configs —
also doubles as a worked example of the `slots` shape.

**Why is there no `/competitions/:id/entries` for a non-admin?** Seeing
everyone's picks before a competition's result is in is deliberately
admin-only, so users can't scout each other's picks while entries are
still open. Once a result exists, `/scores` is public.

## CI/CD

`.github/workflows/ci.yml` runs on every PR and push to `main`: lint,
format check, typecheck, unit tests + coverage, a production build, real-
Postgres integration tests (its own ephemeral service container, separate
from local `docker-compose.yml`), and a Snyk dependency scan. `deploy` is
a placeholder job — it runs after everything else passes on a push to
`main`, but doesn't deploy anywhere yet.

**One-time setup this repo needs** (not in the workflow file):

1. In Snyk: create a **Service Account** token (org Settings → Service
   Accounts), not a personal one — it isn't tied to a person leaving or
   rotating credentials.
2. In GitHub: repo Settings → Secrets and variables → Actions → add a
   secret named `SNYK_TOKEN` with that value.
3. (Recommended) repo Settings → Branches: require the CI jobs to pass
   before merging into `main`.
4. (Recommended, free) repo Settings → Code security and analysis: enable
   Dependabot alerts + security updates, and secret scanning if available
   on your plan — complements Snyk, doesn't cost a workflow run.

The Snyk gate starts at `--severity-threshold=high` (a brand-new
dependency tree almost always has some low/medium transitive noise) —
tighten it once you've seen a real baseline.

## Adding a new module

See [`CLAUDE.md`](./CLAUDE.md#adding-a-new-module).
test direct push - should be rejected
