import { GrandTourTeam } from '../../../../domain/entities/grand-tour-team.entity';

export interface GrandTourTeamResponseDto {
  id: string;
  grandTourId: string;
  teamId: string;
  createdAt: string;
  updatedAt: string;
}

export function toGrandTourTeamResponseDto(grandTourTeam: GrandTourTeam): GrandTourTeamResponseDto {
  return {
    id: grandTourTeam.id,
    grandTourId: grandTourTeam.grandTourId,
    teamId: grandTourTeam.teamId,
    createdAt: grandTourTeam.createdAt.toISOString(),
    updatedAt: grandTourTeam.updatedAt.toISOString(),
  };
}
