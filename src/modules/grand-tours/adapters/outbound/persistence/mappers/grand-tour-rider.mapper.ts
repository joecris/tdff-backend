import { GrandTourRider } from '../../../../domain/entities/grand-tour-rider.entity';
import {
  GrandTourRiderRow,
  NewGrandTourRiderRow,
} from '@infrastructure/db/schema/grand-tour-rider.schema';

export class GrandTourRiderMapper {
  static toDomain(row: GrandTourRiderRow): GrandTourRider {
    return GrandTourRider.fromPersistence({
      id: row.id,
      grandTourId: row.grandTourId,
      riderId: row.riderId,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    });
  }

  static toPersistence(grandTourRider: GrandTourRider): NewGrandTourRiderRow {
    const props = grandTourRider.toJSON();
    return {
      id: props.id,
      grandTourId: props.grandTourId,
      riderId: props.riderId,
      createdAt: props.createdAt,
      updatedAt: props.updatedAt,
    };
  }
}
