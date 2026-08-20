import { describe, it, expect, beforeEach } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { parseTeamsExcel } from '@modules/teams/application/team-excel-parser';
import { parseRidersExcel } from '@modules/riders/application/rider-excel-parser';
import { TeamService } from '@modules/teams/application/team.service';
import { FakeTeamRepository } from '../teams/fake-team.repository';

/**
 * The committed `samples/*.xlsx` files (see `generate-import-templates.ts`)
 * are meant to be a genuinely working starting point for an admin doing
 * their first bulk import — this proves that by running them through the
 * real parsers, not just eyeballing the generator's output. Regenerate via
 * `npm run templates:generate` if `TEAM_COLUMNS`/`RIDER_COLUMNS` ever change.
 */
const SAMPLES_DIR = join(__dirname, '..', '..', '..', 'samples');

describe('bulk-import sample templates', () => {
  it('teams-import-template.xlsx parses with zero errors', async () => {
    const buffer = readFileSync(join(SAMPLES_DIR, 'teams-import-template.xlsx'));

    const result = await parseTeamsExcel(buffer);

    expect(result.errors).toEqual([]);
    expect(result.valid).toHaveLength(3);
    expect(result.valid.map((r) => r.data.name)).toEqual([
      'UAE Team Emirates',
      'Visma | Lease a Bike',
      'Ineos Grenadiers',
    ]);
    // Logo URL is deliberately blank on the third row — proves the
    // optional column really is optional, not silently required.
    expect(result.valid[2]?.data.logoUrl).toBeUndefined();
  });

  describe('riders-import-template.xlsx', () => {
    let teamRepository: FakeTeamRepository;
    let teamService: TeamService;

    beforeEach(async () => {
      teamRepository = new FakeTeamRepository();
      teamService = new TeamService(teamRepository);
      // Names must match the template's Team Name column exactly — same
      // reconciliation-by-exact-name-match the real bulk-import flow uses.
      await teamService.createTeam({ name: 'UAE Team Emirates' });
      await teamService.createTeam({ name: 'Visma | Lease a Bike' });
    });

    it('parses with zero errors and resolves team names', async () => {
      const buffer = readFileSync(join(SAMPLES_DIR, 'riders-import-template.xlsx'));

      const result = await parseRidersExcel(buffer, teamService);

      expect(result.errors).toEqual([]);
      expect(result.valid).toHaveLength(3);
      expect(result.valid.map((r) => r.data.name)).toEqual([
        'Tadej Pogačar',
        'Jonas Vingegaard',
        'Mark Cavendish',
      ]);
      expect(result.valid[0]?.data.teamId).toBeDefined();
      // Team Name is deliberately blank on the third row — a free agent
      // is a normal row, not an error.
      expect(result.valid[2]?.data.teamId).toBeUndefined();
    });
  });
});
