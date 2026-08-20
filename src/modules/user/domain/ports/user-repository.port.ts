import { User } from '../entities/user.entity';
import { PaginationParams } from '@shared/domain/pagination';

/**
 * Outbound port. The application layer depends on this interface only;
 * `adapters/outbound/persistence/drizzle-user.repository.ts` implements it.
 * Swapping Drizzle for something else later means writing a new adapter,
 * not touching domain/application code.
 */
export interface UserRepositoryPort {
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  /** Exists for Auth0 JIT-provisioning (Phase 7.1) — looks up the local
   * user linked to a verified JWT's `sub` claim. */
  findByAuth0Sub(auth0Sub: string): Promise<User | null>;
  /** `total` is the full collection count, not `items.length` — the use
   * case layer needs it to compute `totalPages`. Ordered `createdAt` desc
   * (newest first) so pages stay stable as new rows are inserted between
   * requests, same reasoning every module's `findMany` below shares. */
  findMany(params: PaginationParams): Promise<{ items: User[]; total: number }>;
  save(user: User): Promise<void>;
}

export const USER_REPOSITORY = Symbol('UserRepositoryPort');
