import { Rider } from '../entities/rider.entity';
import { PaginationParams } from '@shared/domain/pagination';

export interface RiderRepositoryPort {
  findById(id: string): Promise<Rider | null>;
  /** Exists for Phase 5's bulk-import reconciliation — matching a
   * spreadsheet row's rider name against an existing rider so re-running
   * the same import updates rather than duplicates. Same rationale as
   * `TeamRepositoryPort.findByName`. */
  findByName(name: string): Promise<Rider | null>;
  findMany(params: PaginationParams): Promise<{ items: Rider[]; total: number }>;
  save(rider: Rider): Promise<void>;
}
