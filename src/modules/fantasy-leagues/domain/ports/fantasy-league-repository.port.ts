import { FantasyLeague } from '../entities/fantasy-league.entity';

export interface FantasyLeagueRepositoryPort {
  findById(id: string): Promise<FantasyLeague | null>;
  save(fantasyLeague: FantasyLeague): Promise<void>;
}
