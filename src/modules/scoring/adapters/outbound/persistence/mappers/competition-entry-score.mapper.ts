import { CompetitionEntryScore } from '../../../../domain/entities/competition-entry-score.entity';
import { CompetitionEntryScoreRow } from '@infrastructure/db/schema/competition-entry-score.schema';

export class CompetitionEntryScoreMapper {
  static toDomain(row: CompetitionEntryScoreRow): CompetitionEntryScore {
    return CompetitionEntryScore.fromPersistence({
      id: row.id,
      entryId: row.entryId,
      competitionId: row.competitionId,
      userId: row.userId,
      score: row.score,
      calculatedAt: row.calculatedAt,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    });
  }
}
