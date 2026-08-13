import type { IncomingHttpHeaders } from 'node:http';
import { AuthPrincipal } from './auth-principal';

/**
 * The actual seam. `authenticate.middleware.ts` depends only on this
 * interface — swapping `DevAuthVerifier` for a real Auth0 JWT verifier
 * later (verify against Auth0's JWKS, map claims -> AuthPrincipal) means
 * writing one new class and flipping the `AUTH_MODE` env var, not touching
 * any route or controller.
 *
 * Takes the raw request headers rather than a single named header —
 * different implementations read different headers (dev mode reads
 * `x-user-id`; a real verifier would read `authorization`), so the port
 * shouldn't bake in one implementation's choice.
 *
 * Implementations should resolve, not throw, whenever request state alone
 * can't determine a principal (e.g. dev mode with no header) — enforcement
 * is `requireRole`'s job, not the verifier's. A real verifier SHOULD throw
 * `UnauthorizedError` for a present-but-invalid credential (a malformed or
 * expired token), since that's a genuine authentication failure rather
 * than "no credential was offered."
 */
export interface AuthVerifierPort {
  verify(headers: IncomingHttpHeaders): Promise<AuthPrincipal>;
}
