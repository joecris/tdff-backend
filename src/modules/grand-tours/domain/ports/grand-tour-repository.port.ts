import { GrandTour } from '../entities/grand-tour.entity';

/**
 * Outbound port. The application layer depends on this interface only;
 * `adapters/outbound/persistence/drizzle-grand-tour.repository.ts` implements
 * it. Swapping Drizzle for something else later means writing a new adapter,
 * not touching domain/application code.
 */
export interface GrandTourRepositoryPort {
  findById(id: string): Promise<GrandTour | null>;
  save(grandTour: GrandTour): Promise<void>;
}
