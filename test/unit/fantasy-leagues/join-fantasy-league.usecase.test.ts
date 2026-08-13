import { describe, it, expect, beforeEach } from 'vitest';
import { randomUUID } from 'node:crypto';
import { JoinFantasyLeagueUseCase } from '@modules/fantasy-leagues/application/use-cases/join-fantasy-league.usecase';
import { FantasyLeague } from '@modules/fantasy-leagues/domain/entities/fantasy-league.entity';
import {
  AlreadyMemberError,
  FantasyLeagueNotFoundError,
} from '@modules/fantasy-leagues/domain/errors/fantasy-league.errors';
import { UserService } from '@modules/user/application/user.service';
import { UserNotFoundError } from '@modules/user/domain/errors/user.errors';
import { FakeFantasyLeagueRepository } from './fake-fantasy-league.repository';
import { FakeFantasyLeagueMemberRepository } from './fake-fantasy-league-member.repository';
import { FakeUserRepository } from '../user/fake-user.repository';

describe('JoinFantasyLeagueUseCase', () => {
  let fantasyLeagueRepository: FakeFantasyLeagueRepository;
  let memberRepository: FakeFantasyLeagueMemberRepository;
  let userService: UserService;
  let useCase: JoinFantasyLeagueUseCase;
  let league: FantasyLeague;
  let userId: string;

  beforeEach(async () => {
    fantasyLeagueRepository = new FakeFantasyLeagueRepository();
    memberRepository = new FakeFantasyLeagueMemberRepository();
    userService = new UserService(new FakeUserRepository());
    useCase = new JoinFantasyLeagueUseCase(memberRepository, fantasyLeagueRepository, userService);

    league = FantasyLeague.create({
      id: randomUUID(),
      name: 'Tour de France Fantasy',
      grandTourId: randomUUID(),
    });
    await fantasyLeagueRepository.save(league);

    const user = await userService.createUser({ email: 'bob@example.com', name: 'Bob' });
    userId = user.id;
  });

  it('joins a user to the league as a member', async () => {
    const membership = await useCase.execute({ fantasyLeagueId: league.id, userId });

    expect(membership.role).toBe('member');
    expect(membership.userId).toBe(userId);
  });

  it('throws FantasyLeagueNotFoundError for an unknown league', async () => {
    await expect(
      useCase.execute({ fantasyLeagueId: '00000000-0000-0000-0000-000000000000', userId }),
    ).rejects.toBeInstanceOf(FantasyLeagueNotFoundError);
  });

  it('throws UserNotFoundError for an unknown user', async () => {
    await expect(
      useCase.execute({
        fantasyLeagueId: league.id,
        userId: '00000000-0000-0000-0000-000000000000',
      }),
    ).rejects.toBeInstanceOf(UserNotFoundError);
  });

  it('throws AlreadyMemberError when joining the same league twice', async () => {
    await useCase.execute({ fantasyLeagueId: league.id, userId });

    await expect(useCase.execute({ fantasyLeagueId: league.id, userId })).rejects.toBeInstanceOf(
      AlreadyMemberError,
    );
  });
});
