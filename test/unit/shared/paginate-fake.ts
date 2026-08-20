import { PaginationParams } from '@shared/domain/pagination';

/**
 * Every fake repository's `findMany` needs the identical in-memory
 * slice-and-count logic the real Drizzle adapters do with SQL
 * (`ORDER BY created_at DESC LIMIT ... OFFSET ...` + a count query) — one
 * shared implementation instead of six near-identical copies.
 */
export function paginateFake<T>(
  all: T[],
  params: PaginationParams,
  createdAt: (item: T) => Date,
): { items: T[]; total: number } {
  const sorted = [...all].sort((a, b) => createdAt(b).getTime() - createdAt(a).getTime());
  const offset = (params.page - 1) * params.limit;
  return { items: sorted.slice(offset, offset + params.limit), total: all.length };
}
