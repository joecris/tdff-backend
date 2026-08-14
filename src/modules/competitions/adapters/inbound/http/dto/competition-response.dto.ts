import { z } from 'zod';
import { Competition } from '../../../../domain/entities/competition.entity';

export const competitionSlotConfigResponseSchema = z.object({
  slot: z.string(),
  points: z.number().int(),
});
export type CompetitionSlotConfigResponseDto = z.infer<typeof competitionSlotConfigResponseSchema>;

export const competitionResponseSchema = z.object({
  id: z.uuid(),
  name: z.string(),
  description: z.string().optional(),
  type: z.string(),
  fantasyLeagueId: z.uuid(),
  entryLockAt: z.iso.datetime().optional(),
  slots: z.array(competitionSlotConfigResponseSchema),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
});
export type CompetitionResponseDto = z.infer<typeof competitionResponseSchema>;

export function toCompetitionResponseDto(competition: Competition): CompetitionResponseDto {
  return {
    id: competition.id,
    name: competition.name,
    type: competition.type,
    fantasyLeagueId: competition.fantasyLeagueId,
    slots: competition.slots,
    ...(competition.description !== undefined ? { description: competition.description } : {}),
    ...(competition.entryLockAt !== undefined
      ? { entryLockAt: competition.entryLockAt.toISOString() }
      : {}),
    createdAt: competition.createdAt.toISOString(),
    updatedAt: competition.updatedAt.toISOString(),
  };
}
