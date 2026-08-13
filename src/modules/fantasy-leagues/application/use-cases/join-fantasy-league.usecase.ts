import { randomUUID } from 'node:crypto';
import { FantasyLeagueMember } from '../../domain/entities/fantasy-league-member.entity';
import { FantasyLeagueRepositoryPort } from '../../domain/ports/fantasy-league-repository.port';
import { FantasyLeagueMemberRepositoryPort } from '../../domain/ports/fantasy-league-member-repository.port';
import { JoinFantasyLeagueInput } from '../../domain/ports/fantasy-league-service.port';
import {
  AlreadyMemberError,
  FantasyLeagueNotFoundError,
} from '../../domain/errors/fantasy-league.errors';
import { UserServicePort } from '@modules/user/domain/ports/user-service.port';

/**
 * `userId` is expected to come from `req.auth.userId` (an authenticated
 * principal), not a request body field — see fantasy-league.routes.ts.
 * Still re-validated via `userService.getUserById` here rather than
 * trusted blindly: open v1 default is "any authenticated user may join
 * any league" (no invite/capacity gating), so this existence check is the
 * only integrity guard in front of the (fantasy_league_id, user_id)
 * unique constraint.
 */
export class JoinFantasyLeagueUseCase {
  constructor(
    private readonly memberRepository: FantasyLeagueMemberRepositoryPort,
    private readonly fantasyLeagueRepository: FantasyLeagueRepositoryPort,
    private readonly userService: UserServicePort,
  ) {}

  async execute(input: JoinFantasyLeagueInput): Promise<FantasyLeagueMember> {
    const fantasyLeague = await this.fantasyLeagueRepository.findById(input.fantasyLeagueId);
    if (!fantasyLeague) {
      throw new FantasyLeagueNotFoundError(input.fantasyLeagueId);
    }

    await this.userService.getUserById(input.userId);

    const existing = await this.memberRepository.findByLeagueAndUser(
      input.fantasyLeagueId,
      input.userId,
    );
    if (existing) {
      throw new AlreadyMemberError(input.fantasyLeagueId, input.userId);
    }

    const member = FantasyLeagueMember.create({
      id: randomUUID(),
      fantasyLeagueId: input.fantasyLeagueId,
      userId: input.userId,
    });

    await this.memberRepository.save(member);
    return member;
  }
}
