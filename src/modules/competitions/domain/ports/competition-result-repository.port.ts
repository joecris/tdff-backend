import { CompetitionResult } from '../entities/competition-result.entity';

export interface CompetitionResultRepositoryPort {
  findByCompetition(competitionId: string): Promise<CompetitionResult | null>;
  save(result: CompetitionResult): Promise<void>;
}
