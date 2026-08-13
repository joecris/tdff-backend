import { describe, it, expect, beforeEach } from 'vitest';
import { CreateTeamUseCase } from '@modules/teams/application/use-cases/create-team.usecase';
import { GetTeamUseCase } from '@modules/teams/application/use-cases/get-team.usecase';
import { TeamNotFoundError } from '@modules/teams/domain/errors/team.errors';
import { FakeTeamRepository } from './fake-team.repository';

describe('GetTeamUseCase', () => {
  let repository: FakeTeamRepository;
  let createUseCase: CreateTeamUseCase;
  let getUseCase: GetTeamUseCase;

  beforeEach(() => {
    repository = new FakeTeamRepository();
    createUseCase = new CreateTeamUseCase(repository);
    getUseCase = new GetTeamUseCase(repository);
  });

  it('returns an existing team by id', async () => {
    const created = await createUseCase.execute({ name: 'Visma | Lease a Bike' });

    const found = await getUseCase.execute(created.id);

    expect(found.id).toBe(created.id);
    expect(found.name).toBe('Visma | Lease a Bike');
  });

  it('throws TeamNotFoundError for an unknown id', async () => {
    await expect(getUseCase.execute('00000000-0000-0000-0000-000000000000')).rejects.toBeInstanceOf(
      TeamNotFoundError,
    );
  });
});
