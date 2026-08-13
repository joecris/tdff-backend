import { describe, it, expect, beforeEach } from 'vitest';
import { DevAuthVerifier } from '@infrastructure/auth/dev-auth-verifier';
import { UnauthorizedError } from '@shared/errors/app-error';
import { User } from '@modules/user/domain/entities/user.entity';
import { FakeUserRepository } from '../user/fake-user.repository';

describe('DevAuthVerifier', () => {
  let userRepository: FakeUserRepository;
  let verifier: DevAuthVerifier;

  beforeEach(() => {
    userRepository = new FakeUserRepository();
    verifier = new DevAuthVerifier(userRepository);
  });

  it('falls back to a synthetic admin principal when no x-user-id header is present', async () => {
    const principal = await verifier.verify({});

    expect(principal).toEqual({ userId: 'dev-admin', role: 'admin' });
  });

  it("resolves the real user's role when x-user-id matches a seeded user", async () => {
    const user = User.create({ id: crypto.randomUUID(), email: 'bob@example.com', name: 'Bob' });
    await userRepository.save(user);

    const principal = await verifier.verify({ 'x-user-id': user.id });

    expect(principal).toEqual({ userId: user.id, role: 'user' });
  });

  it('resolves an admin role for a seeded admin user', async () => {
    const admin = User.create({
      id: crypto.randomUUID(),
      email: 'alice@example.com',
      name: 'Alice',
      role: 'admin',
    });
    await userRepository.save(admin);

    const principal = await verifier.verify({ 'x-user-id': admin.id });

    expect(principal.role).toBe('admin');
  });

  it('throws UnauthorizedError when x-user-id does not match any user', async () => {
    await expect(
      verifier.verify({ 'x-user-id': '00000000-0000-0000-0000-000000000000' }),
    ).rejects.toBeInstanceOf(UnauthorizedError);
  });

  it('uses the first value when x-user-id is sent as multiple headers', async () => {
    const user = User.create({
      id: crypto.randomUUID(),
      email: 'carol@example.com',
      name: 'Carol',
    });
    await userRepository.save(user);

    const principal = await verifier.verify({ 'x-user-id': [user.id, 'ignored-second-value'] });

    expect(principal.userId).toBe(user.id);
  });
});
