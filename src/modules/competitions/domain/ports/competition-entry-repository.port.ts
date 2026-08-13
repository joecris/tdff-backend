import { CompetitionEntry } from '../entities/competition-entry.entity';

export interface CompetitionEntryRepositoryPort {
  findByCompetitionAndUser(competitionId: string, userId: string): Promise<CompetitionEntry | null>;
  listByCompetition(competitionId: string): Promise<CompetitionEntry[]>;
  save(entry: CompetitionEntry): Promise<void>;
}
