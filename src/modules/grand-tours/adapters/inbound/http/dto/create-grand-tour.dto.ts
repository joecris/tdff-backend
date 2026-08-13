import { z } from 'zod';
import { isDdMmYyyyFormat, parseDdMmYyyy } from '@shared/utils/date-format';

const ddMmYyyyDate = z
  .string()
  .refine(isDdMmYyyyFormat, { message: 'Invalid format. Use DD-MM-YYYY' })
  .transform((val, ctx) => {
    const date = parseDdMmYyyy(val);
    if (!date) {
      ctx.addIssue({ code: 'custom', message: 'This calendar date does not exist' });
      return z.NEVER;
    }
    return date;
  });

export const createGrandTourSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().min(1).max(255).optional(),
  startDate: ddMmYyyyDate.optional(),
  endDate: ddMmYyyyDate.optional(),
});

export type CreateGrandTourDto = z.infer<typeof createGrandTourSchema>;
