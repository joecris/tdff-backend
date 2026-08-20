import { Competition, CompetitionSlotConfig } from '../../../../domain/entities/competition.entity';
import { SelectionSlot } from '@shared/domain/selection-slot';
import { CompetitionRow, NewCompetitionRow } from '@infrastructure/db/schema/competition.schema';
import {
  CompetitionSlotConfigRow,
  NewCompetitionSlotConfigRow,
} from '@infrastructure/db/schema/competition-slot-config.schema';

/**
 * Reconstructs the `Competition` aggregate from two row sets (the
 * competition row itself plus its slot-config rows) — same shape as
 * `CompetitionEntryMapper`. The repository fetches both and hands them to
 * `toDomain` together; this mapper only translates shapes, it never queries.
 */
export class CompetitionMapper {
  static toDomain(row: CompetitionRow, slotConfigRows: CompetitionSlotConfigRow[]): Competition {
    return Competition.fromPersistence({
      id: row.id,
      name: row.name,
      type: row.type,
      fantasyLeagueId: row.fantasyLeagueId,
      // `slot` is validated against SELECTION_SLOTS at write time (DTO +
      // domain construction); trusted as-is on the way back out.
      slots: slotConfigRows.map((r) => ({ slot: r.slot as SelectionSlot, points: r.points })),
      // Drizzle nullable columns are `T | null`, not `T | undefined`.
      ...(row.description !== null ? { description: row.description } : {}),
      ...(row.imageUrl !== null ? { imageUrl: row.imageUrl } : {}),
      ...(row.entryLockAt !== null ? { entryLockAt: row.entryLockAt } : {}),
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    });
  }

  static toPersistence(competition: Competition): NewCompetitionRow {
    const props = competition.toJSON();
    return {
      id: props.id,
      name: props.name,
      type: props.type,
      fantasyLeagueId: props.fantasyLeagueId,
      ...(props.description !== undefined ? { description: props.description } : {}),
      ...(props.imageUrl !== undefined ? { imageUrl: props.imageUrl } : {}),
      ...(props.entryLockAt !== undefined ? { entryLockAt: props.entryLockAt } : {}),
      createdAt: props.createdAt,
      updatedAt: props.updatedAt,
    };
  }

  static slotsToPersistence(competition: Competition): NewCompetitionSlotConfigRow[] {
    return competition.slots.map((slot: CompetitionSlotConfig) => ({
      competitionId: competition.id,
      slot: slot.slot,
      points: slot.points,
    }));
  }
}
