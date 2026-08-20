import { count, desc, eq } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { User } from '../../../domain/entities/user.entity';
import { UserRepositoryPort } from '../../../domain/ports/user-repository.port';
import { usersTable } from '@infrastructure/db/schema/user.schema';
import * as schema from '@infrastructure/db/schema';
import { PaginationParams } from '@shared/domain/pagination';
import { UserMapper } from './mappers/user.mapper';

/**
 * Outbound adapter implementing UserRepositoryPort with Drizzle/Postgres.
 * `db` is injected (see infrastructure/config/di-container.ts) rather than
 * imported directly, so this class can be unit tested against any
 * drizzle-orm instance (e.g. one pointed at a test DB or in-memory pg-mem).
 */
export class DrizzleUserRepository implements UserRepositoryPort {
  constructor(private readonly db: NodePgDatabase<typeof schema>) {}

  async findById(id: string): Promise<User | null> {
    const [row] = await this.db.select().from(usersTable).where(eq(usersTable.id, id)).limit(1);

    return row ? UserMapper.toDomain(row) : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const [row] = await this.db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, email.trim().toLowerCase()))
      .limit(1);

    return row ? UserMapper.toDomain(row) : null;
  }

  async findByAuth0Sub(auth0Sub: string): Promise<User | null> {
    const [row] = await this.db
      .select()
      .from(usersTable)
      .where(eq(usersTable.auth0Sub, auth0Sub))
      .limit(1);

    return row ? UserMapper.toDomain(row) : null;
  }

  async findMany(params: PaginationParams): Promise<{ items: User[]; total: number }> {
    const offset = (params.page - 1) * params.limit;
    const [rows, [totalRow]] = await Promise.all([
      this.db
        .select()
        .from(usersTable)
        .orderBy(desc(usersTable.createdAt))
        .limit(params.limit)
        .offset(offset),
      this.db.select({ value: count() }).from(usersTable),
    ]);

    return { items: rows.map(UserMapper.toDomain), total: totalRow?.value ?? 0 };
  }

  async save(user: User): Promise<void> {
    const row = UserMapper.toPersistence(user);

    await this.db
      .insert(usersTable)
      .values(row)
      .onConflictDoUpdate({
        target: usersTable.id,
        set: { name: row.name, email: row.email, updatedAt: row.updatedAt },
      });
  }
}
