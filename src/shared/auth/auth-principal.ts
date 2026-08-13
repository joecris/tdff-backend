import { UserRole } from './role';

/**
 * The authenticated caller, attached to every request by
 * `authenticate.middleware.ts` regardless of which `AuthVerifierPort`
 * implementation is wired in. Everything downstream of the middleware
 * (route handlers, `requireRole`) depends only on this shape, never on how
 * it was derived (a dev header today, a verified Auth0 JWT later).
 */
export interface AuthPrincipal {
  userId: string;
  role: UserRole;
}
