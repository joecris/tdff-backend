import { describe, it, expect, beforeEach, afterAll } from 'vitest';
import { randomUUID } from 'node:crypto';
import { db, closeDb } from '@infrastructure/db/client';
import { clearDb } from '@infrastructure/db/seed/clear-db';
import { competitionEntrySelectionsTable } from '@infrastructure/db/schema/competition-entry-selection.schema';
import { seedMinimalCompetitionFixture } from './db-fixtures';

/**
 * Drizzle wraps the driver's pg error inside `.cause` — its own top-level
 * `.message` is just "Failed query: ...", not the actual constraint-
 * violation text (same pattern already noted in seed/index.ts's
 * `hasMissingRelation`). Walk the chain to find it.
 */
function causeChainMessage(err: unknown): string {
  const messages: string[] = [];
  let current: unknown = err;
  for (let depth = 0; current instanceof Error && depth < 5; depth += 1) {
    messages.push(current.message);
    current = current.cause;
  }
  return messages.join(' | ');
}

/**
 * The `competition_entry_selections_exactly_one_pick` CHECK constraint is
 * a DB-level guarantee that survives even a bypass of the application
 * layer — `CompetitionEntrySelection.create()` already enforces the same
 * rule in code (see selection-validation.ts's `assertExactlyOnePick`),
 * but that's not something a fake-repository unit test can prove exists
 * at the database level. This is the one test in the suite that inserts
 * directly, skipping domain validation entirely, specifically to prove
 * the constraint itself is real.
 */
describe('competition_entry_selections exactly-one-pick CHECK constraint (integration)', () => {
  beforeEach(async () => {
    await clearDb();
  });

  afterAll(async () => {
    await closeDb();
  });

  it('accepts a row with exactly a rider id set', async () => {
    const fixture = await seedMinimalCompetitionFixture(db);

    await expect(
      db.insert(competitionEntrySelectionsTable).values({
        id: randomUUID(),
        entryId: fixture.entry.id,
        slot: 'top_1',
        grandTourRiderId: fixture.grandTourRider.id,
      }),
    ).resolves.not.toThrow();
  });

  it('accepts a row with exactly a team id set', async () => {
    const fixture = await seedMinimalCompetitionFixture(db);

    await expect(
      db.insert(competitionEntrySelectionsTable).values({
        id: randomUUID(),
        entryId: fixture.entry.id,
        slot: 'overall_team',
        grandTourTeamId: fixture.grandTourTeam.id,
      }),
    ).resolves.not.toThrow();
  });

  it('rejects a row with BOTH a rider id and a team id set', async () => {
    const fixture = await seedMinimalCompetitionFixture(db);

    const attempt = db.insert(competitionEntrySelectionsTable).values({
      id: randomUUID(),
      entryId: fixture.entry.id,
      slot: 'top_1',
      grandTourRiderId: fixture.grandTourRider.id,
      grandTourTeamId: fixture.grandTourTeam.id,
    });

    await expect(attempt).rejects.toSatisfy((err: unknown) =>
      causeChainMessage(err).includes('exactly_one_pick'),
    );
  });

  it('rejects a row with NEITHER a rider id nor a team id set', async () => {
    const fixture = await seedMinimalCompetitionFixture(db);

    const attempt = db.insert(competitionEntrySelectionsTable).values({
      id: randomUUID(),
      entryId: fixture.entry.id,
      slot: 'top_1',
    });

    await expect(attempt).rejects.toSatisfy((err: unknown) =>
      causeChainMessage(err).includes('exactly_one_pick'),
    );
  });
});
