import { Rider } from '../../../../domain/entities/rider.entity';
import { NewRiderRow, RiderRow } from '@infrastructure/db/schema/rider.schema';

export class RiderMapper {
  static toDomain(row: RiderRow): Rider {
    return Rider.fromPersistence({
      id: row.id,
      name: row.name,
      // Drizzle nullable columns are `T | null`, not `T | undefined`.
      ...(row.nationality !== null ? { nationality: row.nationality } : {}),
      ...(row.imageUrl !== null ? { imageUrl: row.imageUrl } : {}),
      ...(row.type !== null ? { type: row.type } : {}),
      ...(row.teamId !== null ? { teamId: row.teamId } : {}),
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    });
  }

  static toPersistence(rider: Rider): NewRiderRow {
    const props = rider.toJSON();
    return {
      id: props.id,
      name: props.name,
      ...(props.nationality !== undefined ? { nationality: props.nationality } : {}),
      ...(props.imageUrl !== undefined ? { imageUrl: props.imageUrl } : {}),
      ...(props.type !== undefined ? { type: props.type } : {}),
      ...(props.teamId !== undefined ? { teamId: props.teamId } : {}),
      createdAt: props.createdAt,
      updatedAt: props.updatedAt,
    };
  }
}
