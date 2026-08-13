import { FantasyLeague } from '../../../../domain/entities/fantasy-league.entity';
import { formatDdMmYyyy } from '@shared/utils/date-format';

export interface FantasyLeagueResponseDto {
  id: string;
  name: string;
  description?: string;
  grandTourId: string;
  startDate?: string;
  endDate?: string;
  createdAt: string;
  updatedAt: string;
}

export function toFantasyLeagueResponseDto(fantasyLeague: FantasyLeague): FantasyLeagueResponseDto {
  return {
    id: fantasyLeague.id,
    name: fantasyLeague.name,
    grandTourId: fantasyLeague.grandTourId,
    ...(fantasyLeague.description !== undefined ? { description: fantasyLeague.description } : {}),
    ...(fantasyLeague.startDate !== undefined
      ? { startDate: formatDdMmYyyy(fantasyLeague.startDate) }
      : {}),
    ...(fantasyLeague.endDate !== undefined
      ? { endDate: formatDdMmYyyy(fantasyLeague.endDate) }
      : {}),
    createdAt: fantasyLeague.createdAt.toISOString(),
    updatedAt: fantasyLeague.updatedAt.toISOString(),
  };
}
