import { BaseEntity } from '@shared/domain/base-entity';
import { SelectionSlot } from '@shared/domain/selection-slot';
import { assertExactlyOnePick } from '../selection-validation';

export interface CompetitionResultSelectionProps {
  id: string;
  slot: SelectionSlot;
  grandTourRiderId?: string;
  grandTourTeamId?: string;
}

/**
 * Structural twin of `CompetitionEntrySelection` — the admin's declared
 * "correct answer" for one slot, instead of a user's pick. Same shape,
 * same exactly-one-pick rule (shared via selection-validation.ts), but a
 * distinct class: belongs to `CompetitionResult`'s aggregate, not
 * `CompetitionEntry`'s.
 */
export class CompetitionResultSelection extends BaseEntity<string> {
  private constructor(private props: CompetitionResultSelectionProps) {
    super(props.id);
  }

  static create(props: {
    id: string;
    slot: SelectionSlot;
    grandTourRiderId?: string;
    grandTourTeamId?: string;
  }): CompetitionResultSelection {
    assertExactlyOnePick(props.slot, props.grandTourRiderId, props.grandTourTeamId);
    return new CompetitionResultSelection({ ...props });
  }

  static fromPersistence(props: CompetitionResultSelectionProps): CompetitionResultSelection {
    return new CompetitionResultSelection(props);
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

  toJSON(): CompetitionResultSelectionProps {
    return { ...this.props };
  }
}
