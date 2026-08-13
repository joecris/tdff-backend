import { BaseEntity } from '@shared/domain/base-entity';

export type FantasyLeagueMemberRole = 'owner' | 'member';

export interface FantasyLeagueMemberProps {
  id: string;
  fantasyLeagueId: string;
  userId: string;
  role: FantasyLeagueMemberRole;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * "This user joined this league" — a distinct concept from submitting a
 * competition entry (Phase 3). `createdAt` doubles as "joined at."
 */
export class FantasyLeagueMember extends BaseEntity<string> {
  private constructor(private props: FantasyLeagueMemberProps) {
    super(props.id);
  }

  static create(props: {
    id: string;
    fantasyLeagueId: string;
    userId: string;
    role?: FantasyLeagueMemberRole;
  }): FantasyLeagueMember {
    const now = new Date();
    return new FantasyLeagueMember({
      id: props.id,
      fantasyLeagueId: props.fantasyLeagueId,
      userId: props.userId,
      role: props.role ?? 'member',
      createdAt: now,
      updatedAt: now,
    });
  }

  static fromPersistence(props: FantasyLeagueMemberProps): FantasyLeagueMember {
    return new FantasyLeagueMember(props);
  }

  get fantasyLeagueId(): string {
    return this.props.fantasyLeagueId;
  }

  get userId(): string {
    return this.props.userId;
  }

  get role(): FantasyLeagueMemberRole {
    return this.props.role;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  toJSON(): FantasyLeagueMemberProps {
    return { ...this.props };
  }
}
