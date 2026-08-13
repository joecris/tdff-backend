import { BaseEntity } from '@shared/domain/base-entity';

export interface TeamProps {
  id: string;
  name: string;
  logoUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Domain entity for a real-world cycling team (e.g. UAE Team Emirates).
 * No decorators, no ORM types, no HTTP types.
 */
export class Team extends BaseEntity<string> {
  private constructor(private props: TeamProps) {
    super(props.id);
  }

  static create(props: { id: string; name: string; logoUrl?: string }): Team {
    const now = new Date();
    return new Team({
      id: props.id,
      name: props.name.trim(),
      ...(props.logoUrl !== undefined ? { logoUrl: props.logoUrl.trim() } : {}),
      createdAt: now,
      updatedAt: now,
    });
  }

  static fromPersistence(props: TeamProps): Team {
    return new Team(props);
  }

  get name(): string {
    return this.props.name;
  }

  get logoUrl(): string | undefined {
    return this.props.logoUrl;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  updateDetails(updates: { name?: string; logoUrl?: string }): void {
    if (updates.name !== undefined) this.props.name = updates.name.trim();
    if (updates.logoUrl !== undefined) this.props.logoUrl = updates.logoUrl.trim();
    this.props.updatedAt = new Date();
  }

  toJSON(): TeamProps {
    return { ...this.props };
  }
}
