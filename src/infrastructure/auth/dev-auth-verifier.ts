import type { IncomingHttpHeaders } from 'node:http';
import { AuthVerifierPort } from '@shared/auth/auth-verifier.port';
import { AuthPrincipal } from '@shared/auth/auth-principal';
import { UnauthorizedError } from '@shared/errors/app-error';
import { UserRepositoryPort } from '@modules/user/domain/ports/user-repository.port';

const DEV_HEADER = 'x-user-id';

/**
 * Dev-only stand-in for real authentication — NOT cryptographically
 * verified; anyone can claim to be any user by setting `x-user-id`. Exists
 * so admin-gated routes are meaningfully testable against real seeded
 * users (a genuine role lookup, not an always-true stub) before Auth0 is
 * wired in. Never use outside `AUTH_MODE=dev`.
 *
 * No header -> falls back to a synthetic admin principal, so every route
 * stays exercisable via a plain curl/Postman request during development
 * without first having to seed and look up a real user id.
 */
export class DevAuthVerifier implements AuthVerifierPort {
  constructor(private readonly userRepository: UserRepositoryPort) {}

  async verify(headers: IncomingHttpHeaders): Promise<AuthPrincipal> {
    const headerValue = headers[DEV_HEADER];
    const userId = Array.isArray(headerValue) ? headerValue[0] : headerValue;

    if (!userId) {
      return { userId: 'dev-admin', role: 'admin' };
    }

    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new UnauthorizedError(`No user found for ${DEV_HEADER} "${userId}"`);
    }

    return { userId: user.id, role: user.role };
  }
}
