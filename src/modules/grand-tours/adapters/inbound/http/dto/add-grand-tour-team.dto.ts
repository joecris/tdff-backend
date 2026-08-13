import { z } from 'zod';

export const addGrandTourTeamSchema = z.object({
  teamId: z.uuid(),
});

export type AddGrandTourTeamDto = z.infer<typeof addGrandTourTeamSchema>;
