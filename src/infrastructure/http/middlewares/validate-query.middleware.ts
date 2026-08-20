import { RequestHandler } from 'express';
import { ZodType } from 'zod';
import { ValidationError } from '@shared/errors/app-error';
import { PaginationParams } from '@shared/domain/pagination';

/**
 * Same shape as `validate.middleware.ts`'s `validateBody`, but for
 * `req.query`. Doesn't reassign `req.query` itself (Express 5 types it as
 * `ParsedQs` — all strings — so writing coerced numbers back into it would
 * fight the type, and other middleware/handlers downstream may still
 * expect the raw shape); instead attaches the parsed/coerced/defaulted
 * result to `req.pagination` (see `types/express.d.ts`), which is what
 * every list controller reads. Generic over `T extends PaginationParams`
 * (rather than a blind cast) so a schema whose output doesn't actually
 * match `{ page, limit }` fails to compile here, not silently at runtime.
 */
export function validateQuery<T extends PaginationParams>(schema: ZodType<T>): RequestHandler {
  return (req, _res, next) => {
    const result = schema.safeParse(req.query);
    if (!result.success) {
      next(new ValidationError('Query parameters validation failed', result.error.flatten()));
      return;
    }
    req.pagination = result.data;
    next();
  };
}
