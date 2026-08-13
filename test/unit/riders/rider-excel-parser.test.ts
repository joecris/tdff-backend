import { describe, it, expect, beforeEach } from 'vitest';
import { parseRidersExcel } from '@modules/riders/application/rider-excel-parser';
import { TeamService } from '@modules/teams/application/team.service';
import { Team } from '@modules/teams/domain/entities/team.entity';
import { FakeTeamRepository } from '../teams/fake-team.repository';
import { buildWorkbookBuffer } from '../shared/build-workbook';
import { randomUUID } from 'node:crypto';

describe('parseRidersExcel', () => {
  let teamRepository: FakeTeamRepository;
  let teamService: TeamService;
  let uaeTeam: Team;

  beforeEach(async () => {
    teamRepository = new FakeTeamRepository();
    teamService = new TeamService(teamRepository);
    uaeTeam = Team.create({ id: randomUUID(), name: 'UAE Team Emirates' });
    await teamRepository.save(uaeTeam);
  });

  it('resolves a "Team Name" column to the matching team id', async () => {
    const buffer = await buildWorkbookBuffer(
      ['Name', 'Nationality', 'Image URL', 'Type', 'Team Name'],
      [['Tadej Pogačar', 'Slovenia', undefined, 'climber', 'UAE Team Emirates']],
    );

    const result = await parseRidersExcel(buffer, teamService);

    expect(result.errors).toEqual([]);
    expect(result.valid).toEqual([
      {
        row: 2,
        data: {
          name: 'Tadej Pogačar',
          nationality: 'Slovenia',
          type: 'climber',
          teamId: uaeTeam.id,
        },
      },
    ]);
  });

  it('leaves a rider a free agent when no "Team Name" is given — not an error', async () => {
    const buffer = await buildWorkbookBuffer(['Name', 'Team Name'], [['Solo Rider', undefined]]);

    const result = await parseRidersExcel(buffer, teamService);

    expect(result.errors).toEqual([]);
    expect(result.valid).toEqual([{ row: 2, data: { name: 'Solo Rider' } }]);
  });

  it('reports an unresolvable team name as a row error and excludes the row from valid', async () => {
    const buffer = await buildWorkbookBuffer(
      ['Name', 'Team Name'],
      [
        ['Tadej Pogačar', 'UAE Team Emirates'],
        ['Ghost Rider', 'Not A Real Team'],
      ],
    );

    const result = await parseRidersExcel(buffer, teamService);

    expect(result.valid).toEqual([{ row: 2, data: { name: 'Tadej Pogačar', teamId: uaeTeam.id } }]);
    expect(result.errors).toEqual([{ row: 3, message: 'Unknown team "Not A Real Team"' }]);
  });

  it('combines parse-stage errors with resolution-stage errors', async () => {
    const buffer = await buildWorkbookBuffer(
      ['Name', 'Team Name'],
      [[undefined, 'Not A Real Team']],
    );

    const result = await parseRidersExcel(buffer, teamService);

    // Row fails schema validation (no name) before team resolution even
    // runs — the row error comes from the parse stage, not resolution.
    expect(result.valid).toEqual([]);
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0]?.row).toBe(2);
  });
});
