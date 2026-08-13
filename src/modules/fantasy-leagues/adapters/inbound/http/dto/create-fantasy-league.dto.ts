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

export const createFantasyLeagueSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().min(1).max(500).optional(),
  grandTourId: z.uuid(),
  startDate: ddMmYyyyDate.optional(),
  endDate: ddMmYyyyDate.optional(),
});

export type CreateFantasyLeagueDto = z.infer<typeof createFantasyLeagueSchema>;
