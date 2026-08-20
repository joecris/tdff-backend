import { describe, it, expect, beforeEach } from 'vitest';
import { randomUUID } from 'node:crypto';
import { ListRidersUseCase } from '@modules/riders/application/use-cases/list-riders.usecase';
import { Rider } from '@modules/riders/domain/entities/rider.entity';
import { FakeRiderRepository } from './fake-rider.repository';

describe('ListRidersUseCase', () => {
  let repository: FakeRiderRepository;
  let useCase: ListRidersUseCase;

  beforeEach(async () => {
    repository = new FakeRiderRepository();
    useCase = new ListRidersUseCase(repository);

    for (let i = 0; i < 3; i++) {
      await repository.save(Rider.create({ id: randomUUID(), name: `Rider ${i}` }));
    }
  });

  it('returns a page of items with pagination metadata', async () => {
    const result = await useCase.execute({ page: 1, limit: 2 });

    expect(result.items).toHaveLength(2);
    expect(result.total).toBe(3);
    expect(result.totalPages).toBe(2);
  });

  it('returns an empty page with totalPages 0 for an empty collection', async () => {
    const empty = new FakeRiderRepository();
    const result = await new ListRidersUseCase(empty).execute({ page: 1, limit: 50 });

    expect(result.items).toEqual([]);
    expect(result.totalPages).toBe(0);
  });
});
