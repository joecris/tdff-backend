import { BaseEntity } from '@shared/domain/base-entity';
import { SelectionSlot } from '@shared/domain/selection-slot';
import { assertExactlyOnePick } from '../selection-validation';

export interface CompetitionEntrySelectionProps {
  id: string;
  slot: SelectionSlot;
  grandTourRiderId?: string;
  grandTourTeamId?: string;
}

/**
 * Child object of `CompetitionEntry` — no independent repository/lifecycle
 * of its own; the entry aggregate owns creating, replacing, and persisting
 * its selections as a set (see drizzle-competition-entry.repository.ts).
 * Still extends BaseEntity for the same id-equality semantics as every
 * other entity in this codebase, even though nothing queries it standalone.
 */
export class CompetitionEntrySelection extends BaseEntity<string> {
  private constructor(private props: CompetitionEntrySelectionProps) {
    super(props.id);
  }

  static create(props: {
    id: string;
    slot: SelectionSlot;
    grandTourRiderId?: string;
    grandTourTeamId?: string;
  }): CompetitionEntrySelection {
    assertExactlyOnePick(props.slot, props.grandTourRiderId, props.grandTourTeamId);
    return new CompetitionEntrySelection({ ...props });
  }

  static fromPersistence(props: CompetitionEntrySelectionProps): CompetitionEntrySelection {
    return new CompetitionEntrySelection(props);
  }

  get slot(): SelectionSlot {
    return this.props.slot;
  }

  get grandTourRiderId(): string | undefined {
    return this.props.grandTourRiderId;
  }

  get grandTourTeamId(): string | undefined {
    return this.props.grandTourTeamId;
  }

  toJSON(): CompetitionEntrySelectionProps {
    return { ...this.props };
  }
}
