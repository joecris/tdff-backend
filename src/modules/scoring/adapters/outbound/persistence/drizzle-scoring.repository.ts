import { eq, inArray } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { randomUUID } from 'node:crypto';
import {
  ScoringRepositoryPort,
  CompetitionScoringContext,
  EntryWithSelections,
  UserScoreSummary,
  LeaderboardUpsertInput,
} from '../../../domain/ports/scoring-repository.port';
import { SlotPick } from '../../../domain/services/scoring-calculator';
import { SlotPointsRuleSet } from '../../../domain/services/slot-points-rule-set';
import { SelectionSlot } from '@shared/domain/selection-slot';
import { CompetitionEntryScore } from '../../../domain/entities/competition-entry-score.entity';
import { LeagueLeaderboardEntry } from '../../../domain/entities/league-leaderboard-entry.entity';
import { competitionsTable } from '@infrastructure/db/schema/competition.schema';
import { competitionSlotConfigsTable } from '@infrastructure/db/schema/competition-slot-config.schema';
import { competitionEntriesTable } from '@infrastructure/db/schema/competition-entry.schema';
import { competitionEntrySelectionsTable } from '@infrastructure/db/schema/competition-entry-selection.schema';
import { competitionResultsTable } from '@infrastructure/db/schema/competition-result.schema';
import { competitionResultSelectionsTable } from '@infrastructure/db/schema/competition-result-selection.schema';
import { competitionEntryScoresTable } from '@infrastructure/db/schema/competition-entry-score.schema';
import { fantasyLeagueMembersTable } from '@infrastructure/db/schema/fantasy-league-member.schema';
import { leagueLeaderboardEntriesTable } from '@infrastructure/db/schema/league-leaderboard-entry.schema';
import * as schema from '@infrastructure/db/schema';
import { CompetitionEntryScoreMapper } from './mappers/competition-entry-score.mapper';
import { LeagueLeaderboardEntryMapper } from './mappers/league-leaderboard-entry.mapper';

/**
 * Deliberately reaches across `competitions`, `competition_entries`,
 * `competition_entry_selections`, `competition_results`,
 * `competition_result_selections`, and `fantasy_league_members` — see the
 * port's doc comment for why that's consistent with the existing
 * convention, not a new exception to it.
 *
 * Favors several simple queries composed in JS over one large multi-join
 * SQL statement — easier to read and verify correct, and per the plan's
 * "Scale assumption" v1 default (no queue infra, expected volumes are
 * small), the extra round trips are not a real cost yet.
 */
export class DrizzleScoringRepository implements ScoringRepositoryPort {
  constructor(private readonly db: NodePgDatabase<typeof schema>) {}

  async getCompetitionContext(competitionId: string): Promise<CompetitionScoringContext | null> {
    const [row] = await this.db
      .select({ id: competitionsTable.id, fantasyLeagueId: competitionsTable.fantasyLeagueId })
      .from(competitionsTable)
      .where(eq(competitionsTable.id, competitionId))
      .limit(1);

    if (!row) return null;

    const slotConfigRows = await this.db
      .select({
        slot: competitionSlotConfigsTable.slot,
        points: competitionSlotConfigsTable.points,
      })
      .from(competitionSlotConfigsTable)
      .where(eq(competitionSlotConfigsTable.competitionId, competitionId));

    const slotPoints: SlotPointsRuleSet = {};
    for (const slotRow of slotConfigRows) {
      slotPoints[slotRow.slot as SelectionSlot] = slotRow.points;
    }

    return { competitionId: row.id, fantasyLeagueId: row.fantasyLeagueId, slotPoints };
  }

  async getResultSelections(competitionId: string): Promise<SlotPick[] | null> {
    const [resultRow] = await this.db
      .select({ id: competitionResultsTable.id })
      .from(competitionResultsTable)
      .where(eq(competitionResultsTable.competitionId, competitionId))
      .limit(1);

    if (!resultRow) return null;

    const selectionRows = await this.db
      .select()
      .from(competitionResultSelectionsTable)
      .where(eq(competitionResultSelectionsTable.resultId, resultRow.id));

    return selectionRows.map(toSlotPick);
  }

  async listEntriesWithSelections(competitionId: string): Promise<EntryWithSelections[]> {
    const entryRows = await this.db
      .select({ id: competitionEntriesTable.id, userId: competitionEntriesTable.userId })
      .from(competitionEntriesTable)
      .where(eq(competitionEntriesTable.competitionId, competitionId));

    if (entryRows.length === 0) return [];

    const entryIds = entryRows.map((row) => row.id);
    const selectionRows = await this.db
      .select()
      .from(competitionEntrySelectionsTable)
      .where(inArray(competitionEntrySelectionsTable.entryId, entryIds));

    const selectionsByEntryId = new Map<string, SlotPick[]>();
    for (const row of selectionRows) {
      const bucket = selectionsByEntryId.get(row.entryId) ?? [];
      bucket.push(toSlotPick(row));
      selectionsByEntryId.set(row.entryId, bucket);
    }

    return entryRows.map((row) => ({
      entryId: row.id,
      userId: row.userId,
      selections: selectionsByEntryId.get(row.id) ?? [],
    }));
  }

