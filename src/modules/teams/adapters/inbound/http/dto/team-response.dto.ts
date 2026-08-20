import { z } from 'zod';
import { Team } from '../../../../domain/entities/team.entity';
import { PaginatedResult } from '@shared/domain/pagination';
import { paginatedResponseSchema } from '@shared/http/pagination.dto';

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

export const paginatedTeamResponseSchema = paginatedResponseSchema(teamResponseSchema);
export type PaginatedTeamResponseDto = z.infer<typeof paginatedTeamResponseSchema>;

export function toPaginatedTeamResponseDto(
  result: PaginatedResult<Team>,
): PaginatedTeamResponseDto {
  return { ...result, items: result.items.map(toTeamResponseDto) };
}
