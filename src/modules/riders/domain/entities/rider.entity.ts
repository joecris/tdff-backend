import { BaseEntity } from '@shared/domain/base-entity';

export interface RiderProps {
  id: string;
  name: string;
  nationality?: string;
  imageUrl?: string;
  // Informational rider specialty (e.g. "climber", "sprinter") — free text,
  // NOT the same enum as competition entry `slot` values (Phase 3).
  type?: string;
  teamId?: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Domain entity for a real-world professional cyclist. No decorators, no
 * ORM types, no HTTP types.
 */
export class Rider extends BaseEntity<string> {
  private constructor(private props: RiderProps) {
    super(props.id);
  }

  static create(props: {
    id: string;
    name: string;
    nationality?: string;
    imageUrl?: string;
    type?: string;
    teamId?: string;
  }): Rider {
    const now = new Date();
    return new Rider({
      id: props.id,
      name: props.name.trim(),
      ...(props.nationality !== undefined ? { nationality: props.nationality.trim() } : {}),
      ...(props.imageUrl !== undefined ? { imageUrl: props.imageUrl.trim() } : {}),
      ...(props.type !== undefined ? { type: props.type.trim() } : {}),
      ...(props.teamId !== undefined ? { teamId: props.teamId } : {}),
      createdAt: now,
      updatedAt: now,
    });
  }

  static fromPersistence(props: RiderProps): Rider {
    return new Rider(props);
  }

  get name(): string {
    return this.props.name;
  }

  get nationality(): string | undefined {
    return this.props.nationality;
  }

  get imageUrl(): string | undefined {
    return this.props.imageUrl;
  }

  get type(): string | undefined {
    return this.props.type;
  }

  get teamId(): string | undefined {
    return this.props.teamId;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  updateDetails(updates: {
    name?: string;
    nationality?: string;
    imageUrl?: string;
    type?: string;
    teamId?: string;
  }): void {
    if (updates.name !== undefined) this.props.name = updates.name.trim();
    if (updates.nationality !== undefined) this.props.nationality = updates.nationality.trim();
    if (updates.imageUrl !== undefined) this.props.imageUrl = updates.imageUrl.trim();
    if (updates.type !== undefined) this.props.type = updates.type.trim();
    if (updates.teamId !== undefined) this.props.teamId = updates.teamId;
    this.props.updatedAt = new Date();
  }

  toJSON(): RiderProps {
    return { ...this.props };
  }
}
