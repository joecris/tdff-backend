import { z } from 'zod';

// Partial-update body — currently just `imageUrl`, matching
// `Competition.updateDetails`'s scope. Omitting the field leaves the
// stored value untouched (see the use case's conditional spread); it's
// `.optional()`, not required, for that reason, not because it's optional
// data in the domain sense.
export const updateCompetitionDetailsSchema = z.object({
  imageUrl: z.url().max(500).optional(),
});

export type UpdateCompetitionDetailsDto = z.infer<typeof updateCompetitionDetailsSchema>;
