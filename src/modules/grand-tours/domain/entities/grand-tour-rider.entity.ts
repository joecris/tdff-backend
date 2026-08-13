import { BaseEntity } from '@shared/domain/base-entity';

export interface GrandTourRiderProps {
  id: string;
  grandTourId: string;
  riderId: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Junction entity — "this rider is on the start list for this grand tour."
 * See grand-tour-team.entity.ts for the same rationale; this is the rider
 * equivalent.
 */
export class GrandTourRider extends BaseEntity<string> {
  private constructor(private props: GrandTourRiderProps) {
    super(props.id);
  }

  static create(props: { id: string; grandTourId: string; riderId: string }): GrandTourRider {
    const now = new Date();
    return new GrandTourRider({ ...props, createdAt: now, updatedAt: now });
  }

  static fromPersistence(props: GrandTourRiderProps): GrandTourRider {
    return new GrandTourRider(props);
  }

  get grandTourId(): string {
    return this.props.grandTourId;
  }

  get riderId(): string {
    return this.props.riderId;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  toJSON(): GrandTourRiderProps {
    return { ...this.props };
  }
}
