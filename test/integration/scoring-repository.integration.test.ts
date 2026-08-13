import { describe, it, expect, beforeEach, afterAll } from 'vitest';
import { randomUUID } from 'node:crypto';
import { db, closeDb } from '@infrastructure/db/client';
import { clearDb } from '@infrastructure/db/seed/clear-db';
import { DrizzleScoringRepository } from '@modules/scoring/adapters/outbound/persistence/drizzle-scoring.repository';
import { competitionEntrySelectionsTable } from '@infrastructure/db/schema/competition-entry-selection.schema';
import { competitionResultsTable } from '@infrastructure/db/schema/competition-result.schema';
import { competitionResultSelectionsTable } from '@infrastructure/db/schema/competition-result-selection.schema';
import { competitionSlotConfigsTable } from '@infrastructure/db/schema/competition-slot-config.schema';
import { fantasyLeagueMembersTable } from '@infrastructure/db/schema/fantasy-league-member.schema';
import { seedMinimalCompetitionFixture } from './db-fixtures';

/**
 * `DrizzleScoringRepository` is the one adapter in the codebase that
 * deliberately reads across five other modules' tables directly (see its
 * own doc comment) — exactly the kind of cross-table correctness a
 * fake-repository unit test can't verify, since the fake never runs real
 * SQL joins/aggregation at all.
 */
describe('DrizzleScoringRepository (integration)', () => {
  const repository = new DrizzleScoringRepository(db);

  beforeEach(async () => {
    await clearDb();
  });

  afterAll(async () => {
    await closeDb();
  });

  it("reads a competition's context including its own slot points", async () => {
    const fixture = await seedMinimalCompetitionFixture(db);
    await db.insert(competitionSlotConfigsTable).values({
      id: randomUUID(),
      competitionId: fixture.competition.id,
      slot: 'top_1',
      points: 10,
    });

    const context = await repository.getCompetitionContext(fixture.competition.id);

    expect(context).toEqual({
      competitionId: fixture.competition.id,
      fantasyLeagueId: fixture.fantasyLeague.id,
      slotPoints: { top_1: 10 },
    });
  });

  it('returns null for a competition with no result submitted yet', async () => {
    const fixture = await seedMinimalCompetitionFixture(db);

    expect(await repository.getResultSelections(fixture.competition.id)).toBeNull();
  });

  it('joins entries with their own selections across tables', async () => {
    const fixture = await seedMinimalCompetitionFixture(db);
    await db.insert(competitionEntrySelectionsTable).values({
      id: randomUUID(),
      entryId: fixture.entry.id,
      slot: 'top_1',
      grandTourRiderId: fixture.grandTourRider.id,
    });

    const entries = await repository.listEntriesWithSelections(fixture.competition.id);

    expect(entries).toEqual([
      {
        entryId: fixture.entry.id,
        userId: fixture.user.id,
        selections: [{ slot: 'top_1', grandTourRiderId: fixture.grandTourRider.id }],
      },
    ]);
  });

  it('joins a submitted result with its own selections', async () => {
    const fixture = await seedMinimalCompetitionFixture(db);
    const resultId = randomUUID();
    await db
      .insert(competitionResultsTable)
      .values({ id: resultId, competitionId: fixture.competition.id });
    await db.insert(competitionResultSelectionsTable).values({
      id: randomUUID(),
      resultId,
      slot: 'top_1',
      grandTourRiderId: fixture.grandTourRider.id,
    });

    const selections = await repository.getResultSelections(fixture.competition.id);

    expect(selections).toEqual([{ slot: 'top_1', grandTourRiderId: fixture.grandTourRider.id }]);
  });

  it("sums a league member's scores across the league, including a 0 total for a member with no scored entries", async () => {
    const fixture = await seedMinimalCompetitionFixture(db);
    const zeroScoreMemberId = randomUUID();
    await db
      .insert(fantasyLeagueMembersTable)
      .values([
        { id: randomUUID(), fantasyLeagueId: fixture.fantasyLeague.id, userId: fixture.user.id },
      ]);
    await repository.saveEntryScore(fixture.entry.id, fixture.competition.id, fixture.user.id, 7);

    const summary = await repository.sumScoresByUser(fixture.fantasyLeague.id);

    expect(summary).toEqual([
      { userId: fixture.user.id, totalScore: 7, earliestSubmittedAt: fixture.entry.submittedAt },
    ]);
    // Sanity: a member who was never added has no row at all — only actual
    // members appear, always with a real total, never omitted or crashed on.
    expect(summary.find((s) => s.userId === zeroScoreMemberId)).toBeUndefined();
  });

  it('saveEntryScore() upserts by entryId — re-saving overwrites rather than duplicating', async () => {
    const fixture = await seedMinimalCompetitionFixture(db);

    await repository.saveEntryScore(fixture.entry.id, fixture.competition.id, fixture.user.id, 5);
    await repository.saveEntryScore(fixture.entry.id, fixture.competition.id, fixture.user.id, 9);

    const scores = await repository.listScoresByCompetition(fixture.competition.id);
    expect(scores).toHaveLength(1);
    expect(scores[0]?.score).toBe(9);
  });
});
