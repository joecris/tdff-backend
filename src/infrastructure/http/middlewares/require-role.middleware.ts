import { RequestHandler } from 'express';
import { UserRole } from '@shared/auth/role';
import { ForbiddenError, UnauthorizedError } from '@shared/errors/app-error';

/**
 * Gate for admin-mutating routes — placed the same place `validateBody(...)`
 * already sits in each module's `*.routes.ts`, after `authenticate` has run.
 * Requires `authenticate` to have run first; treats a missing `req.auth` as
 * a bug (no verifier configured) rather than silently allowing the request.
 */
export function requireRole(role: UserRole): RequestHandler {
  return (req, _res, next) => {
    if (!req.auth) {
      next(
        new UnauthorizedError(
          'No authenticated principal on request — is `authenticate` middleware mounted?',
        ),
      );
      return;
    }
    if (req.auth.role !== role) {
      next(new ForbiddenError(`Requires role "${role}"`));
      return;
    }
    next();
  };
}
