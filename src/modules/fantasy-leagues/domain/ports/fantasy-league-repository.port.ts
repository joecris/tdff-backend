import { FantasyLeague } from '../entities/fantasy-league.entity';
import { PaginationParams } from '@shared/domain/pagination';

export interface FantasyLeagueRepositoryPort {
  findById(id: string): Promise<FantasyLeague | null>;
  findMany(params: PaginationParams): Promise<{ items: FantasyLeague[]; total: number }>;
  save(fantasyLeague: FantasyLeague): Promise<void>;
}
