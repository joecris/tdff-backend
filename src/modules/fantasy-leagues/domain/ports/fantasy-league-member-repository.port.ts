import { FantasyLeagueMember } from '../entities/fantasy-league-member.entity';

export interface FantasyLeagueMemberRepositoryPort {
  findByLeagueAndUser(fantasyLeagueId: string, userId: string): Promise<FantasyLeagueMember | null>;
  listByLeague(fantasyLeagueId: string): Promise<FantasyLeagueMember[]>;
  save(member: FantasyLeagueMember): Promise<void>;
}
