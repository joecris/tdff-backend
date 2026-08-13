import { BaseEntity } from '@shared/domain/base-entity';
import { UserRole } from '@shared/auth/role';

export type { UserRole };

export interface UserProps {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  auth0Sub?: string;
  pictureUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Domain entity. No decorators, no ORM types, no HTTP types — just the
 * shape and invariants of a User as the business understands it.
 */
export class User extends BaseEntity<string> {
  private constructor(private props: UserProps) {
    super(props.id);
  }

  static create(props: {
    id: string;
    email: string;
    name: string;
    role?: UserRole;
    auth0Sub?: string;
    pictureUrl?: string;
  }): User {
    const now = new Date();
    return new User({
      id: props.id,
      email: User.normalizeEmail(props.email),
      name: props.name.trim(),
      role: props.role ?? 'user',
      ...(props.auth0Sub !== undefined ? { auth0Sub: props.auth0Sub } : {}),
      ...(props.pictureUrl !== undefined ? { pictureUrl: props.pictureUrl } : {}),
      createdAt: now,
      updatedAt: now,
    });
  }

  static fromPersistence(props: UserProps): User {
    return new User(props);
  }

  private static normalizeEmail(email: string): string {
    return email.trim().toLowerCase();
  }

  get email(): string {
    return this.props.email;
  }

  get name(): string {
    return this.props.name;
  }

  get role(): UserRole {
    return this.props.role;
  }

  get auth0Sub(): string | undefined {
    return this.props.auth0Sub;
  }

  get pictureUrl(): string | undefined {
    return this.props.pictureUrl;
  }

  get isAdmin(): boolean {
    return this.props.role === 'admin';
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  rename(name: string): void {
    this.props.name = name.trim();
    this.props.updatedAt = new Date();
  }

  updateRole(role: UserRole): void {
    this.props.role = role;
    this.props.updatedAt = new Date();
  }

  toJSON(): UserProps {
    return { ...this.props };
  }
}
