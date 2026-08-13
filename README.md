# tdff-backend

Express + TypeScript backend using hexagonal (ports & adapters) architecture,
with Postgres/Drizzle for persistence managed as code in this repo.

## Layout

```
src/
├── modules/<name>/
│   ├── domain/          # entities, ports (interfaces), domain errors — no framework deps
│   ├── application/     # use cases + service implementing the inbound port
│   └── adapters/
│       ├── inbound/http/    # controllers, routes, DTOs
│       └── outbound/persistence/  # Drizzle repository implementing the outbound port
├── shared/               # framework-agnostic cross-cutting code (base entity, AppError)
├── infrastructure/
│   ├── http/              # express app assembly, middlewares, route aggregation
│   ├── db/                 # drizzle client, schema, migrations
│   └── config/              # env validation, DI composition root
└── main.ts                # entrypoint
```

Dependency rule: `domain/` never imports from `adapters/` or a framework.
`application/` depends on domain ports only. Concrete adapters (Drizzle,
Express) are wired together in `infrastructure/config/di-container.ts`.

The `user` module is scaffolded end-to-end as the template to copy for new
modules (e.g. `auth`, `order`): entity → ports → use cases → service →
Drizzle repository → HTTP controller/routes → wired in the DI container.

## Getting started

```bash
cp .env.example .env   # already done; edit DATABASE_URL if needed
docker compose up -d   # starts local Postgres (requires Docker installed)
npm run db:generate    # generate SQL migration from src/infrastructure/db/schema
npm run db:migrate     # apply migrations
npm run dev             # start the API with hot reload
```

No Docker? Point `DATABASE_URL` in `.env` at any Postgres instance you
already have running (local install, a cloud dev DB, etc.) instead.

Health check: `GET http://localhost:3000/api/health`

## Scripts

| Script                | Purpose                                       |
| --------------------- | --------------------------------------------- |
| `npm run dev`         | Run with hot reload (ts-node-dev)             |
| `npm run build`       | Compile to `dist/` (tsc + path-alias rewrite) |
| `npm start`           | Run compiled output                           |
| `npm test`            | Run unit tests (vitest)                       |
| `npm run db:generate` | Generate a migration from the Drizzle schema  |
| `npm run db:migrate`  | Apply pending migrations                      |
| `npm run db:studio`   | Open Drizzle Studio against `DATABASE_URL`    |
| `npm run lint`        | ESLint                                        |
| `npm run format`      | Prettier write                                |

## Adding a new module

1. Copy the `user` module folder structure, rename to the new domain.
2. Define the entity + outbound repository port + inbound service port in `domain/`.
3. Implement use cases in `application/`, depending only on the port.
4. Implement the Drizzle repository adapter in `adapters/outbound/persistence/`.
5. Implement the controller/routes/DTOs in `adapters/inbound/http/`.
6. Add the table to `infrastructure/db/schema/`, re-export it from `schema/index.ts`, run `db:generate` + `db:migrate`.
7. Wire it in `infrastructure/config/di-container.ts` and mount its router in `infrastructure/http/routes.ts`.
8. Unit test use cases against an in-memory fake repository (see `test/unit/user/fake-user.repository.ts`); integration test the Drizzle adapter against a real test DB (see `test/integration/README.md`).
