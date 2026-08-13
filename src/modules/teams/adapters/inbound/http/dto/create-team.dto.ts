import { z } from 'zod';

export const createTeamSchema = z.object({
  name: z.string().min(1).max(255),
  logoUrl: z.url().max(500).optional(),
});

export type CreateTeamDto = z.infer<typeof createTeamSchema>;
