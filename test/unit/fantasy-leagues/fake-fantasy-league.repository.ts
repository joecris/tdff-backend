import { FantasyLeague } from '@modules/fantasy-leagues/domain/entities/fantasy-league.entity';
import { FantasyLeagueRepositoryPort } from '@modules/fantasy-leagues/domain/ports/fantasy-league-repository.port';
import { PaginationParams } from '@shared/domain/pagination';
import { paginateFake } from '../shared/paginate-fake';

export class FakeFantasyLeagueRepository implements FantasyLeagueRepositoryPort {
  private readonly leaguesById = new Map<string, FantasyLeague>();

  async findById(id: string): Promise<FantasyLeague | null> {
    return this.leaguesById.get(id) ?? null;
  }

  async findMany(params: PaginationParams): Promise<{ items: FantasyLeague[]; total: number }> {
    return paginateFake([...this.leaguesById.values()], params, (l) => l.createdAt);
  }

  async save(fantasyLeague: FantasyLeague): Promise<void> {
    this.leaguesById.set(fantasyLeague.id, fantasyLeague);
  }
}
