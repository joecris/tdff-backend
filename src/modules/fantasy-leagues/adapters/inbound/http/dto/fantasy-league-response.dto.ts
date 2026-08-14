import { z } from 'zod';
import { FantasyLeague } from '../../../../domain/entities/fantasy-league.entity';
import { formatDdMmYyyy } from '@shared/utils/date-format';

export const fantasyLeagueResponseSchema = z.object({
  id: z.uuid(),
  name: z.string(),
  description: z.string().optional(),
  grandTourId: z.uuid(),
  startDate: z.string().describe('DD-MM-YYYY').optional(),
  endDate: z.string().describe('DD-MM-YYYY').optional(),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
});
export type FantasyLeagueResponseDto = z.infer<typeof fantasyLeagueResponseSchema>;

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
