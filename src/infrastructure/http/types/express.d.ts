import { AuthPrincipal } from '@shared/auth/auth-principal';

// Same idea as pino-http's own augmentation of `req.log` — extends the
// Express Request type globally so `req.auth` is available (and typed)
// in every route/middleware without an explicit cast.
declare global {
  namespace Express {
    interface Request {
      auth?: AuthPrincipal;
    }
  }
}

export {};
