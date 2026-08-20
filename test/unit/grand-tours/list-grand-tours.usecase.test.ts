import { describe, it, expect, beforeEach } from 'vitest';
import { randomUUID } from 'node:crypto';
import { ListGrandToursUseCase } from '@modules/grand-tours/application/use-cases/list-grand-tours.usecase';
import { GrandTour } from '@modules/grand-tours/domain/entities/grand-tour.entity';
import { FakeGrandTourRepository } from './fake-grand-tour.repository';

describe('ListGrandToursUseCase', () => {
  let repository: FakeGrandTourRepository;
  let useCase: ListGrandToursUseCase;

  beforeEach(async () => {
    repository = new FakeGrandTourRepository();
    useCase = new ListGrandToursUseCase(repository);

    for (let i = 0; i < 3; i++) {
      await repository.save(GrandTour.create({ id: randomUUID(), name: `Grand Tour ${i}` }));
    }
  });

  it('returns a page of items with pagination metadata', async () => {
    const result = await useCase.execute({ page: 1, limit: 2 });

    expect(result.items).toHaveLength(2);
    expect(result.total).toBe(3);
    expect(result.totalPages).toBe(2);
  });

  it('returns an empty page with totalPages 0 for an empty collection', async () => {
    const empty = new FakeGrandTourRepository();
    const result = await new ListGrandToursUseCase(empty).execute({ page: 1, limit: 50 });

    expect(result.items).toEqual([]);
    expect(result.totalPages).toBe(0);
  });
});