  async saveEntryScore(
    entryId: string,
    competitionId: string,
    userId: string,
    score: number,
  ): Promise<void> {
    const now = new Date();
    await this.db
      .insert(competitionEntryScoresTable)
      .values({ id: randomUUID(), entryId, competitionId, userId, score, calculatedAt: now })
      .onConflictDoUpdate({
        target: competitionEntryScoresTable.entryId,
        set: { score, calculatedAt: now, updatedAt: now },
      });
  }

  async listScoresByCompetition(competitionId: string): Promise<CompetitionEntryScore[]> {
    const rows = await this.db
      .select()
      .from(competitionEntryScoresTable)
      .where(eq(competitionEntryScoresTable.competitionId, competitionId));

    return rows.map(CompetitionEntryScoreMapper.toDomain);
  }

  async sumScoresByUser(fantasyLeagueId: string): Promise<UserScoreSummary[]> {
    const members = await this.db
      .select({ userId: fantasyLeagueMembersTable.userId })
      .from(fantasyLeagueMembersTable)
      .where(eq(fantasyLeagueMembersTable.fantasyLeagueId, fantasyLeagueId));

    const competitions = await this.db
      .select({ id: competitionsTable.id })
      .from(competitionsTable)
      .where(eq(competitionsTable.fantasyLeagueId, fantasyLeagueId));
    const competitionIds = competitions.map((c) => c.id);

    const scoreRows =
      competitionIds.length === 0
        ? []
        : await this.db
            .select({
              userId: competitionEntryScoresTable.userId,
              score: competitionEntryScoresTable.score,
              entryId: competitionEntryScoresTable.entryId,
            })
            .from(competitionEntryScoresTable)
            .where(inArray(competitionEntryScoresTable.competitionId, competitionIds));

    const entryIds = scoreRows.map((row) => row.entryId);
    const entryRows =
      entryIds.length === 0
        ? []
        : await this.db
            .select({
              id: competitionEntriesTable.id,
              submittedAt: competitionEntriesTable.submittedAt,
            })
            .from(competitionEntriesTable)
            .where(inArray(competitionEntriesTable.id, entryIds));
    const submittedAtByEntryId = new Map(entryRows.map((row) => [row.id, row.submittedAt]));

    const totalsByUser = new Map<
      string,
      { totalScore: number; earliestSubmittedAt: Date | null }
    >();
    for (const member of members) {
      totalsByUser.set(member.userId, { totalScore: 0, earliestSubmittedAt: null });
    }
    for (const row of scoreRows) {
      const current = totalsByUser.get(row.userId) ?? { totalScore: 0, earliestSubmittedAt: null };
      current.totalScore += row.score;
      const submittedAt = submittedAtByEntryId.get(row.entryId) ?? null;
      if (
        submittedAt &&
        (!current.earliestSubmittedAt || submittedAt < current.earliestSubmittedAt)
      ) {
        current.earliestSubmittedAt = submittedAt;
      }
      totalsByUser.set(row.userId, current);
    }

    return [...totalsByUser.entries()].map(([userId, summary]) => ({ userId, ...summary }));
  }

  async saveLeaderboard(fantasyLeagueId: string, entries: LeaderboardUpsertInput[]): Promise<void> {
    if (entries.length === 0) return;

    const now = new Date();
    await this.db.transaction(async (tx) => {
      for (const entry of entries) {
        await tx
          .insert(leagueLeaderboardEntriesTable)
          .values({
            id: randomUUID(),
            fantasyLeagueId,
            userId: entry.userId,
            totalScore: entry.totalScore,
            rank: entry.rank,
            calculatedAt: now,
          })
          .onConflictDoUpdate({
            target: [
              leagueLeaderboardEntriesTable.fantasyLeagueId,
              leagueLeaderboardEntriesTable.userId,
            ],
            set: {
              totalScore: entry.totalScore,
              rank: entry.rank,
              calculatedAt: now,
              updatedAt: now,
            },
          });
      }
    });
  }

  async getLeaderboard(fantasyLeagueId: string): Promise<LeagueLeaderboardEntry[]> {
    const rows = await this.db
      .select()
      .from(leagueLeaderboardEntriesTable)
      .where(eq(leagueLeaderboardEntriesTable.fantasyLeagueId, fantasyLeagueId))
      .orderBy(leagueLeaderboardEntriesTable.rank);

    return rows.map(LeagueLeaderboardEntryMapper.toDomain);
  }
}

function toSlotPick(row: {
  slot: string;
  grandTourRiderId: string | null;
  grandTourTeamId: string | null;
}): SlotPick {
  return {
    slot: row.slot as SelectionSlot,
    ...(row.grandTourRiderId !== null ? { grandTourRiderId: row.grandTourRiderId } : {}),
    ...(row.grandTourTeamId !== null ? { grandTourTeamId: row.grandTourTeamId } : {}),
  };
}
