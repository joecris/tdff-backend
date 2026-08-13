import {
  CreateGrandTourInput,
  GrandTourServicePort,
} from '@modules/grand-tours/domain/ports/grand-tour-service.port';
import { GrandTour } from '@modules/grand-tours/domain/entities/grand-tour.entity';

const SAMPLE_GRAND_TOURS: CreateGrandTourInput[] = [
  {
    name: 'Classic European Grand Tour',
    description: 'A journey through the historic capitals of Europe.',
    startDate: new Date('2026-05-01'),
    endDate: new Date('2026-05-21'),
  },
  {
    name: 'Silk Road Explorer',
    description: "Follow the ancient trade routes from Istanbul to Xi'an.",
    startDate: new Date('2026-09-10'),
    endDate: new Date('2026-10-05'),
  },
  {
    // No description/dates — exercises the optional-field path end to end.
    name: 'Andes to Amazon',
  },
];

/**
 * Seeds sample grand tours through the same GrandTourService the HTTP
 * layer calls. Unlike users, `grand_tours` has no unique constraint (no
 * equivalent of email), so re-running this inserts duplicates rather than
 * skipping — acceptable for a dev seed script; truncate the table instead
 * of expecting idempotency here.
 */
export async function seedGrandTours(grandTourService: GrandTourServicePort): Promise<GrandTour[]> {
  const tours: GrandTour[] = [];
  for (const input of SAMPLE_GRAND_TOURS) {
    const tour = await grandTourService.createGrandTour(input);
    console.warn(`  ✓ created grand tour "${tour.name}"`);
    tours.push(tour);
  }
  return tours;
}
