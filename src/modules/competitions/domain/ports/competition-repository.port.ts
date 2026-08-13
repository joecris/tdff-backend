import { Competition } from '../entities/competition.entity';

export interface CompetitionRepositoryPort {
  findById(id: string): Promise<Competition | null>;
  save(competition: Competition): Promise<void>;
}
