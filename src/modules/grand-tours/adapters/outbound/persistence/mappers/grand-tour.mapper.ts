import { GrandTour } from '../../../../domain/entities/grand-tour.entity';
import { NewGrandTourRow, GrandTourRow } from '@infrastructure/db/schema/grand-tour.schema';

/**
 * Translates between the Drizzle row shape and the domain entity. This is
 * the only place that knows both shapes exist — keeps persistence concerns
 * (snake_case columns, Date vs string, etc.) out of the domain.
 */
export class GrandTourMapper {
  static toDomain(row: GrandTourRow): GrandTour {
    return GrandTour.fromPersistence({
      id: row.id,
      name: row.name,
      // Drizzle's nullable columns infer as `T | null` (SQL NULL), not
      // `T | undefined` — checking `!== undefined` here would never filter
      // out a real NULL and would leak `null` into props typed `T | undefined`.
      ...(row.description !== null ? { description: row.description } : {}),
      ...(row.startDate !== null ? { startDate: row.startDate } : {}),
      ...(row.endDate !== null ? { endDate: row.endDate } : {}),
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    });
  }

  static toPersistence(grandTour: GrandTour): NewGrandTourRow {
    const props = grandTour.toJSON();
    return {
      id: props.id,
      name: props.name,
      ...(props.description !== undefined ? { description: props.description } : {}),
      ...(props.startDate !== undefined ? { startDate: props.startDate } : {}),
      ...(props.endDate !== undefined ? { endDate: props.endDate } : {}),
      createdAt: props.createdAt,
      updatedAt: props.updatedAt,
    };
  }
}
