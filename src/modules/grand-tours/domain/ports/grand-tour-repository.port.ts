import { GrandTour } from '../entities/grand-tour.entity';
import { PaginationParams } from '@shared/domain/pagination';

/**
 * Outbound port. The application layer depends on this interface only;
 * `adapters/outbound/persistence/drizzle-grand-tour.repository.ts` implements
 * it. Swapping Drizzle for something else later means writing a new adapter,
 * not touching domain/application code.
 */
export interface GrandTourRepositoryPort {
  findById(id: string): Promise<GrandTour | null>;
  findMany(params: PaginationParams): Promise<{ items: GrandTour[]; total: number }>;
  save(grandTour: GrandTour): Promise<void>;
}
