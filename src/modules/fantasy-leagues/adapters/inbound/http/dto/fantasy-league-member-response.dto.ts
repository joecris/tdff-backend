import { FantasyLeagueMember } from '../../../../domain/entities/fantasy-league-member.entity';

export interface FantasyLeagueMemberResponseDto {
  id: string;
  fantasyLeagueId: string;
  userId: string;
  role: string;
  joinedAt: string;
}

export function toFantasyLeagueMemberResponseDto(
  member: FantasyLeagueMember,
): FantasyLeagueMemberResponseDto {
  return {
    id: member.id,
    fantasyLeagueId: member.fantasyLeagueId,
    userId: member.userId,
    role: member.role,
    // createdAt IS the join time for a membership row — see the entity's
    // doc comment — exposed here under its more meaningful public name.
    joinedAt: member.createdAt.toISOString(),
  };
}
