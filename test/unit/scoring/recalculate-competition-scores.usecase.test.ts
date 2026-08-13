import { describe, it, expect, beforeEach } from 'vitest';
import { randomUUID } from 'node:crypto';
import { RecalculateCompetitionScoresUseCase } from '@modules/scoring/application/use-cases/recalculate-competition-scores.usecase';
import { RecalculateLeagueLeaderboardUseCase } from '@modules/scoring/application/use-cases/recalculate-league-leaderboard.usecase';
import { ScoringContextNotFoundError } from '@modules/scoring/domain/errors/scoring.errors';
import { FakeScoringRepository } from './fake-scoring.repository';

describe('RecalculateCompetitionScoresUseCase', () => {
  let repository: FakeScoringRepository;
  let useCase: RecalculateCompetitionScoresUseCase;
  const competitionId = randomUUID();
  const fantasyLeagueId = randomUUID();

  beforeEach(() => {
    repository = new FakeScoringRepository();
    // Uses the fake's default (full placeholder) rule set unless a test
    // overrides it — see the dedicated per-competition-points test below.
    repository.addCompetition(competitionId, fantasyLeagueId);
    useCase = new RecalculateCompetitionScoresUseCase(
      repository,
      new RecalculateLeagueLeaderboardUseCase(repository),
    );
  });

  it('throws ScoringContextNotFoundError for an unknown competition', async () => {
    await expect(useCase.execute('00000000-0000-0000-0000-000000000000')).rejects.toBeInstanceOf(
      ScoringContextNotFoundError,
    );
  });

  it('is a no-op over an empty entry list — writes nothing, does not error', async () => {
    repository.setResult(competitionId, [{ slot: 'climber', grandTourRiderId: 'rider-a' }]);

    await expect(useCase.execute(competitionId)).resolves.toBeUndefined();
    expect(await repository.listScoresByCompetition(competitionId)).toHaveLength(0);
  });

  it('scores every entry to 0 when no result has been declared', async () => {
    const entryId = randomUUID();
    repository.addEntry(competitionId, {
      entryId,
      userId: randomUUID(),
      selections: [{ slot: 'climber', grandTourRiderId: 'rider-a' }],
    });

    await useCase.execute(competitionId);

    const [score] = await repository.listScoresByCompetition(competitionId);
    expect(score?.score).toBe(0);
  });

  it('scores multiple entries independently', async () => {
    repository.setResult(competitionId, [{ slot: 'climber', grandTourRiderId: 'rider-a' }]);
    const entryA = randomUUID();
    const entryB = randomUUID();
    repository.addEntry(competitionId, {
      entryId: entryA,
      userId: randomUUID(),
      selections: [{ slot: 'climber', grandTourRiderId: 'rider-a' }], // correct
    });
    repository.addEntry(competitionId, {
      entryId: entryB,
      userId: randomUUID(),
      selections: [{ slot: 'climber', grandTourRiderId: 'rider-wrong' }], // wrong
    });

    await useCase.execute(competitionId);

    const scores = await repository.listScoresByCompetition(competitionId);
    expect(scores.find((s) => s.entryId === entryA)?.score).toBe(10);
    expect(scores.find((s) => s.entryId === entryB)?.score).toBe(0);
  });

  it('is idempotent from scratch — re-running after a corrected result overwrites, never adds to, the prior score', async () => {
    const entryId = randomUUID();
    const userId = randomUUID();
    repository.addEntry(competitionId, {
      entryId,
      userId,
      selections: [{ slot: 'climber', grandTourRiderId: 'rider-a' }],
    });

    // Admin's first (wrong) result — entry doesn't match, scores 0.
    repository.setResult(competitionId, [{ slot: 'climber', grandTourRiderId: 'rider-b' }]);
    await useCase.execute(competitionId);
    expect((await repository.listScoresByCompetition(competitionId))[0]?.score).toBe(0);

    // Admin corrects the result — entry now matches.
    repository.setResult(competitionId, [{ slot: 'climber', grandTourRiderId: 'rider-a' }]);
    await useCase.execute(competitionId);
    const scoresAfterCorrection = await repository.listScoresByCompetition(competitionId);
    expect(scoresAfterCorrection).toHaveLength(1); // still exactly one row, not a second one
    expect(scoresAfterCorrection[0]?.score).toBe(10); // the fresh correct value, not 0 + 10

    // Re-running again with the same (already-correct) result must not
    // double the score a second time.
    await useCase.execute(competitionId);
    const scoresAfterRerun = await repository.listScoresByCompetition(competitionId);
    expect(scoresAfterRerun).toHaveLength(1);
    expect(scoresAfterRerun[0]?.score).toBe(10);
  });

  it('resets an entry to 0 when a previously-set result is retracted', async () => {
    const entryId = randomUUID();
    repository.addEntry(competitionId, {
      entryId,
      userId: randomUUID(),
      selections: [{ slot: 'climber', grandTourRiderId: 'rider-a' }],
    });
    repository.setResult(competitionId, [{ slot: 'climber', grandTourRiderId: 'rider-a' }]);
    await useCase.execute(competitionId);
    expect((await repository.listScoresByCompetition(competitionId))[0]?.score).toBe(10);

    repository.clearResult(competitionId);
    await useCase.execute(competitionId);
    expect((await repository.listScoresByCompetition(competitionId))[0]?.score).toBe(0);
  });

  // Phase 4.5 regression: the same slot name ("top_1") must be worth
  // whatever THIS competition's own config says, not a single global
  // value — proves points are sourced per-competition, not hardcoded.
  it('scores the same slot name at different points across two different competitions', async () => {
    const otherCompetitionId = randomUUID();
    const otherFantasyLeagueId = randomUUID();
    repository.addCompetition(otherCompetitionId, otherFantasyLeagueId, { top_1: 3 });
    // The default competition (set up in beforeEach) awards top_1 at 10
    // via the fake's default full rule set — no override needed here.

    const entryId = randomUUID();
    const otherEntryId = randomUUID();
    repository.setResult(competitionId, [{ slot: 'top_1', grandTourRiderId: 'rider-a' }]);
    repository.addEntry(competitionId, {
      entryId,
      userId: randomUUID(),
      selections: [{ slot: 'top_1', grandTourRiderId: 'rider-a' }],
    });
    repository.setResult(otherCompetitionId, [{ slot: 'top_1', grandTourRiderId: 'rider-a' }]);
    repository.addEntry(otherCompetitionId, {
      entryId: otherEntryId,
      userId: randomUUID(),
      selections: [{ slot: 'top_1', grandTourRiderId: 'rider-a' }],
    });

    await useCase.execute(competitionId);
    await useCase.execute(otherCompetitionId);

    const [score] = await repository.listScoresByCompetition(competitionId);
    const [otherScore] = await repository.listScoresByCompetition(otherCompetitionId);
    expect(score?.score).toBe(10);
    expect(otherScore?.score).toBe(3);
  });
});
