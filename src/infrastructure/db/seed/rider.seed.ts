import { RiderServicePort } from '@modules/riders/domain/ports/rider-service.port';
import { Rider } from '@modules/riders/domain/entities/rider.entity';
import { Team } from '@modules/teams/domain/entities/team.entity';

/**
 * Takes the teams `seedTeams` just created (rather than looking them up by
 * name) so this seeder never has to guess whether a given team name exists
 * — the caller (seed/index.ts) controls ordering, same as `riders` depends
 * on `teams` at the DI-container level.
 */
export async function seedRiders(riderService: RiderServicePort, teams: Team[]): Promise<Rider[]> {
  const [uae, visma] = teams;

  const sampleRiders = [
    { name: 'Tadej Pogačar', nationality: 'Slovenia', type: 'climber', teamId: uae?.id },
    { name: 'Jonas Vingegaard', nationality: 'Denmark', type: 'climber', teamId: visma?.id },
    // Free agent — exercises the optional teamId path.
    { name: 'Mark Cavendish', nationality: 'Great Britain', type: 'sprinter' },
  ];

  const riders: Rider[] = [];
  for (const input of sampleRiders) {
    const rider = await riderService.createRider({
      name: input.name,
      nationality: input.nationality,
      type: input.type,
      ...(input.teamId !== undefined ? { teamId: input.teamId } : {}),
    });
    console.warn(`  ✓ created rider "${rider.name}"`);
    riders.push(rider);
  }
  return riders;
}
