# Integration tests

Tests here exercise real adapters (e.g. `DrizzleUserRepository`) against an
actual Postgres instance — point `DATABASE_URL` at a disposable test
database (e.g. `docker compose up -d` and a separate `tdff_test` DB) before
running them. Keep these separate from `test/unit`, which must never touch
the network or a database.
