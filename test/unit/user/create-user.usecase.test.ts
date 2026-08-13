import { describe, it, expect, beforeEach } from 'vitest';
import { CreateUserUseCase } from '@modules/user/application/use-cases/create-user.usecase';
import { EmailAlreadyInUseError } from '@modules/user/domain/errors/user.errors';
import { FakeUserRepository } from './fake-user.repository';

describe('CreateUserUseCase', () => {
  let repository: FakeUserRepository;
  let useCase: CreateUserUseCase;

  beforeEach(() => {
    repository = new FakeUserRepository();
    useCase = new CreateUserUseCase(repository);
  });

  it('creates a user with a normalized email', async () => {
    const user = await useCase.execute({ email: '  Jane@Example.com ', name: '  Jane Doe ' });

    expect(user.email).toBe('jane@example.com');
    expect(user.name).toBe('Jane Doe');
    expect(await repository.findById(user.id)).not.toBeNull();
  });

  it('defaults role to "user" when not specified', async () => {
    const user = await useCase.execute({ email: 'jane@example.com', name: 'Jane Doe' });

    expect(user.role).toBe('user');
    expect(user.isAdmin).toBe(false);
  });

  it('creates an admin user when role is explicitly "admin"', async () => {
    // Not reachable via the public create-user HTTP DTO (see
    // user-service.port.ts) — only trusted callers (seed script, future
    // Auth0 JIT-provisioning) pass role directly.
    const user = await useCase.execute({
      email: 'admin@example.com',
      name: 'Admin User',
      role: 'admin',
    });

    expect(user.role).toBe('admin');
    expect(user.isAdmin).toBe(true);
  });

  it('rejects a duplicate email', async () => {
    await useCase.execute({ email: 'jane@example.com', name: 'Jane Doe' });

    await expect(
      useCase.execute({ email: 'jane@example.com', name: 'Someone Else' }),
    ).rejects.toBeInstanceOf(EmailAlreadyInUseError);
  });
});
