import { z } from 'zod';
import { SELECTION_SLOTS } from '@shared/domain/selection-slot';

// Same shape as submit-competition-entry.dto.ts's selection schema —
// admin declaring the "correct answer" is structurally the same input as
// a user declaring their pick.
const resultSelectionSchema = z
  .object({
    slot: z.enum(SELECTION_SLOTS),
    grandTourRiderId: z.uuid().optional(),
    grandTourTeamId: z.uuid().optional(),
  })
  .refine(
    (data) => (data.grandTourRiderId !== undefined) !== (data.grandTourTeamId !== undefined),
    {
      message: 'Exactly one of grandTourRiderId or grandTourTeamId must be provided',
    },
  );

export const submitCompetitionResultsSchema = z.object({
  selections: z.array(resultSelectionSchema).min(1),
});

export type SubmitCompetitionResultsDto = z.infer<typeof submitCompetitionResultsSchema>;
