import { SlotPick } from '../services/scoring-calculator';
import { SlotPointsRuleSet } from '../services/slot-points-rule-set';
import { CompetitionEntryScore } from '../entities/competition-entry-score.entity';
import { LeagueLeaderboardEntry } from '../entities/league-leaderboard-entry.entity';

export interface CompetitionScoringContext {
  competitionId: string;
  fantasyLeagueId: string;
  /** This competition's own admin-set points per slot (Phase 4.5) — the
   * source of truth `RecalculateCompetitionScoresUseCase` scores against,
   * read from `competition_slot_configs`, not a global constant. */
  slotPoints: SlotPointsRuleSet;
}

export interface EntryWithSelections {
  entryId: string;
  userId: string;
  selections: SlotPick[];
}

export interface UserScoreSummary {
  userId: string;
  totalScore: number;
  /** Earliest of the user's entry submissions within this league — the
   * tie-break key for leaderboard ranking. `null` for a league member who
   * hasn't entered any competition yet (still included with a 0 total,
   * never excluded — see recalculate-league-leaderboard.usecase.ts). */
  earliestSubmittedAt: Date | null;
}

export interface LeaderboardUpsertInput {
  userId: string;
  totalScore: number;
  rank: number;
}

/**
 * Deliberately allowed to read/join across `competitions`,
 * `competition_entries`, `competition_entry_selections`,
 * `competition_results`, `competition_result_selections`, and
 * `fantasy_league_members` — consistent with the existing convention that
 * an adapter may query across tables (e.g. `drizzle-grand-tour.repository.ts`
 * already imports the whole schema barrel, not a module-scoped slice). The
 * actual hexagonal rule being preserved is narrower: domain/application
 * layers never import Drizzle directly, only adapters do.
 */
export interface ScoringRepositoryPort {
  getCompetitionContext(competitionId: string): Promise<CompetitionScoringContext | null>;
  /** `null` if no result has been submitted (or one was retracted) yet. */
  getResultSelections(competitionId: string): Promise<SlotPick[] | null>;
  listEntriesWithSelections(competitionId: string): Promise<EntryWithSelections[]>;
  /** Upsert, keyed on `entryId` (1:1) — always overwrites, never adds to
   * a prior score. This is what makes recalculation idempotent-from-scratch. */
  saveEntryScore(
    entryId: string,
    competitionId: string,
    userId: string,
    score: number,
  ): Promise<void>;
  listScoresByCompetition(competitionId: string): Promise<CompetitionEntryScore[]>;
  /** One row per league member, always — 0 total for a member with no
   * entries, never omitted. */
  sumScoresByUser(fantasyLeagueId: string): Promise<UserScoreSummary[]>;
  saveLeaderboard(fantasyLeagueId: string, entries: LeaderboardUpsertInput[]): Promise<void>;
  getLeaderboard(fantasyLeagueId: string): Promise<LeagueLeaderboardEntry[]>;
}
