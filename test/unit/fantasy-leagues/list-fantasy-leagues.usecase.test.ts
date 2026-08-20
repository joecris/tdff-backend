import { describe, it, expect, beforeEach } from 'vitest';
import { randomUUID } from 'node:crypto';
import { ListFantasyLeaguesUseCase } from '@modules/fantasy-leagues/application/use-cases/list-fantasy-leagues.usecase';
import { FantasyLeague } from '@modules/fantasy-leagues/domain/entities/fantasy-league.entity';
import { FakeFantasyLeagueRepository } from './fake-fantasy-league.repository';

describe('ListFantasyLeaguesUseCase', () => {
  let repository: FakeFantasyLeagueRepository;
  let useCase: ListFantasyLeaguesUseCase;

  beforeEach(async () => {
    repository = new FakeFantasyLeagueRepository();
    useCase = new ListFantasyLeaguesUseCase(repository);

    for (let i = 0; i < 3; i++) {
      await repository.save(
        FantasyLeague.create({ id: randomUUID(), name: `League ${i}`, grandTourId: randomUUID() }),
      );
    }
  });

  it('returns a page of items with pagination metadata', async () => {
    const result = await useCase.execute({ page: 1, limit: 2 });

    expect(result.items).toHaveLength(2);
    expect(result.total).toBe(3);
    expect(result.totalPages).toBe(2);
  });

  it('returns an empty page with totalPages 0 for an empty collection', async () => {
    const empty = new FakeFantasyLeagueRepository();
    const result = await new ListFantasyLeaguesUseCase(empty).execute({ page: 1, limit: 50 });

    expect(result.items).toEqual([]);
    expect(result.totalPages).toBe(0);
  });
});
