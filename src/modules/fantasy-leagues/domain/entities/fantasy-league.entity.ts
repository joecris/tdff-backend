import { BaseEntity } from '@shared/domain/base-entity';
import { InvalidFantasyLeagueDateRangeError } from '../errors/fantasy-league.errors';

export interface FantasyLeagueProps {
  id: string;
  name: string;
  description?: string;
  grandTourId: string;
  startDate?: Date;
  endDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Domain entity for a fantasy league tied to a specific grand tour. Mirrors
 * grand-tour.entity.ts's shape (same optional-date-range invariant), since
 * a league's own start/end window is subject to the same rule.
 */
export class FantasyLeague extends BaseEntity<string> {
  private constructor(private props: FantasyLeagueProps) {
    super(props.id);
  }

  static create(props: {
    id: string;
    name: string;
    description?: string;
    grandTourId: string;
    startDate?: Date;
    endDate?: Date;
  }): FantasyLeague {
    FantasyLeague.assertValidDateRange(props.startDate, props.endDate);

    const now = new Date();
    return new FantasyLeague({
      id: props.id,
      name: props.name.trim(),
      grandTourId: props.grandTourId,
      ...(props.description !== undefined ? { description: props.description.trim() } : {}),
      ...(props.startDate !== undefined ? { startDate: props.startDate } : {}),
      ...(props.endDate !== undefined ? { endDate: props.endDate } : {}),
      createdAt: now,
      updatedAt: now,
    });
  }

  static fromPersistence(props: FantasyLeagueProps): FantasyLeague {
    return new FantasyLeague(props);
  }

  private static assertValidDateRange(startDate?: Date, endDate?: Date): void {
    if (startDate && endDate && endDate < startDate) {
      throw new InvalidFantasyLeagueDateRangeError();
    }
  }

  get name(): string {
    return this.props.name;
  }

  get description(): string | undefined {
    return this.props.description;
  }

  get grandTourId(): string {
    return this.props.grandTourId;
  }

  get startDate(): Date | undefined {
    return this.props.startDate;
  }

  get endDate(): Date | undefined {
    return this.props.endDate;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  updateDetails(updates: {
    name?: string;
    description?: string;
    startDate?: Date;
    endDate?: Date;
  }): void {
    const nextStartDate = updates.startDate ?? this.props.startDate;
    const nextEndDate = updates.endDate ?? this.props.endDate;
    FantasyLeague.assertValidDateRange(nextStartDate, nextEndDate);

    if (updates.name !== undefined) this.props.name = updates.name.trim();
    if (updates.description !== undefined) this.props.description = updates.description.trim();
    if (updates.startDate !== undefined) this.props.startDate = updates.startDate;
    if (updates.endDate !== undefined) this.props.endDate = updates.endDate;
    this.props.updatedAt = new Date();
  }

  toJSON(): FantasyLeagueProps {
    return { ...this.props };
  }
}
