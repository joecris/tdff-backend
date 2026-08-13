import { randomUUID } from 'node:crypto';
import {
  ScoringRepositoryPort,
  CompetitionScoringContext,
  EntryWithSelections,
  UserScoreSummary,
  LeaderboardUpsertInput,
} from '@modules/scoring/domain/ports/scoring-repository.port';
import { SlotPick } from '@modules/scoring/domain/services/scoring-calculator';
import {
  SlotPointsRuleSet,
  DEFAULT_SLOT_POINTS_RULE_SET,
} from '@modules/scoring/domain/services/slot-points-rule-set';
import { CompetitionEntryScore } from '@modules/scoring/domain/entities/competition-entry-score.entity';
import { LeagueLeaderboardEntry } from '@modules/scoring/domain/entities/league-leaderboard-entry.entity';

/**
 * In-memory stand-in for the real cross-table Drizzle adapter. Since the
 * real repository reads directly across other modules' tables (by design
 * — see the port's doc comment), this fake exposes plain setup methods
 * mirroring that same shape, rather than depending on other modules'
 * fakes: `addCompetition`/`setResult`/`addEntry`/`addLeagueMember`.
 */
export class FakeScoringRepository implements ScoringRepositoryPort {
  private readonly competitions = new Map<
    string,
    { fantasyLeagueId: string; slotPoints: SlotPointsRuleSet }
  >();
  private readonly results = new Map<string, SlotPick[]>();
  private readonly entries = new Map<string, EntryWithSelections[]>();
  private readonly entrySubmittedAt = new Map<string, Date>();
  private readonly leagueMembers = new Map<string, string[]>();
  private readonly scores = new Map<string, CompetitionEntryScore>();
  private readonly leaderboards = new Map<string, LeagueLeaderboardEntry[]>();

  // Defaults to the full placeholder rule set (Phase 4.5: real code sources
  // this per-competition from `competition_slot_configs`) — keeps existing
  // tests that don't care about points working unchanged; pass a custom
  // `slotPoints` to test the "different competitions, different points for
  // the same slot name" property specifically.
  addCompetition(
    competitionId: string,
    fantasyLeagueId: string,
    slotPoints: SlotPointsRuleSet = DEFAULT_SLOT_POINTS_RULE_SET,
  ): void {
    this.competitions.set(competitionId, { fantasyLeagueId, slotPoints });
  }

  setResult(competitionId: string, selections: SlotPick[]): void {
    this.results.set(competitionId, selections);
  }

  clearResult(competitionId: string): void {
    this.results.delete(competitionId);
  }

  addEntry(
    competitionId: string,
    entry: EntryWithSelections,
    submittedAt: Date = new Date(),
  ): void {
    const list = this.entries.get(competitionId) ?? [];
    list.push(entry);
    this.entries.set(competitionId, list);
    this.entrySubmittedAt.set(entry.entryId, submittedAt);
  }

  addLeagueMember(fantasyLeagueId: string, userId: string): void {
    const list = this.leagueMembers.get(fantasyLeagueId) ?? [];
    list.push(userId);
    this.leagueMembers.set(fantasyLeagueId, list);
  }

  async getCompetitionContext(competitionId: string): Promise<CompetitionScoringContext | null> {
    const competition = this.competitions.get(competitionId);
    return competition
      ? {
          competitionId,
          fantasyLeagueId: competition.fantasyLeagueId,
          slotPoints: competition.slotPoints,
        }
      : null;
  }

  async getResultSelections(competitionId: string): Promise<SlotPick[] | null> {
    return this.results.get(competitionId) ?? null;
  }

  async listEntriesWithSelections(competitionId: string): Promise<EntryWithSelections[]> {
    return this.entries.get(competitionId) ?? [];
  }

  async saveEntryScore(
    entryId: string,
    competitionId: string,
    userId: string,
    score: number,
  ): Promise<void> {
    const existing = this.scores.get(entryId);
    const now = new Date();
    this.scores.set(
      entryId,
      CompetitionEntryScore.fromPersistence({
        id: existing?.id ?? randomUUID(),
        entryId,
        competitionId,
        userId,
        score,
        calculatedAt: now,
        createdAt: existing?.toJSON().createdAt ?? now,
        updatedAt: now,
      }),
    );
  }

  async listScoresByCompetition(competitionId: string): Promise<CompetitionEntryScore[]> {
    return [...this.scores.values()].filter((s) => s.competitionId === competitionId);
  }

  async sumScoresByUser(fantasyLeagueId: string): Promise<UserScoreSummary[]> {
    const memberIds = this.leagueMembers.get(fantasyLeagueId) ?? [];
    const competitionIdsInLeague = [...this.competitions.entries()]
      .filter(([, c]) => c.fantasyLeagueId === fantasyLeagueId)
      .map(([id]) => id);

    const totals = new Map<string, { totalScore: number; earliestSubmittedAt: Date | null }>();
    for (const userId of memberIds) {
      totals.set(userId, { totalScore: 0, earliestSubmittedAt: null });
    }
    for (const score of this.scores.values()) {
      if (!competitionIdsInLeague.includes(score.competitionId)) continue;
      const current = totals.get(score.userId) ?? { totalScore: 0, earliestSubmittedAt: null };
      current.totalScore += score.score;
      const submittedAt = this.entrySubmittedAt.get(score.entryId) ?? null;
      if (
        submittedAt &&
        (!current.earliestSubmittedAt || submittedAt < current.earliestSubmittedAt)
      ) {
        current.earliestSubmittedAt = submittedAt;
      }
      totals.set(score.userId, current);
    }

    return [...totals.entries()].map(([userId, summary]) => ({ userId, ...summary }));
  }

  async saveLeaderboard(fantasyLeagueId: string, entries: LeaderboardUpsertInput[]): Promise<void> {
    this.leaderboards.set(
      fantasyLeagueId,
      entries.map((entry) =>
        LeagueLeaderboardEntry.fromCalculation({ id: randomUUID(), fantasyLeagueId, ...entry }),
      ),
    );
  }

  async getLeaderboard(fantasyLeagueId: string): Promise<LeagueLeaderboardEntry[]> {
    return this.leaderboards.get(fantasyLeagueId) ?? [];
  }
}
