import { BaseEntity } from '@shared/domain/base-entity';
import { SelectionSlot } from '@shared/domain/selection-slot';
import { CompetitionEntrySelection } from './competition-entry-selection.entity';
import { DuplicateEntrySlotError, InvalidEntrySelectionsError } from '../errors/competition.errors';
import { findSlotCompletenessProblem } from '../selection-validation';

export interface SelectionInput {
  id: string;
  slot: SelectionSlot;
  grandTourRiderId?: string;
  grandTourTeamId?: string;
}

export interface CompetitionEntryProps {
  id: string;
  competitionId: string;
  userId: string;
  selections: CompetitionEntrySelection[];
  submittedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Aggregate root — a user's full set of picks for one competition. Slot
 * completeness (every required slot present exactly once, nothing extra)
 * is a pure structural check, computable with no I/O once the caller has
 * already resolved `requiredSlots` from `competition-slot-rules.ts` — the
 * one thing that DOES need I/O (confirming a picked rider/team is actually
 * on the right grand tour's start list) stays out of the entity, in the
 * use case, exactly like `CreateRiderUseCase` keeps its cross-module check
 * out of `Rider.create()`.
 */
export class CompetitionEntry extends BaseEntity<string> {
  private constructor(private props: CompetitionEntryProps) {
    super(props.id);
  }

  static create(props: {
    id: string;
    competitionId: string;
    userId: string;
    selections: SelectionInput[];
    requiredSlots: readonly SelectionSlot[];
  }): CompetitionEntry {
    const selections = props.selections.map((s) => CompetitionEntrySelection.create(s));
    CompetitionEntry.assertMatchesRequiredSlots(selections, props.requiredSlots);

    const now = new Date();
    return new CompetitionEntry({
      id: props.id,
      competitionId: props.competitionId,
      userId: props.userId,
      selections,
      submittedAt: now,
      createdAt: now,
      updatedAt: now,
    });
  }

  static fromPersistence(props: CompetitionEntryProps): CompetitionEntry {
    return new CompetitionEntry(props);
  }

  private static assertMatchesRequiredSlots(
    selections: CompetitionEntrySelection[],
    requiredSlots: readonly SelectionSlot[],
  ): void {
    const problem = findSlotCompletenessProblem(
      selections.map((s) => s.slot),
      requiredSlots,
    );
    if (!problem) return;

    if (problem.type === 'duplicate') {
      throw new DuplicateEntrySlotError(problem.duplicateSlot as SelectionSlot);
    }
    throw new InvalidEntrySelectionsError(problem.missing ?? [], problem.unexpected ?? []);
  }

  /** Resubmission — full-replace, not merge. Re-validates from scratch. */
  updateSelections(selections: SelectionInput[], requiredSlots: readonly SelectionSlot[]): void {
    const nextSelections = selections.map((s) => CompetitionEntrySelection.create(s));
    CompetitionEntry.assertMatchesRequiredSlots(nextSelections, requiredSlots);

    this.props.selections = nextSelections;
    this.props.submittedAt = new Date();
    this.props.updatedAt = new Date();
  }

  get competitionId(): string {
    return this.props.competitionId;
  }

  get userId(): string {
    return this.props.userId;
  }

  get selections(): CompetitionEntrySelection[] {
    return [...this.props.selections];
  }

  get submittedAt(): Date {
    return this.props.submittedAt;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  toJSON(): {
    id: string;
    competitionId: string;
    userId: string;
    submittedAt: Date;
    createdAt: Date;
    updatedAt: Date;
  } {
    return {
      id: this.props.id,
      competitionId: this.props.competitionId,
      userId: this.props.userId,
      submittedAt: this.props.submittedAt,
      createdAt: this.props.createdAt,
      updatedAt: this.props.updatedAt,
    };
  }
}
