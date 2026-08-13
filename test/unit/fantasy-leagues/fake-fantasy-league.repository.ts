import { FantasyLeague } from '@modules/fantasy-leagues/domain/entities/fantasy-league.entity';
import { FantasyLeagueRepositoryPort } from '@modules/fantasy-leagues/domain/ports/fantasy-league-repository.port';

export class FakeFantasyLeagueRepository implements FantasyLeagueRepositoryPort {
  private readonly leaguesById = new Map<string, FantasyLeague>();

  async findById(id: string): Promise<FantasyLeague | null> {
    return this.leaguesById.get(id) ?? null;
  }

  async save(fantasyLeague: FantasyLeague): Promise<void> {
    this.leaguesById.set(fantasyLeague.id, fantasyLeague);
  }
}
