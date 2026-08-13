import { User } from '../../../../domain/entities/user.entity';
import { NewUserRow, UserRow } from '@infrastructure/db/schema/user.schema';

/**
 * Translates between the Drizzle row shape and the domain entity. This is
 * the only place that knows both shapes exist — keeps persistence concerns
 * (snake_case columns, Date vs string, etc.) out of the domain.
 */
export class UserMapper {
  static toDomain(row: UserRow): User {
    return User.fromPersistence({
      id: row.id,
      email: row.email,
      name: row.name,
      role: row.role,
      // Drizzle nullable columns are `T | null`, not `T | undefined` — see
      // the equivalent note in grand-tour.mapper.ts.
      ...(row.auth0Sub !== null ? { auth0Sub: row.auth0Sub } : {}),
      ...(row.pictureUrl !== null ? { pictureUrl: row.pictureUrl } : {}),
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    });
  }

  static toPersistence(user: User): NewUserRow {
    const props = user.toJSON();
    return {
      id: props.id,
      email: props.email,
      name: props.name,
      role: props.role,
      ...(props.auth0Sub !== undefined ? { auth0Sub: props.auth0Sub } : {}),
      ...(props.pictureUrl !== undefined ? { pictureUrl: props.pictureUrl } : {}),
      createdAt: props.createdAt,
      updatedAt: props.updatedAt,
    };
  }
}
