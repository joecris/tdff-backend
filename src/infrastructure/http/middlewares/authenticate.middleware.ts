import { RequestHandler } from 'express';
import { AuthVerifierPort } from '@shared/auth/auth-verifier.port';

/**
 * Resolves `req.auth` from whichever `AuthVerifierPort` is wired in (see
 * `di-container.ts`'s `AUTH_MODE` switch). Intended to run globally, ahead
 * of every route — it never blocks a request by itself (a well-behaved
 * verifier resolves rather than throws when no credential is present); the
 * only thing that actually rejects a request is `requireRole` further down
 * the chain on the specific routes that need it.
 */
export function authenticate(verifier: AuthVerifierPort): RequestHandler {
  return (req, _res, next) => {
    verifier
      .verify(req.headers)
      .then((principal) => {
        req.auth = principal;
        next();
      })
      .catch(next);
  };
}
