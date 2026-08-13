import { FantasyLeagueMember } from '@modules/fantasy-leagues/domain/entities/fantasy-league-member.entity';
import { FantasyLeagueMemberRepositoryPort } from '@modules/fantasy-leagues/domain/ports/fantasy-league-member-repository.port';

export class FakeFantasyLeagueMemberRepository implements FantasyLeagueMemberRepositoryPort {
  private readonly rows: FantasyLeagueMember[] = [];

  async findByLeagueAndUser(
    fantasyLeagueId: string,
    userId: string,
  ): Promise<FantasyLeagueMember | null> {
    return (
      this.rows.find((r) => r.fantasyLeagueId === fantasyLeagueId && r.userId === userId) ?? null
    );
  }

  async listByLeague(fantasyLeagueId: string): Promise<FantasyLeagueMember[]> {
    return this.rows.filter((r) => r.fantasyLeagueId === fantasyLeagueId);
  }

  async save(member: FantasyLeagueMember): Promise<void> {
    this.rows.push(member);
  }
}
