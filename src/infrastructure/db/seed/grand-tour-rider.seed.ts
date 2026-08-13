import { GrandTourParticipationServicePort } from '@modules/grand-tours/domain/ports/grand-tour-participation-service.port';
import { GrandTour } from '@modules/grand-tours/domain/entities/grand-tour.entity';
import { Rider } from '@modules/riders/domain/entities/rider.entity';

/** Same idea as grand-tour-team.seed.ts, for riders. */
export async function seedGrandTourRiders(
  participationService: GrandTourParticipationServicePort,
  grandTours: GrandTour[],
  riders: Rider[],
): Promise<void> {
  const grandTour = grandTours[0];
  if (!grandTour) return;

  for (const rider of riders) {
    await participationService.addRider({ grandTourId: grandTour.id, riderId: rider.id });
    console.warn(`  ✓ added rider "${rider.name}" to grand tour "${grandTour.name}"`);
  }
}
