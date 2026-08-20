/**
 * Framework/ORM-agnostic pagination contract — used by repository ports,
 * use cases, and service ports across every module's "list many" endpoint.
 * No Zod, no Express: those belong to the HTTP boundary
 * (`shared/http/pagination.dto.ts`), not here.
 */
export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginatedResult<T> {
  items: T[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

/**
 * Assembles the final envelope from what a repository's `findMany` returns
 * (`items` + `total`) and the params that produced them — the one place
 * `totalPages` is computed, so every module's list use case does this the
 * same way.
 */
export function toPaginatedResult<T>(
  items: T[],
  total: number,
  params: PaginationParams,
): PaginatedResult<T> {
  return {
    items,
    page: params.page,
    limit: params.limit,
    total,
    totalPages: Math.ceil(total / params.limit),
  };
}
