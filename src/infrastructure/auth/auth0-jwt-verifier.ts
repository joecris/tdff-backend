import type { IncomingHttpHeaders } from 'node:http';
import { randomUUID, createPublicKey, webcrypto } from 'node:crypto';
import jwt, { JwtPayload } from 'jsonwebtoken';
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

interface Jwk extends webcrypto.JsonWebKey {
  kid?: string;
}

const JWKS_CACHE_TTL_MS = 10 * 60 * 1000;

/**
 * Real production resolver — fetches Auth0's JWKS document and converts
 * the matching JWK to a PEM public key, using only Node's built-in
 * `fetch`/`crypto` (no `jwks-rsa`). That package pulls in `jose`, which
 * ships ESM-only in recent versions and breaks under `require()` in
 * Vercel's Node runtime (`ERR_REQUIRE_ESM`) — found via a real deploy,
 * not a hypothetical. `crypto.createPublicKey({ format: 'jwk', ... })`
 * does the exact same JWK->PEM conversion `jwks-rsa` was doing for us,
 * built into Node since well before this project's minimum version.
 *
 * Caches the fetched key set for `JWKS_CACHE_TTL_MS`, reused across warm
 * invocations of the same function instance (module-scope state, same
 * principle as `client.ts`'s singleton pool). A `kid` miss forces one
 * cache refresh before giving up, to ride out Auth0 rotating its signing
 * keys without waiting out the full TTL.
 */
export function createJwksSigningKeyResolver(domain: string): SigningKeyResolver {
  let cache: { keys: Map<string, string>; fetchedAt: number } | null = null;

  async function fetchKeys(): Promise<Map<string, string>> {
    const response = await fetch(`https://${domain}/.well-known/jwks.json`);
    if (!response.ok) {
      throw new Error(`Failed to fetch JWKS for "${domain}": HTTP ${response.status}`);
    }
    const body = (await response.json()) as { keys: Jwk[] };

    const keys = new Map<string, string>();
    for (const jwk of body.keys) {
      if (!jwk.kid) continue;
      const pem = createPublicKey({ format: 'jwk', key: jwk }).export({
        type: 'spki',
        format: 'pem',
      });
      keys.set(jwk.kid, pem.toString());
    }
    return keys;
  }

  return async (kid: string) => {
    if (!cache || Date.now() - cache.fetchedAt > JWKS_CACHE_TTL_MS) {
      cache = { keys: await fetchKeys(), fetchedAt: Date.now() };
    }

    const key = cache.keys.get(kid) ?? (await refreshAndFind());
    return key;

    async function refreshAndFind(): Promise<string> {
      cache = { keys: await fetchKeys(), fetchedAt: Date.now() };
      const refreshed = cache.keys.get(kid);
      if (!refreshed) {
        throw new Error(`No signing key found for kid "${kid}"`);
      }
      return refreshed;
    }
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
