import { z } from 'zod';
import { GrandTourTeam } from '../../../../domain/entities/grand-tour-team.entity';

export const grandTourTeamResponseSchema = z.object({
  id: z.uuid(),
  grandTourId: z.uuid(),
  teamId: z.uuid(),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
});
export type GrandTourTeamResponseDto = z.infer<typeof grandTourTeamResponseSchema>;

export function toGrandTourTeamResponseDto(grandTourTeam: GrandTourTeam): GrandTourTeamResponseDto {
  return {
    id: grandTourTeam.id,
    grandTourId: grandTourTeam.grandTourId,
    teamId: grandTourTeam.teamId,
    createdAt: grandTourTeam.createdAt.toISOString(),
    updatedAt: grandTourTeam.updatedAt.toISOString(),
  };
}
