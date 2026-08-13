import { FantasyLeagueMember } from '../../domain/entities/fantasy-league-member.entity';
import { FantasyLeagueRepositoryPort } from '../../domain/ports/fantasy-league-repository.port';
import { FantasyLeagueMemberRepositoryPort } from '../../domain/ports/fantasy-league-member-repository.port';
import { FantasyLeagueNotFoundError } from '../../domain/errors/fantasy-league.errors';

export class ListFantasyLeagueMembersUseCase {
  constructor(
    private readonly memberRepository: FantasyLeagueMemberRepositoryPort,
    private readonly fantasyLeagueRepository: FantasyLeagueRepositoryPort,
  ) {}

  async execute(fantasyLeagueId: string): Promise<FantasyLeagueMember[]> {
    const fantasyLeague = await this.fantasyLeagueRepository.findById(fantasyLeagueId);
    if (!fantasyLeague) {
      throw new FantasyLeagueNotFoundError(fantasyLeagueId);
    }

    return this.memberRepository.listByLeague(fantasyLeagueId);
  }
}
