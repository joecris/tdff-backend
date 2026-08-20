import { z } from 'zod';
import { SELECTION_SLOTS } from '@shared/domain/selection-slot';

// `entryLockAt` is a real timestamp (time-of-day matters), unlike the
// calendar-only `startDate`/`endDate` fields elsewhere in this codebase
// that warranted the custom DD-MM-YYYY UTC-midnight handling — plain ISO
// 8601 + z.coerce.date() is the right tool for an actual instant in time.
//
// `slots` is admin-set per competition instance (Phase 4.5) — this is
// what makes a competition's required picks and their point values a
// pure data change, not a code change. `type` stays alongside it purely
// as a descriptive/category label.
const slotConfigSchema = z.object({
  slot: z.enum(SELECTION_SLOTS),
  points: z.number().int().positive(),
});

// Free-form category label, not a closed enum — see competition.schema.ts
// for why: it's display-only, and the real set of classifications isn't
// fixed (GC, KOM, points, young rider, one per stage, ...).
export const createCompetitionSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().min(1).max(500).optional(),
  type: z.string().min(1).max(50),
  fantasyLeagueId: z.uuid(),
  imageUrl: z.url().max(500).optional(),
  entryLockAt: z.coerce.date().optional(),
  slots: z.array(slotConfigSchema).min(1),
});

export type CreateCompetitionDto = z.infer<typeof createCompetitionSchema>;
