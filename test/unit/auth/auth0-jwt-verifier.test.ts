import { describe, it, expect, beforeAll } from 'vitest';
import { generateKeyPairSync, randomUUID } from 'node:crypto';
import jwt from 'jsonwebtoken';
import { Auth0JwtVerifier, SigningKeyResolver } from '@infrastructure/auth/auth0-jwt-verifier';
import { UnauthorizedError } from '@shared/errors/app-error';
import { User } from '@modules/user/domain/entities/user.entity';
import { FakeUserRepository } from '../user/fake-user.repository';

const DOMAIN = 'test-tenant.auth0.local';
const AUDIENCE = 'https://test-api';
const KEY_ID = 'test-key-1';

/**
 * Real RS256 keypairs signed/verified with the actual `jsonwebtoken`
 * library — no mocking of the crypto itself, only the network call
 * `jwks-rsa` would otherwise make. This is what makes the injectable
 * `SigningKeyResolver` (rather than constructing a `JwksClient` inline)
 * worth having: these tests never touch Auth0's real JWKS endpoint.
 */
let privateKeyPem: string;
let publicKeyPem: string;
let otherPrivateKeyPem: string; // a different keypair, for the wrong-signature test

beforeAll(() => {
  const pair = generateKeyPairSync('rsa', {
    modulusLength: 2048,
    publicKeyEncoding: { type: 'spki', format: 'pem' },
    privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
  });
  privateKeyPem = pair.privateKey;
  publicKeyPem = pair.publicKey;

  const otherPair = generateKeyPairSync('rsa', {
    modulusLength: 2048,
    publicKeyEncoding: { type: 'spki', format: 'pem' },
    privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
  });
  otherPrivateKeyPem = otherPair.privateKey;
});

function signToken(
  overrides: {
    subject?: string;
    audience?: string;
    issuer?: string;
    expiresIn?: number;
    signWith?: string;
    kid?: string | undefined;
  } = {},
): string {
  return jwt.sign({}, overrides.signWith ?? privateKeyPem, {
    algorithm: 'RS256',
    subject: overrides.subject ?? 'auth0|abc123',
    audience: overrides.audience ?? AUDIENCE,
    issuer: overrides.issuer ?? `https://${DOMAIN}/`,
    expiresIn: overrides.expiresIn ?? 3600,
    keyid: overrides.kid === undefined ? KEY_ID : overrides.kid,
  });
}

function buildVerifier(userRepository: FakeUserRepository) {
  const resolver: SigningKeyResolver = async () => publicKeyPem;
  return new Auth0JwtVerifier(userRepository, DOMAIN, AUDIENCE, resolver);
}

describe('Auth0JwtVerifier', () => {
  it('resolves null when no authorization header is present — "no credential offered," not an error', async () => {
    const verifier = buildVerifier(new FakeUserRepository());
    expect(await verifier.verify({})).toBeNull();
  });

  it('throws UnauthorizedError for a non-Bearer authorization header', async () => {
    const verifier = buildVerifier(new FakeUserRepository());
    await expect(verifier.verify({ authorization: 'Basic dXNlcjpwYXNz' })).rejects.toBeInstanceOf(
      UnauthorizedError,
    );
  });

  it('throws UnauthorizedError for a malformed token', async () => {
    const verifier = buildVerifier(new FakeUserRepository());
    await expect(
      verifier.verify({ authorization: 'Bearer not-a-real-jwt' }),
    ).rejects.toBeInstanceOf(UnauthorizedError);
  });

  it('throws UnauthorizedError for an expired token', async () => {
    const verifier = buildVerifier(new FakeUserRepository());
    const token = signToken({ expiresIn: -10 });
    await expect(verifier.verify({ authorization: `Bearer ${token}` })).rejects.toBeInstanceOf(
      UnauthorizedError,
    );
  });

  it('throws UnauthorizedError for the wrong audience', async () => {
    const verifier = buildVerifier(new FakeUserRepository());
    const token = signToken({ audience: 'https://someone-elses-api' });
    await expect(verifier.verify({ authorization: `Bearer ${token}` })).rejects.toBeInstanceOf(
      UnauthorizedError,
    );
  });

  it('throws UnauthorizedError for the wrong issuer', async () => {
    const verifier = buildVerifier(new FakeUserRepository());
    const token = signToken({ issuer: 'https://a-different-tenant.auth0.local/' });
    await expect(verifier.verify({ authorization: `Bearer ${token}` })).rejects.toBeInstanceOf(
      UnauthorizedError,
    );
  });

  it('throws UnauthorizedError for a token signed with the wrong private key', async () => {
    const verifier = buildVerifier(new FakeUserRepository());
    const token = signToken({ signWith: otherPrivateKeyPem });
    await expect(verifier.verify({ authorization: `Bearer ${token}` })).rejects.toBeInstanceOf(
      UnauthorizedError,
    );
  });

  it('resolves the existing local user for a valid token whose sub is already linked', async () => {
    const userRepository = new FakeUserRepository();
    const existing = User.create({
      id: randomUUID(),
      email: 'rider@example.com',
      name: 'Rider',
      role: 'admin',
      auth0Sub: 'auth0|abc123',
    });
    await userRepository.save(existing);

    const verifier = buildVerifier(userRepository);
    const token = signToken({ subject: 'auth0|abc123' });

    const principal = await verifier.verify({ authorization: `Bearer ${token}` });

    expect(principal).toEqual({ userId: existing.id, role: 'admin' });
  });

  it('JIT-provisions a new local user (role: user) for a valid token with an unknown sub', async () => {
    const userRepository = new FakeUserRepository();
    const verifier = buildVerifier(userRepository);
    const token = signToken({ subject: 'auth0|brand-new-user' });

    const principal = await verifier.verify({ authorization: `Bearer ${token}` });

    expect(principal?.role).toBe('user');
    const provisioned = await userRepository.findByAuth0Sub('auth0|brand-new-user');
    expect(provisioned?.id).toBe(principal?.userId);
    expect(provisioned?.email).toContain('auth0-brand-new-user');
  });

  it('recovers from a JIT-provisioning race by re-looking-up rather than crashing', async () => {
    const raceWinner = User.create({
      id: randomUUID(),
      email: 'winner@example.com',
      name: 'Race Winner',
      auth0Sub: 'auth0|racey',
    });

    // Simulates a concurrent request winning the insert first: this
    // repository's save() always fails (as a real unique-constraint
    // violation would), but by the time it fails, `raceWinner` is already
    // present — exactly what a losing request would see if it re-queried.
    class RaceSimulatingUserRepository extends FakeUserRepository {
      override async save(): Promise<void> {
        await super.save(raceWinner);
        throw new Error('simulated unique_violation on auth0_sub');
      }
    }

    const verifier = buildVerifier(new RaceSimulatingUserRepository());
    const token = signToken({ subject: 'auth0|racey' });

    const principal = await verifier.verify({ authorization: `Bearer ${token}` });

    expect(principal).toEqual({ userId: raceWinner.id, role: 'user' });
  });

  it('rethrows when a save failure is NOT actually a resolvable race (no winner appears)', async () => {
    class AlwaysFailingUserRepository extends FakeUserRepository {
      override async save(): Promise<void> {
        throw new Error('a real, unrecoverable save failure');
      }
    }

    const verifier = buildVerifier(new AlwaysFailingUserRepository());
    const token = signToken({ subject: 'auth0|doomed' });

    await expect(verifier.verify({ authorization: `Bearer ${token}` })).rejects.toThrow(
      'a real, unrecoverable save failure',
    );
  });
});
