import { FantasyLeague } from '../../domain/entities/fantasy-league.entity';
import { FantasyLeagueRepositoryPort } from '../../domain/ports/fantasy-league-repository.port';
import { FantasyLeagueNotFoundError } from '../../domain/errors/fantasy-league.errors';

export class GetFantasyLeagueUseCase {
  constructor(private readonly fantasyLeagueRepository: FantasyLeagueRepositoryPort) {}

  async execute(id: string): Promise<FantasyLeague> {
    const fantasyLeague = await this.fantasyLeagueRepository.findById(id);
    if (!fantasyLeague) {
      throw new FantasyLeagueNotFoundError(id);
    }
    return fantasyLeague;
  }
}
