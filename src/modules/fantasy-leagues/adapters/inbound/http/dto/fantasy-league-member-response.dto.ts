import { z } from 'zod';
import { FantasyLeagueMember } from '../../../../domain/entities/fantasy-league-member.entity';

export const fantasyLeagueMemberResponseSchema = z.object({
  id: z.uuid(),
  fantasyLeagueId: z.uuid(),
  userId: z.uuid(),
  role: z.string(),
  joinedAt: z.iso.datetime(),
});
export type FantasyLeagueMemberResponseDto = z.infer<typeof fantasyLeagueMemberResponseSchema>;

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
