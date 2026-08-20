import { FantasyLeague } from '../domain/entities/fantasy-league.entity';
import { FantasyLeagueMember } from '../domain/entities/fantasy-league-member.entity';
import { FantasyLeagueRepositoryPort } from '../domain/ports/fantasy-league-repository.port';
import { FantasyLeagueMemberRepositoryPort } from '../domain/ports/fantasy-league-member-repository.port';
import {
  CreateFantasyLeagueInput,
  FantasyLeagueServicePort,
  JoinFantasyLeagueInput,
} from '../domain/ports/fantasy-league-service.port';
import { GrandTourServicePort } from '@modules/grand-tours/domain/ports/grand-tour-service.port';
import { UserServicePort } from '@modules/user/domain/ports/user-service.port';
import { PaginatedResult, PaginationParams } from '@shared/domain/pagination';
import { CreateFantasyLeagueUseCase } from './use-cases/create-fantasy-league.usecase';
import { GetFantasyLeagueUseCase } from './use-cases/get-fantasy-league.usecase';
import { ListFantasyLeaguesUseCase } from './use-cases/list-fantasy-leagues.usecase';
import { JoinFantasyLeagueUseCase } from './use-cases/join-fantasy-league.usecase';
import { ListFantasyLeagueMembersUseCase } from './use-cases/list-fantasy-league-members.usecase';

export class FantasyLeagueService implements FantasyLeagueServicePort {
  private readonly createUseCase: CreateFantasyLeagueUseCase;
  private readonly getUseCase: GetFantasyLeagueUseCase;
  private readonly listUseCase: ListFantasyLeaguesUseCase;
  private readonly joinUseCase: JoinFantasyLeagueUseCase;
  private readonly listMembersUseCase: ListFantasyLeagueMembersUseCase;

  constructor(
    fantasyLeagueRepository: FantasyLeagueRepositoryPort,
    memberRepository: FantasyLeagueMemberRepositoryPort,
    grandTourService: GrandTourServicePort,
    userService: UserServicePort,
  ) {
    this.createUseCase = new CreateFantasyLeagueUseCase(fantasyLeagueRepository, grandTourService);
    this.getUseCase = new GetFantasyLeagueUseCase(fantasyLeagueRepository);
    this.listUseCase = new ListFantasyLeaguesUseCase(fantasyLeagueRepository);
    this.joinUseCase = new JoinFantasyLeagueUseCase(
      memberRepository,
      fantasyLeagueRepository,
      userService,
    );
    this.listMembersUseCase = new ListFantasyLeagueMembersUseCase(
      memberRepository,
      fantasyLeagueRepository,
    );
  }

  createFantasyLeague(input: CreateFantasyLeagueInput): Promise<FantasyLeague> {
    return this.createUseCase.execute(input);
  }

  getFantasyLeagueById(id: string): Promise<FantasyLeague> {
    return this.getUseCase.execute(id);
  }

  listFantasyLeagues(params: PaginationParams): Promise<PaginatedResult<FantasyLeague>> {
    return this.listUseCase.execute(params);
  }

  joinFantasyLeague(input: JoinFantasyLeagueInput): Promise<FantasyLeagueMember> {
    return this.joinUseCase.execute(input);
  }

  listMembers(fantasyLeagueId: string): Promise<FantasyLeagueMember[]> {
    return this.listMembersUseCase.execute(fantasyLeagueId);
  }
}
