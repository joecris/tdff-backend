import { Team } from '../../../../domain/entities/team.entity';

export interface TeamResponseDto {
  id: string;
  name: string;
  logoUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export function toTeamResponseDto(team: Team): TeamResponseDto {
  return {
    id: team.id,
    name: team.name,
    ...(team.logoUrl !== undefined ? { logoUrl: team.logoUrl } : {}),
    createdAt: team.createdAt.toISOString(),
    updatedAt: team.updatedAt.toISOString(),
  };
}
