import { describe, it, expect, beforeEach } from 'vitest';
import { randomUUID } from 'node:crypto';
import { RecalculateLeagueLeaderboardUseCase } from '@modules/scoring/application/use-cases/recalculate-league-leaderboard.usecase';
import { FakeScoringRepository } from './fake-scoring.repository';

describe('RecalculateLeagueLeaderboardUseCase', () => {
  let repository: FakeScoringRepository;
  let useCase: RecalculateLeagueLeaderboardUseCase;
  const fantasyLeagueId = randomUUID();
  const competitionA = randomUUID();
  const competitionB = randomUUID();
  const userWithTwoEntries = randomUUID();
  const userWithOneEntry = randomUUID();
  const userWithNoEntries = randomUUID();

  beforeEach(async () => {
    repository = new FakeScoringRepository();
    repository.addCompetition(competitionA, fantasyLeagueId);
    repository.addCompetition(competitionB, fantasyLeagueId);
    repository.addLeagueMember(fantasyLeagueId, userWithTwoEntries);
    repository.addLeagueMember(fantasyLeagueId, userWithOneEntry);
    repository.addLeagueMember(fantasyLeagueId, userWithNoEntries);

    // Sums across BOTH competitions in the league.
    await repository.saveEntryScore(randomUUID(), competitionA, userWithTwoEntries, 10);
    await repository.saveEntryScore(randomUUID(), competitionB, userWithTwoEntries, 5);
    // Only one competition — still counts.
    await repository.saveEntryScore(randomUUID(), competitionA, userWithOneEntry, 15);
    // userWithNoEntries has no competition_entry_scores rows at all.

    useCase = new RecalculateLeagueLeaderboardUseCase(repository);
  });

  it("sums a user's scores across every competition in the league", async () => {
    await useCase.execute(fantasyLeagueId);

    const leaderboard = await repository.getLeaderboard(fantasyLeagueId);
    expect(leaderboard.find((e) => e.userId === userWithTwoEntries)?.totalScore).toBe(15);
  });

  it('includes a league member with zero entries at a 0 total, never excluded', async () => {
    await useCase.execute(fantasyLeagueId);

    const leaderboard = await repository.getLeaderboard(fantasyLeagueId);
    const entry = leaderboard.find((e) => e.userId === userWithNoEntries);
    expect(entry).toBeDefined();
    expect(entry?.totalScore).toBe(0);
  });

  it('ranks by total score descending, sequential (not shared) ranks', async () => {
    await useCase.execute(fantasyLeagueId);

    const leaderboard = await repository.getLeaderboard(fantasyLeagueId);
    const byRank = [...leaderboard].sort((a, b) => a.rank - b.rank);

    // userWithTwoEntries (15) and userWithOneEntry (15) are tied for the
    // top score; userWithNoEntries (0) is last.
    expect(byRank.map((e) => e.rank)).toEqual([1, 2, 3]);
    expect(byRank[2]?.userId).toBe(userWithNoEntries);
  });

  it('breaks a tie by earliest entry submission', async () => {
    // Rebuild with explicit submission ordering to make the tie-break
    // deterministic: userWithOneEntry submitted earlier than userWithTwoEntries.
    repository = new FakeScoringRepository();
    repository.addCompetition(competitionA, fantasyLeagueId);
    repository.addLeagueMember(fantasyLeagueId, userWithTwoEntries);
    repository.addLeagueMember(fantasyLeagueId, userWithOneEntry);
    repository.addEntry(
      competitionA,
      { entryId: 'entry-early', userId: userWithOneEntry, selections: [] },
      new Date('2026-01-01T00:00:00Z'),
    );
    repository.addEntry(
      competitionA,
      { entryId: 'entry-late', userId: userWithTwoEntries, selections: [] },
      new Date('2026-01-02T00:00:00Z'),
    );
    await repository.saveEntryScore('entry-early', competitionA, userWithOneEntry, 10);
    await repository.saveEntryScore('entry-late', competitionA, userWithTwoEntries, 10);
    useCase = new RecalculateLeagueLeaderboardUseCase(repository);

    await useCase.execute(fantasyLeagueId);

    const leaderboard = await repository.getLeaderboard(fantasyLeagueId);
    const first = leaderboard.find((e) => e.rank === 1);
    expect(first?.userId).toBe(userWithOneEntry); // submitted earlier, wins the tie
  });
});
