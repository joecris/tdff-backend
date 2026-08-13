import { User, UserRole } from '../../../../domain/entities/user.entity';

export interface UserResponseDto {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  pictureUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export function toUserResponseDto(user: User): UserResponseDto {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    // auth0Sub is deliberately not exposed — internal identity-linking
    // detail, no frontend use case, no reason to widen the response surface.
    ...(user.pictureUrl !== undefined ? { pictureUrl: user.pictureUrl } : {}),
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
  };
}
