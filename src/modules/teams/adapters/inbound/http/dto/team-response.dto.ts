import { z } from 'zod';
import { Team } from '../../../../domain/entities/team.entity';

export const teamResponseSchema = z.object({
  id: z.uuid(),
  name: z.string(),
  logoUrl: z.string().optional(),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
});
export type TeamResponseDto = z.infer<typeof teamResponseSchema>;

export function toTeamResponseDto(team: Team): TeamResponseDto {
  return {
    id: team.id,
    name: team.name,
    ...(team.logoUrl !== undefined ? { logoUrl: team.logoUrl } : {}),
    createdAt: team.createdAt.toISOString(),
    updatedAt: team.updatedAt.toISOString(),
  };
}
