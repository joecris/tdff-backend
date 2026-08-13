import { BaseEntity } from '@shared/domain/base-entity';
import { SelectionSlot } from '@shared/domain/selection-slot';
import {
  DuplicateCompetitionSlotError,
  EmptyCompetitionSlotsError,
  InvalidSlotPointsError,
} from '../errors/competition.errors';

// Purely descriptive/category label — see Phase 4.5: which slots a
// competition requires (and how many points each is worth) is no longer
// derived from this value, it's admin-set per instance via `slots` below.
// Free-form string, not a closed union/DB enum — the real set of
// classifications (GC, KOM, points/sprinters, young rider, combativity,
// one per stage, ...) isn't fixed, and since this field no longer drives
// any logic there's no correctness reason to constrain it. Two
// competitions can share a type (e.g. two "stage_winner" rows, one per
// stage) with entirely different slot configs.
export type CompetitionType = string;

export interface CompetitionSlotConfig {
  slot: SelectionSlot;
  points: number;
}

export interface CompetitionProps {
  id: string;
  name: string;
  description?: string;
  type: CompetitionType;
  fantasyLeagueId: string;
  entryLockAt?: Date;
  slots: CompetitionSlotConfig[];
  createdAt: Date;
  updatedAt: Date;
}

/**
 * A sub-contest within a fantasy league (e.g. "King of the Mountain").
 * `entryLockAt` is provisioned but not enforced anywhere yet — see the
 * plan's "Entry lock deadline" v1 default.
 *
 * `slots` is this competition's own required-picks-and-points config —
 * the single source of truth both `CompetitionEntry`/`CompetitionResult`
 * (required slots) and `scoring` (points per slot) read from. Replaces the
 * old static `competition-slot-rules.ts` dictionary keyed by `type`.
 */
export class Competition extends BaseEntity<string> {
  private constructor(private props: CompetitionProps) {
    super(props.id);
  }

  static create(props: {
    id: string;
    name: string;
    description?: string;
    type: CompetitionType;
    fantasyLeagueId: string;
    entryLockAt?: Date;
    slots: CompetitionSlotConfig[];
  }): Competition {
    Competition.assertValidSlots(props.slots);

    const now = new Date();
    return new Competition({
      id: props.id,
      name: props.name.trim(),
      type: props.type,
      fantasyLeagueId: props.fantasyLeagueId,
      slots: props.slots,
      ...(props.description !== undefined ? { description: props.description.trim() } : {}),
      ...(props.entryLockAt !== undefined ? { entryLockAt: props.entryLockAt } : {}),
      createdAt: now,
      updatedAt: now,
    });
  }

  static fromPersistence(props: CompetitionProps): Competition {
    return new Competition(props);
  }

  private static assertValidSlots(slots: CompetitionSlotConfig[]): void {
    if (slots.length === 0) {
      throw new EmptyCompetitionSlotsError();
    }

    const seen = new Set<SelectionSlot>();
    for (const { slot, points } of slots) {
      if (seen.has(slot)) {
        throw new DuplicateCompetitionSlotError(slot);
      }
      seen.add(slot);

      if (!Number.isInteger(points) || points <= 0) {
        throw new InvalidSlotPointsError(slot, points);
      }
    }
  }

  /** Only safe while the competition has no result yet — the use case
   * layer enforces that (needs a repository read the entity can't do
   * itself), not this method. */
  updateSlots(slots: CompetitionSlotConfig[]): void {
    Competition.assertValidSlots(slots);
    this.props.slots = slots;
    this.props.updatedAt = new Date();
  }

  get name(): string {
    return this.props.name;
  }

  get description(): string | undefined {
    return this.props.description;
  }

  get type(): CompetitionType {
    return this.props.type;
  }

  get fantasyLeagueId(): string {
    return this.props.fantasyLeagueId;
  }

  get entryLockAt(): Date | undefined {
    return this.props.entryLockAt;
  }

  get slots(): CompetitionSlotConfig[] {
    return [...this.props.slots];
  }

  get requiredSlots(): SelectionSlot[] {
    return this.props.slots.map((s) => s.slot);
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  toJSON(): CompetitionProps {
    return { ...this.props, slots: [...this.props.slots] };
  }
}
