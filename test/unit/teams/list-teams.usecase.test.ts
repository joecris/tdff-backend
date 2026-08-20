import { describe, it, expect, beforeEach } from 'vitest';
import { randomUUID } from 'node:crypto';
import { ListTeamsUseCase } from '@modules/teams/application/use-cases/list-teams.usecase';
import { Team } from '@modules/teams/domain/entities/team.entity';
import { FakeTeamRepository } from './fake-team.repository';

describe('ListTeamsUseCase', () => {
  let repository: FakeTeamRepository;
  let useCase: ListTeamsUseCase;

  beforeEach(async () => {
    repository = new FakeTeamRepository();
    useCase = new ListTeamsUseCase(repository);

    for (let i = 0; i < 3; i++) {
      await repository.save(Team.create({ id: randomUUID(), name: `Team ${i}` }));
    }
  });

  it('returns a page of items with pagination metadata', async () => {
    const result = await useCase.execute({ page: 1, limit: 2 });

    expect(result.items).toHaveLength(2);
    expect(result.total).toBe(3);
    expect(result.totalPages).toBe(2);
  });

  it('returns an empty page with totalPages 0 for an empty collection', async () => {
    const empty = new FakeTeamRepository();
    const result = await new ListTeamsUseCase(empty).execute({ page: 1, limit: 50 });

    expect(result.items).toEqual([]);
    expect(result.totalPages).toBe(0);
  });
});
