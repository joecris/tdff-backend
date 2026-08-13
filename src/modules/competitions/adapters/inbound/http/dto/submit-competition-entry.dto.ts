import { z } from 'zod';
import { SELECTION_SLOTS } from '@shared/domain/selection-slot';

const entrySelectionSchema = z
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

export const submitCompetitionEntrySchema = z.object({
  selections: z.array(entrySelectionSchema).min(1),
});

export type SubmitCompetitionEntryDto = z.infer<typeof submitCompetitionEntrySchema>;
