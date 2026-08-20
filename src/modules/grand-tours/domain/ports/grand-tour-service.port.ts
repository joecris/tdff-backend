import { GrandTour } from '../entities/grand-tour.entity';
import { PaginatedResult, PaginationParams } from '@shared/domain/pagination';

/**
 * Owned here (domain layer, alongside the port) rather than in the use case
 * that consumes it — the use case and the service both implement/call
 * against this same port, so the port is the one place the shape should be
 * declared. Import this type instead of restating the shape at each call
 * site; that restating is exactly what let `createTour`/`createGrandTour`
 * silently drift out of sync earlier.
 */
export interface CreateGrandTourInput {
  name: string;
  description?: string;
  startDate?: Date;
  endDate?: Date;
}

/**
 * Inbound port. The HTTP controller depends on this interface only;
 * `application/grand-tour.service.ts` implements it. A future inbound
 * adapter (CLI, gRPC, queue consumer) would depend on the same port.
 */
export interface GrandTourServicePort {
  createGrandTour(input: CreateGrandTourInput): Promise<GrandTour>;
  getGrandTourById(id: string): Promise<GrandTour>;
  listGrandTours(params: PaginationParams): Promise<PaginatedResult<GrandTour>>;
}
