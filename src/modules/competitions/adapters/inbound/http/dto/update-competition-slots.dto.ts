import { z } from 'zod';
import { SELECTION_SLOTS } from '@shared/domain/selection-slot';

export const updateCompetitionSlotsSchema = z.object({
  slots: z
    .array(
      z.object({
        slot: z.enum(SELECTION_SLOTS),
        points: z.number().int().positive(),
      }),
    )
    .min(1),
});

export type UpdateCompetitionSlotsDto = z.infer<typeof updateCompetitionSlotsSchema>;
