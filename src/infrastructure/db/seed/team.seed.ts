import { CreateTeamInput, TeamServicePort } from '@modules/teams/domain/ports/team-service.port';
import { Team } from '@modules/teams/domain/entities/team.entity';

const SAMPLE_TEAMS: CreateTeamInput[] = [
  { name: 'UAE Team Emirates' },
  { name: 'Visma | Lease a Bike' },
  { name: 'Ineos Grenadiers' },
];

/**
 * No duplicate-name skip logic here, deliberately — unlike users (unique
 * email, enforced), `teams.name` has no uniqueness constraint (see
 * team.entity.ts), so there's no ConflictError to catch. Re-running this
 * inserts duplicates; run through `clearDb()` first if that's not wanted.
 */
export async function seedTeams(teamService: TeamServicePort): Promise<Team[]> {
  const teams: Team[] = [];
  for (const input of SAMPLE_TEAMS) {
    const team = await teamService.createTeam(input);
    console.warn(`  ✓ created team "${team.name}"`);
    teams.push(team);
  }
  return teams;
}
