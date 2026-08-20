import { z } from 'zod';

/** Sensible default per the product ask — 50 items/page when `limit` isn't
 * supplied. Capped at 100 so a client can't force an unbounded table scan
 * via `?limit=1000000`. */
export const DEFAULT_PAGE_LIMIT = 50;
export const MAX_PAGE_LIMIT = 100;

/**
 * Shared query-string schema for every "list many" endpoint — coerces
 * string query params to numbers (Express query values are always
 * strings), applies the default/cap. Reused across modules instead of
 * each route hand-rolling the same page/limit parsing.
 */
export const paginationQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(MAX_PAGE_LIMIT).default(DEFAULT_PAGE_LIMIT),
});

export type PaginationQueryDto = z.infer<typeof paginationQuerySchema>;

/**
 * Wraps any response item schema in the standard `{ items, page, limit,
 * total, totalPages }` envelope — one factory instead of every module
 * hand-writing its own `XListResponseDto`. Mirrors
 * `shared/excel/bulk-import-result.ts`'s role: a shape multiple modules
 * need identically, defined once.
 */
export function paginatedResponseSchema<T extends z.ZodType>(itemSchema: T) {
  return z.object({
    items: z.array(itemSchema),
    page: z.number().int(),
    limit: z.number().int(),
    total: z.number().int(),
    totalPages: z.number().int(),
  });
}
