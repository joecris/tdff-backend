import { FantasyLeagueServicePort } from '@modules/fantasy-leagues/domain/ports/fantasy-league-service.port';
import { FantasyLeague } from '@modules/fantasy-leagues/domain/entities/fantasy-league.entity';
import { GrandTour } from '@modules/grand-tours/domain/entities/grand-tour.entity';

export async function seedFantasyLeagues(
  fantasyLeagueService: FantasyLeagueServicePort,
  grandTours: GrandTour[],
): Promise<FantasyLeague[]> {
  const grandTour = grandTours[0];
  if (!grandTour) return [];

  const league = await fantasyLeagueService.createFantasyLeague({
    name: `${grandTour.name} Fantasy League`,
    description: 'Sample league seeded for local development.',
    grandTourId: grandTour.id,
  });
  console.warn(`  ✓ created fantasy league "${league.name}"`);

  return [league];
}
