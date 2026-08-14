import type { IncomingHttpHeaders } from 'node:http';
import { randomUUID } from 'node:crypto';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { JwksClient } from 'jwks-rsa';
import { AuthVerifierPort } from '@shared/auth/auth-verifier.port';
import { AuthPrincipal } from '@shared/auth/auth-principal';
import { UnauthorizedError } from '@shared/errors/app-error';
import { UserRepositoryPort } from '@modules/user/domain/ports/user-repository.port';
import { User } from '@modules/user/domain/entities/user.entity';

const BEARER_PREFIX = 'Bearer ';

/** Resolves a JWT's `kid` (key id) to the PEM public key that should have
 * signed it. Injected rather than constructed inline so tests can supply
 * a fixture keypair instead of hitting Auth0's real JWKS endpoint — see
 * `createJwksSigningKeyResolver` below for the production implementation. */
export type SigningKeyResolver = (kid: string) => Promise<string>;

/** Real production resolver — wraps `jwks-rsa`'s client (which caches keys
 * itself) against Auth0's well-known JWKS endpoint for this tenant. */
export function createJwksSigningKeyResolver(domain: string): SigningKeyResolver {
  const client = new JwksClient({ jwksUri: `https://${domain}/.well-known/jwks.json` });
  return async (kid: string) => {
    const key = await client.getSigningKey(kid);
    return key.getPublicKey();
  };
}

/**
 * Real Auth0 JWT verification — the `AUTH_MODE=auth0` counterpart to
 * `DevAuthVerifier`. No header -> resolves `null` (see the port's doc
 * comment on what that means); a present-but-invalid token -> throws
 * `UnauthorizedError`, a genuine auth failure. A valid token whose `sub`
 * has no matching local user JIT-provisions one — see the class doc below.
 */
export class Auth0JwtVerifier implements AuthVerifierPort {
  constructor(
    private readonly userRepository: UserRepositoryPort,
    private readonly domain: string,
    private readonly audience: string,
    private readonly getSigningKey: SigningKeyResolver,
  ) {}

  async verify(headers: IncomingHttpHeaders): Promise<AuthPrincipal | null> {
    const authorization = headers.authorization;
    if (!authorization) return null;

    if (!authorization.startsWith(BEARER_PREFIX)) {
      throw new UnauthorizedError('Authorization header must be a Bearer token');
    }
    const token = authorization.slice(BEARER_PREFIX.length);

    const payload = await this.verifyToken(token);
    const sub = payload.sub;
    if (typeof sub !== 'string' || sub.length === 0) {
      throw new UnauthorizedError('Access token has no subject claim');
    }

    const existing = await this.userRepository.findByAuth0Sub(sub);
    if (existing) {
      return { userId: existing.id, role: existing.role };
    }

    const provisioned = await this.provisionUser(sub);
    return { userId: provisioned.id, role: provisioned.role };
  }

  private async verifyToken(token: string): Promise<JwtPayload> {
    const decoded = jwt.decode(token, { complete: true });
    const kid = decoded?.header.kid;
    if (!kid) {
      throw new UnauthorizedError('Access token is malformed or missing a key id');
    }

    let publicKey: string;
    try {
      publicKey = await this.getSigningKey(kid);
    } catch (err) {
      throw new UnauthorizedError('Unable to resolve a signing key for this access token', err);
    }

    try {
      const payload = jwt.verify(token, publicKey, {
        algorithms: ['RS256'],
        issuer: `https://${this.domain}/`,
        audience: this.audience,
      });
      if (typeof payload === 'string') {
        throw new UnauthorizedError('Access token payload was not a JSON object');
      }
      return payload;
    } catch (err) {
      if (err instanceof UnauthorizedError) throw err;
      throw new UnauthorizedError('Access token failed signature/claim verification', err);
    }
  }

  /**
   * JIT provisioning — the first request bearing a validly-signed token
   * for a `sub` we've never seen becomes that user's registration. Access
   * tokens don't carry profile claims (email/name) unless a Post-Login
   * Action adds them or `/userinfo` is called with the right scopes —
   * neither is set up yet, so the new row gets a placeholder profile.
   * v1 default, flagged in the plan: revisit once a real frontend exists
   * and requests `profile`/`email` scopes.
   *
   * Races (two near-simultaneous first requests for the same brand-new
   * `sub`) are handled by falling back to a re-lookup on a unique-
   * constraint failure rather than crashing — `users.auth0_sub` is unique,
   * so the loser of the race finds the winner's row instead of erroring.
   */
  private async provisionUser(sub: string): Promise<User> {
    const placeholderHandle = sub.replace(/\|/g, '-');
    const user = User.create({
      id: randomUUID(),
      email: `${placeholderHandle}@users.auth0.invalid`,
      name: 'Auth0 User',
      auth0Sub: sub,
    });

    try {
      await this.userRepository.save(user);
      return user;
    } catch (err) {
      const raceWinner = await this.userRepository.findByAuth0Sub(sub);
      if (raceWinner) return raceWinner;
      throw err;
    }
  }
}
