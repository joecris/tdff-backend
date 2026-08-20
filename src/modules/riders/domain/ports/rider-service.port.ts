import { Rider } from '../entities/rider.entity';
import { BulkImportResult } from '@shared/excel/bulk-import-result';
import { PaginatedResult, PaginationParams } from '@shared/domain/pagination';

export interface CreateRiderInput {
  name: string;
  nationality?: string;
  imageUrl?: string;
  type?: string;
  teamId?: string;
}

/**
 * Inbound port. The HTTP controller depends on this interface only;
 * `application/rider.service.ts` implements it.
 */
export interface RiderServicePort {
  createRider(input: CreateRiderInput): Promise<Rider>;
  getRiderById(id: string): Promise<Rider>;
  listRiders(params: PaginationParams): Promise<PaginatedResult<Rider>>;
  bulkImportRiders(fileBuffer: Buffer): Promise<BulkImportResult>;
}
