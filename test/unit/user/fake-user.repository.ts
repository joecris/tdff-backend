import { User } from '@modules/user/domain/entities/user.entity';
import { UserRepositoryPort } from '@modules/user/domain/ports/user-repository.port';
import { PaginationParams } from '@shared/domain/pagination';
import { paginateFake } from '../shared/paginate-fake';

/**
 * In-memory fake implementing the same port the Drizzle adapter implements.
 * This is the payoff of hexagonal architecture: use cases are testable
 * without spinning up Postgres.
 */
export class FakeUserRepository implements UserRepositoryPort {
  private readonly usersById = new Map<string, User>();

  async findById(id: string): Promise<User | null> {
    return this.usersById.get(id) ?? null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const normalized = email.trim().toLowerCase();
    for (const user of this.usersById.values()) {
      if (user.email === normalized) return user;
    }
    return null;
  }

  async findByAuth0Sub(auth0Sub: string): Promise<User | null> {
    for (const user of this.usersById.values()) {
      if (user.auth0Sub === auth0Sub) return user;
    }
    return null;
  }

  async findMany(params: PaginationParams): Promise<{ items: User[]; total: number }> {
    return paginateFake([...this.usersById.values()], params, (u) => u.createdAt);
  }

  async save(user: User): Promise<void> {
    this.usersById.set(user.id, user);
  }
}
