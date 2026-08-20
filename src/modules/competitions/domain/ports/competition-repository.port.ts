import { Competition } from '../entities/competition.entity';
import { PaginationParams } from '@shared/domain/pagination';

export interface CompetitionRepositoryPort {
  findById(id: string): Promise<Competition | null>;
  findMany(params: PaginationParams): Promise<{ items: Competition[]; total: number }>;
  save(competition: Competition): Promise<void>;
}
