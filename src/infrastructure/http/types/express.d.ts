import { AuthPrincipal } from '@shared/auth/auth-principal';
import { PaginationParams } from '@shared/domain/pagination';

// Same idea as pino-http's own augmentation of `req.log` — extends the
// Express Request type globally so `req.auth` is available (and typed)
// in every route/middleware without an explicit cast.
declare global {
  namespace Express {
    interface Request {
      auth?: AuthPrincipal;
      // Set by `validateQuery(paginationQuerySchema)` — coerced/defaulted
      // page+limit, ready for a list controller to read directly rather
      // than re-parsing `req.query`'s raw strings itself.
      pagination?: PaginationParams;
    }
  }
}

export {};
