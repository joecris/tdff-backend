import { describe, it, expect, beforeEach } from 'vitest';
import { randomUUID } from 'node:crypto';
import { BulkImportRidersUseCase } from '@modules/riders/application/use-cases/bulk-import-riders.usecase';
import { Rider } from '@modules/riders/domain/entities/rider.entity';
import { Team } from '@modules/teams/domain/entities/team.entity';
import { TeamService } from '@modules/teams/application/team.service';
import { FakeRiderRepository } from './fake-rider.repository';
import { FakeTeamRepository } from '../teams/fake-team.repository';
import { buildWorkbookBuffer } from '../shared/build-workbook';

describe('BulkImportRidersUseCase', () => {
  let riderRepository: FakeRiderRepository;
  let teamRepository: FakeTeamRepository;
  let teamService: TeamService;
  let useCase: BulkImportRidersUseCase;
  let uaeTeam: Team;

  beforeEach(async () => {
    riderRepository = new FakeRiderRepository();
    teamRepository = new FakeTeamRepository();
    teamService = new TeamService(teamRepository);
    useCase = new BulkImportRidersUseCase(riderRepository, teamService);

    uaeTeam = Team.create({ id: randomUUID(), name: 'UAE Team Emirates' });
    await teamRepository.save(uaeTeam);
  });

  it('creates new riders, resolving team names to ids', async () => {
    const buffer = await buildWorkbookBuffer(
      ['Name', 'Team Name'],
      [['Tadej Pogačar', 'UAE Team Emirates']],
    );

    const result = await useCase.execute(buffer);

    expect(result).toEqual({ created: 1, updated: 0, errors: [] });
    const rider = await riderRepository.findByName('Tadej Pogačar');
    expect(rider?.teamId).toBe(uaeTeam.id);
  });

  it('reconciles an existing rider by exact name match instead of duplicating it', async () => {
    const existing = Rider.create({ id: randomUUID(), name: 'Tadej Pogačar' });
    await riderRepository.save(existing);

    const buffer = await buildWorkbookBuffer(
      ['Name', 'Team Name'],
      [['Tadej Pogačar', 'UAE Team Emirates']],
    );

    const result = await useCase.execute(buffer);

    expect(result).toEqual({ created: 0, updated: 1, errors: [] });
    const updated = await riderRepository.findByName('Tadej Pogačar');
    expect(updated?.id).toBe(existing.id);
    expect(updated?.teamId).toBe(uaeTeam.id);
  });

  it('reports an unknown team name as a row error and does not create that rider', async () => {
    const buffer = await buildWorkbookBuffer(
      ['Name', 'Team Name'],
      [
        ['Tadej Pogačar', 'UAE Team Emirates'],
        ['Ghost Rider', 'Not A Real Team'],
      ],
    );

    const result = await useCase.execute(buffer);

    expect(result.created).toBe(1);
    expect(result.errors).toEqual([{ row: 3, message: 'Unknown team "Not A Real Team"' }]);
    expect(await riderRepository.findByName('Ghost Rider')).toBeNull();
  });
});
