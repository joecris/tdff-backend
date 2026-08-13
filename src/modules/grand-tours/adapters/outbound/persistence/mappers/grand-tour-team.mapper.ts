import { GrandTourTeam } from '../../../../domain/entities/grand-tour-team.entity';
import {
  GrandTourTeamRow,
  NewGrandTourTeamRow,
} from '@infrastructure/db/schema/grand-tour-team.schema';

export class GrandTourTeamMapper {
  static toDomain(row: GrandTourTeamRow): GrandTourTeam {
    return GrandTourTeam.fromPersistence({
      id: row.id,
      grandTourId: row.grandTourId,
      teamId: row.teamId,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    });
  }

  static toPersistence(grandTourTeam: GrandTourTeam): NewGrandTourTeamRow {
    const props = grandTourTeam.toJSON();
    return {
      id: props.id,
      grandTourId: props.grandTourId,
      teamId: props.teamId,
      createdAt: props.createdAt,
      updatedAt: props.updatedAt,
    };
  }
}
