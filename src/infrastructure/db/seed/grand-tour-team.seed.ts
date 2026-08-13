import { GrandTourParticipationServicePort } from '@modules/grand-tours/domain/ports/grand-tour-participation-service.port';
import { GrandTour } from '@modules/grand-tours/domain/entities/grand-tour.entity';
import { Team } from '@modules/teams/domain/entities/team.entity';

/**
 * Puts every seeded team on the start list of the first seeded grand tour
 * — enough for grand-tour-rider.seed.ts and any manual testing of
 * Phase 3's entry-selection validation ("is this team actually racing?").
 */
export async function seedGrandTourTeams(
  participationService: GrandTourParticipationServicePort,
  grandTours: GrandTour[],
  teams: Team[],
): Promise<void> {
  const grandTour = grandTours[0];
  if (!grandTour) return;

  for (const team of teams) {
    await participationService.addTeam({ grandTourId: grandTour.id, teamId: team.id });
    console.warn(`  ✓ added team "${team.name}" to grand tour "${grandTour.name}"`);
  }
}
