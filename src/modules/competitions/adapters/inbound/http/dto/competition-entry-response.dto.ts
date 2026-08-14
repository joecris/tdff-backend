import { z } from 'zod';
import { CompetitionEntry } from '../../../../domain/entities/competition-entry.entity';

export const competitionEntrySelectionResponseSchema = z.object({
  slot: z.string(),
  grandTourRiderId: z.uuid().optional(),
  grandTourTeamId: z.uuid().optional(),
});
export type CompetitionEntrySelectionResponseDto = z.infer<
  typeof competitionEntrySelectionResponseSchema
>;

export const competitionEntryResponseSchema = z.object({
  id: z.uuid(),
  competitionId: z.uuid(),
  userId: z.uuid(),
  selections: z.array(competitionEntrySelectionResponseSchema),
  submittedAt: z.iso.datetime(),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
});
export type CompetitionEntryResponseDto = z.infer<typeof competitionEntryResponseSchema>;

export function toCompetitionEntryResponseDto(
  entry: CompetitionEntry,
): CompetitionEntryResponseDto {
  return {
    id: entry.id,
    competitionId: entry.competitionId,
    userId: entry.userId,
    selections: entry.selections.map((selection) => ({
      slot: selection.slot,
      ...(selection.grandTourRiderId !== undefined
        ? { grandTourRiderId: selection.grandTourRiderId }
        : {}),
      ...(selection.grandTourTeamId !== undefined
        ? { grandTourTeamId: selection.grandTourTeamId }
        : {}),
    })),
    submittedAt: entry.submittedAt.toISOString(),
    createdAt: entry.createdAt.toISOString(),
    updatedAt: entry.updatedAt.toISOString(),
  };
}
