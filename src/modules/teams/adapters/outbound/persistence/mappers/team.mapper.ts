import { Team } from '../../../../domain/entities/team.entity';
import { NewTeamRow, TeamRow } from '@infrastructure/db/schema/team.schema';

export class TeamMapper {
  static toDomain(row: TeamRow): Team {
    return Team.fromPersistence({
      id: row.id,
      name: row.name,
      // Drizzle nullable columns are `T | null`, not `T | undefined`.
      ...(row.logoUrl !== null ? { logoUrl: row.logoUrl } : {}),
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    });
  }

  static toPersistence(team: Team): NewTeamRow {
    const props = team.toJSON();
    return {
      id: props.id,
      name: props.name,
      ...(props.logoUrl !== undefined ? { logoUrl: props.logoUrl } : {}),
      createdAt: props.createdAt,
      updatedAt: props.updatedAt,
    };
  }
}
