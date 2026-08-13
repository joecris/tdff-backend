import { User } from '@modules/user/domain/entities/user.entity';
import { UserRepositoryPort } from '@modules/user/domain/ports/user-repository.port';

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

  async save(user: User): Promise<void> {
    this.usersById.set(user.id, user);
  }
}
