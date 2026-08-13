import { z } from 'zod';

export const createRiderSchema = z.object({
  name: z.string().min(1).max(255),
  nationality: z.string().min(1).max(100).optional(),
  imageUrl: z.url().max(500).optional(),
  type: z.string().min(1).max(50).optional(),
  teamId: z.uuid().optional(),
});

export type CreateRiderDto = z.infer<typeof createRiderSchema>;
