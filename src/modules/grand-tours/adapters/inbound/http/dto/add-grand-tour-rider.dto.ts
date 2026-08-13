import { z } from 'zod';

export const addGrandTourRiderSchema = z.object({
  riderId: z.uuid(),
});

export type AddGrandTourRiderDto = z.infer<typeof addGrandTourRiderSchema>;
