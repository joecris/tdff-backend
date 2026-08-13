import { FantasyLeague } from '../../../../domain/entities/fantasy-league.entity';
import {
  FantasyLeagueRow,
  NewFantasyLeagueRow,
} from '@infrastructure/db/schema/fantasy-league.schema';

export class FantasyLeagueMapper {
  static toDomain(row: FantasyLeagueRow): FantasyLeague {
    return FantasyLeague.fromPersistence({
      id: row.id,
      name: row.name,
      grandTourId: row.grandTourId,
      // Drizzle nullable columns are `T | null`, not `T | undefined`.
      ...(row.description !== null ? { description: row.description } : {}),
      ...(row.startDate !== null ? { startDate: row.startDate } : {}),
      ...(row.endDate !== null ? { endDate: row.endDate } : {}),
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    });
  }

  static toPersistence(fantasyLeague: FantasyLeague): NewFantasyLeagueRow {
    const props = fantasyLeague.toJSON();
    return {
      id: props.id,
      name: props.name,
      grandTourId: props.grandTourId,
      ...(props.description !== undefined ? { description: props.description } : {}),
      ...(props.startDate !== undefined ? { startDate: props.startDate } : {}),
      ...(props.endDate !== undefined ? { endDate: props.endDate } : {}),
      createdAt: props.createdAt,
      updatedAt: props.updatedAt,
    };
  }
}
