import { describe, it, expect, beforeEach, afterAll } from 'vitest';
import { randomUUID } from 'node:crypto';
import { db, closeDb } from '@infrastructure/db/client';
import { clearDb } from '@infrastructure/db/seed/clear-db';
import { DrizzleUserRepository } from '@modules/user/adapters/outbound/persistence/drizzle-user.repository';
import { User } from '@modules/user/domain/entities/user.entity';

/**
 * Real Postgres, real Drizzle mapper/schema wiring — the thing the unit
 * tests' fake repository can't verify, since a fake never touches SQL at
 * all. Requires DATABASE_URL to point at a disposable test database; see
 * test/integration/README.md.
 */
describe('DrizzleUserRepository (integration)', () => {
  const repository = new DrizzleUserRepository(db);

  beforeEach(async () => {
    await clearDb();
  });

  afterAll(async () => {
    await closeDb();
  });

  it('round-trips a user through save() and findById()', async () => {
    const user = User.create({ id: randomUUID(), email: 'alice@example.com', name: 'Alice' });
    await repository.save(user);

    const found = await repository.findById(user.id);

    expect(found?.id).toBe(user.id);
    expect(found?.email).toBe('alice@example.com');
    expect(found?.name).toBe('Alice');
    expect(found?.role).toBe('user');
  });

  it('finds a user by email', async () => {
    const user = User.create({ id: randomUUID(), email: 'bob@example.com', name: 'Bob' });
    await repository.save(user);

    const found = await repository.findByEmail('bob@example.com');

    expect(found?.id).toBe(user.id);
  });

  it('returns null for an unknown id or email', async () => {
    expect(await repository.findById(randomUUID())).toBeNull();
    expect(await repository.findByEmail('nobody@example.com')).toBeNull();
  });

  it('resubmitting save() with the same id updates rather than duplicates', async () => {
    const user = User.create({ id: randomUUID(), email: 'carol@example.com', name: 'Carol' });
    await repository.save(user);

    user.rename('Carol Updated');
    await repository.save(user);

    const found = await repository.findById(user.id);
    expect(found?.name).toBe('Carol Updated');
  });

  it('the DB-level unique constraint on email fires as a backstop when the app-layer guard (CreateUserUseCase.findByEmail) is bypassed', async () => {
    const first = User.create({ id: randomUUID(), email: 'dup@example.com', name: 'First' });
    await repository.save(first);

    // A different id, same email — save()'s `ON CONFLICT (id)` clause is
    // scoped to the id column, so it does NOT absorb this; the row-level
    // unique index on email still rejects the insert.
    const second = User.create({ id: randomUUID(), email: 'dup@example.com', name: 'Second' });

    await expect(repository.save(second)).rejects.toThrow();
  });
});
