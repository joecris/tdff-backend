import { describe, it, expect, beforeEach } from 'vitest';
import { CreateRiderUseCase } from '@modules/riders/application/use-cases/create-rider.usecase';
import { TeamService } from '@modules/teams/application/team.service';
import { TeamNotFoundError } from '@modules/teams/domain/errors/team.errors';
import { FakeRiderRepository } from './fake-rider.repository';
import { FakeTeamRepository } from '../teams/fake-team.repository';

describe('CreateRiderUseCase', () => {
  let riderRepository: FakeRiderRepository;
  // Real application-layer TeamService over a fake repository — only the
  // persistence boundary is faked, same as every other unit test here.
  let teamService: TeamService;
  let useCase: CreateRiderUseCase;

  beforeEach(() => {
    riderRepository = new FakeRiderRepository();
    teamService = new TeamService(new FakeTeamRepository());
    useCase = new CreateRiderUseCase(riderRepository, teamService);
  });

  it('creates a rider with no team (free agent)', async () => {
    const rider = await useCase.execute({
      name: '  Mark Cavendish  ',
      nationality: 'Great Britain',
    });

    expect(rider.name).toBe('Mark Cavendish');
    expect(rider.teamId).toBeUndefined();
  });

  it('creates a rider attached to an existing team', async () => {
    const team = await teamService.createTeam({ name: 'UAE Team Emirates' });

    const rider = await useCase.execute({ name: 'Tadej Pogačar', teamId: team.id });

    expect(rider.teamId).toBe(team.id);
    expect(await riderRepository.findById(rider.id)).not.toBeNull();
  });

  it('rejects a teamId that does not exist', async () => {
    await expect(
      useCase.execute({ name: 'Nobody', teamId: '00000000-0000-0000-0000-000000000000' }),
    ).rejects.toBeInstanceOf(TeamNotFoundError);
  });
});
