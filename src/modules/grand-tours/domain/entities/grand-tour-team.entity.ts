import { BaseEntity } from '@shared/domain/base-entity';

export interface GrandTourTeamProps {
  id: string;
  grandTourId: string;
  teamId: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Junction entity — "this team is on the start list for this grand tour."
 * Deliberately thin (no mutable state beyond the link itself); the actual
 * team details (name, logo) live in the `teams` module, referenced by id
 * only. This is what `competition_entry_selections` will reference (Phase
 * 3), not `teams.id` directly — confines fantasy picks to teams actually
 * racing in the relevant grand tour.
 */
export class GrandTourTeam extends BaseEntity<string> {
  private constructor(private props: GrandTourTeamProps) {
    super(props.id);
  }

  static create(props: { id: string; grandTourId: string; teamId: string }): GrandTourTeam {
    const now = new Date();
    return new GrandTourTeam({ ...props, createdAt: now, updatedAt: now });
  }

  static fromPersistence(props: GrandTourTeamProps): GrandTourTeam {
    return new GrandTourTeam(props);
  }

  get grandTourId(): string {
    return this.props.grandTourId;
  }

  get teamId(): string {
    return this.props.teamId;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  toJSON(): GrandTourTeamProps {
    return { ...this.props };
  }
}
