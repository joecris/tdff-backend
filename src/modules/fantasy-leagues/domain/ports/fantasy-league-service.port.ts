import { FantasyLeague } from '../entities/fantasy-league.entity';
import { FantasyLeagueMember } from '../entities/fantasy-league-member.entity';
import { PaginatedResult, PaginationParams } from '@shared/domain/pagination';

export interface CreateFantasyLeagueInput {
  name: string;
  description?: string;
  grandTourId: string;
  startDate?: Date;
  endDate?: Date;
}

export interface JoinFantasyLeagueInput {
  fantasyLeagueId: string;
  userId: string;
}

export interface FantasyLeagueServicePort {
  createFantasyLeague(input: CreateFantasyLeagueInput): Promise<FantasyLeague>;
  getFantasyLeagueById(id: string): Promise<FantasyLeague>;
  listFantasyLeagues(params: PaginationParams): Promise<PaginatedResult<FantasyLeague>>;
  joinFantasyLeague(input: JoinFantasyLeagueInput): Promise<FantasyLeagueMember>;
  listMembers(fantasyLeagueId: string): Promise<FantasyLeagueMember[]>;
}
