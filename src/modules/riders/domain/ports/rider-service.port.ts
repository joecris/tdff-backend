import { Rider } from '../entities/rider.entity';
import { BulkImportResult } from '@shared/excel/bulk-import-result';

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
  bulkImportRiders(fileBuffer: Buffer): Promise<BulkImportResult>;
}
