import { BaseEntity } from '@shared/domain/base-entity';
import { InvalidTourDateRangeError } from '../errors/grand-tour.errors';

export interface GrandTourProps {
  id: string;
  name: string;
  description?: string;
  startDate?: Date;
  endDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Domain entity. No decorators, no ORM types, no HTTP types — just the
 * shape and invariants of a GrandTour as the business understands it.
 */
export class GrandTour extends BaseEntity<string> {
  private constructor(private props: GrandTourProps) {
    super(props.id);
  }

  static create(props: {
    id: string;
    name: string;
    description?: string;
    startDate?: Date;
    endDate?: Date;
  }): GrandTour {
    GrandTour.assertValidDateRange(props.startDate, props.endDate);

    const now = new Date();
    return new GrandTour({
      id: props.id,
      name: props.name.trim(),
      // Conditionally spread rather than assign `undefined` directly —
      // exactOptionalPropertyTypes treats "key present with value
      // undefined" as distinct from "key omitted" for optional props.
      ...(props.description !== undefined ? { description: props.description.trim() } : {}),
      ...(props.startDate !== undefined ? { startDate: props.startDate } : {}),
      ...(props.endDate !== undefined ? { endDate: props.endDate } : {}),
      createdAt: now,
      updatedAt: now,
    });
  }

  static fromPersistence(props: GrandTourProps): GrandTour {
    return new GrandTour(props);
  }

  private static assertValidDateRange(startDate?: Date, endDate?: Date): void {
    if (startDate && endDate && endDate < startDate) {
      throw new InvalidTourDateRangeError();
    }
  }

  get name(): string {
    return this.props.name;
  }

  get description(): string | undefined {
    return this.props.description;
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

  /**
   * Partial-update pattern — prefer this over one setter per field once an
   * entity has more than a field or two. Merges only the provided keys,
   * re-validates cross-field invariants against the merged result, then
   * bumps `updatedAt`. Reuse this shape for other modules' entities.
   */
  updateDetails(updates: {
    name?: string;
    description?: string;
    startDate?: Date;
    endDate?: Date;
  }): void {
    const nextStartDate = updates.startDate ?? this.props.startDate;
    const nextEndDate = updates.endDate ?? this.props.endDate;
    GrandTour.assertValidDateRange(nextStartDate, nextEndDate);

    if (updates.name !== undefined) this.props.name = updates.name.trim();
    if (updates.description !== undefined) this.props.description = updates.description.trim();
    if (updates.startDate !== undefined) this.props.startDate = updates.startDate;
    if (updates.endDate !== undefined) this.props.endDate = updates.endDate;
    this.props.updatedAt = new Date();
  }

  toJSON(): GrandTourProps {
    return { ...this.props };
  }
}
