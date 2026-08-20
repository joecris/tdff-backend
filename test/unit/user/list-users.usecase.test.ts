import { describe, it, expect, beforeEach } from 'vitest';
import { randomUUID } from 'node:crypto';
import { ListUsersUseCase } from '@modules/user/application/use-cases/list-users.usecase';
import { User } from '@modules/user/domain/entities/user.entity';
import { FakeUserRepository } from './fake-user.repository';

describe('ListUsersUseCase', () => {
  let repository: FakeUserRepository;
  let useCase: ListUsersUseCase;

  beforeEach(async () => {
    repository = new FakeUserRepository();
    useCase = new ListUsersUseCase(repository);

    for (let i = 0; i < 5; i++) {
      await repository.save(
        User.create({ id: randomUUID(), email: `user${i}@example.com`, name: `User ${i}` }),
      );
    }
  });

  it('returns a page of items with pagination metadata', async () => {
    const result = await useCase.execute({ page: 1, limit: 2 });

    expect(result.items).toHaveLength(2);
    expect(result.total).toBe(5);
    expect(result.page).toBe(1);
    expect(result.limit).toBe(2);
    expect(result.totalPages).toBe(3);
  });

  it('returns the correct slice for a later page', async () => {
    const page1 = await useCase.execute({ page: 1, limit: 2 });
    const page2 = await useCase.execute({ page: 2, limit: 2 });
    const page3 = await useCase.execute({ page: 3, limit: 2 });

    const allIds = [...page1.items, ...page2.items, ...page3.items].map((u) => u.id);
    expect(new Set(allIds).size).toBe(5); // no overlap, no gaps
    expect(page3.items).toHaveLength(1); // last page is a partial page
  });

  it('returns an empty page with totalPages 0 for an empty collection', async () => {
    const empty = new FakeUserRepository();
    const result = await new ListUsersUseCase(empty).execute({ page: 1, limit: 50 });

    expect(result.items).toEqual([]);
    expect(result.total).toBe(0);
    expect(result.totalPages).toBe(0);
  });

  it('returns an empty page past the last page rather than erroring', async () => {
    const result = await useCase.execute({ page: 99, limit: 2 });

    expect(result.items).toEqual([]);
    expect(result.total).toBe(5);
  });
});
