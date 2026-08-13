import { BaseEntity } from '@shared/domain/base-entity';
import { SelectionSlot } from '@shared/domain/selection-slot';
import { CompetitionResultSelection } from './competition-result-selection.entity';
import {
  DuplicateResultSlotError,
  InvalidResultSelectionsError,
} from '../errors/competition.errors';
import { findSlotCompletenessProblem } from '../selection-validation';
import { SelectionInput } from './competition-entry.entity';

export interface CompetitionResultProps {
  id: string;
  competitionId: string;
  submittedByUserId?: string;
  selections: CompetitionResultSelection[];
  submittedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Aggregate root — the admin's declared outcome for one competition. One
 * per competition (DB-unique on `competitionId`); resubmitting fully
 * replaces the prior selections, same as `CompetitionEntry`. Structural
 * twin of `CompetitionEntry` — see that class for why the cross-module
 * "does this rider/team actually belong to this grand tour" check stays
 * out of the entity, in the use case.
 */
export class CompetitionResult extends BaseEntity<string> {
  private constructor(private props: CompetitionResultProps) {
    super(props.id);
  }

  static create(props: {
    id: string;
    competitionId: string;
    submittedByUserId?: string;
    selections: SelectionInput[];
    requiredSlots: readonly SelectionSlot[];
  }): CompetitionResult {
    const selections = props.selections.map((s) => CompetitionResultSelection.create(s));
    CompetitionResult.assertMatchesRequiredSlots(selections, props.requiredSlots);

    const now = new Date();
    return new CompetitionResult({
      id: props.id,
      competitionId: props.competitionId,
      ...(props.submittedByUserId !== undefined
        ? { submittedByUserId: props.submittedByUserId }
        : {}),
      selections,
      submittedAt: now,
      createdAt: now,
      updatedAt: now,
    });
  }

  static fromPersistence(props: CompetitionResultProps): CompetitionResult {
    return new CompetitionResult(props);
  }

  private static assertMatchesRequiredSlots(
    selections: CompetitionResultSelection[],
    requiredSlots: readonly SelectionSlot[],
  ): void {
    const problem = findSlotCompletenessProblem(
      selections.map((s) => s.slot),
      requiredSlots,
    );
    if (!problem) return;

    if (problem.type === 'duplicate') {
      throw new DuplicateResultSlotError(problem.duplicateSlot as SelectionSlot);
    }
    throw new InvalidResultSelectionsError(problem.missing ?? [], problem.unexpected ?? []);
  }

  /** Resubmission — full-replace, not merge. Re-validates from scratch. */
  updateSelections(
    selections: SelectionInput[],
    requiredSlots: readonly SelectionSlot[],
    submittedByUserId?: string,
  ): void {
    const nextSelections = selections.map((s) => CompetitionResultSelection.create(s));
    CompetitionResult.assertMatchesRequiredSlots(nextSelections, requiredSlots);

    this.props.selections = nextSelections;
    if (submittedByUserId !== undefined) this.props.submittedByUserId = submittedByUserId;
    this.props.submittedAt = new Date();
    this.props.updatedAt = new Date();
  }

  get competitionId(): string {
    return this.props.competitionId;
  }

  get submittedByUserId(): string | undefined {
    return this.props.submittedByUserId;
  }

  get selections(): CompetitionResultSelection[] {
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
    submittedByUserId?: string;
    submittedAt: Date;
    createdAt: Date;
    updatedAt: Date;
  } {
    return {
      id: this.props.id,
      competitionId: this.props.competitionId,
      ...(this.props.submittedByUserId !== undefined
        ? { submittedByUserId: this.props.submittedByUserId }
        : {}),
      submittedAt: this.props.submittedAt,
      createdAt: this.props.createdAt,
      updatedAt: this.props.updatedAt,
    };
  }
}
