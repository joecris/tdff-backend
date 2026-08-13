import { describe, it, expect, beforeEach } from 'vitest';
import { CreateRiderUseCase } from '@modules/riders/application/use-cases/create-rider.usecase';
import { GetRiderUseCase } from '@modules/riders/application/use-cases/get-rider.usecase';
import { RiderNotFoundError } from '@modules/riders/domain/errors/rider.errors';
import { TeamService } from '@modules/teams/application/team.service';
import { FakeRiderRepository } from './fake-rider.repository';
import { FakeTeamRepository } from '../teams/fake-team.repository';

describe('GetRiderUseCase', () => {
  let riderRepository: FakeRiderRepository;
  let createUseCase: CreateRiderUseCase;
  let getUseCase: GetRiderUseCase;

  beforeEach(() => {
    riderRepository = new FakeRiderRepository();
    const teamService = new TeamService(new FakeTeamRepository());
    createUseCase = new CreateRiderUseCase(riderRepository, teamService);
    getUseCase = new GetRiderUseCase(riderRepository);
  });

  it('returns an existing rider by id', async () => {
    const created = await createUseCase.execute({ name: 'Jonas Vingegaard' });

    const found = await getUseCase.execute(created.id);

    expect(found.id).toBe(created.id);
  });

  it('throws RiderNotFoundError for an unknown id', async () => {
    await expect(getUseCase.execute('00000000-0000-0000-0000-000000000000')).rejects.toBeInstanceOf(
      RiderNotFoundError,
    );
  });
});
