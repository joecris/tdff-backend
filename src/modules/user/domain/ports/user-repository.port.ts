import { User } from '../entities/user.entity';

/**
 * Outbound port. The application layer depends on this interface only;
 * `adapters/outbound/persistence/drizzle-user.repository.ts` implements it.
 * Swapping Drizzle for something else later means writing a new adapter,
 * not touching domain/application code.
 */
export interface UserRepositoryPort {
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  save(user: User): Promise<void>;
}

export const USER_REPOSITORY = Symbol('UserRepositoryPort');
