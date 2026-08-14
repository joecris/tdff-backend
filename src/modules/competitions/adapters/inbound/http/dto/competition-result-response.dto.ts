import { z } from 'zod';
import { CompetitionResult } from '../../../../domain/entities/competition-result.entity';

export const competitionResultSelectionResponseSchema = z.object({
  slot: z.string(),
  grandTourRiderId: z.uuid().optional(),
  grandTourTeamId: z.uuid().optional(),
});
export type CompetitionResultSelectionResponseDto = z.infer<
  typeof competitionResultSelectionResponseSchema
>;

export const competitionResultResponseSchema = z.object({
  id: z.uuid(),
  competitionId: z.uuid(),
  submittedByUserId: z.uuid().optional(),
  selections: z.array(competitionResultSelectionResponseSchema),
  submittedAt: z.iso.datetime(),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
});
export type CompetitionResultResponseDto = z.infer<typeof competitionResultResponseSchema>;

export function toCompetitionResultResponseDto(
  result: CompetitionResult,
): CompetitionResultResponseDto {
  return {
    id: result.id,
    competitionId: result.competitionId,
    ...(result.submittedByUserId !== undefined
      ? { submittedByUserId: result.submittedByUserId }
      : {}),
    selections: result.selections.map((selection) => ({
      slot: selection.slot,
      ...(selection.grandTourRiderId !== undefined
        ? { grandTourRiderId: selection.grandTourRiderId }
        : {}),
      ...(selection.grandTourTeamId !== undefined
        ? { grandTourTeamId: selection.grandTourTeamId }
        : {}),
    })),
    submittedAt: result.submittedAt.toISOString(),
    createdAt: result.createdAt.toISOString(),
    updatedAt: result.updatedAt.toISOString(),
  };
}
