import { z } from 'zod';
import { User } from '../../../../domain/entities/user.entity';

// Mirrors `UserRole` (`src/shared/auth/role.ts`) — hardcoded rather than
// derived because Zod enums need literal values, not a type; update both
// together if a role is ever added.
export const userResponseSchema = z.object({
  id: z.uuid(),
  email: z.email(),
  name: z.string(),
  role: z.enum(['user', 'admin']),
  pictureUrl: z.string().optional(),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
});
export type UserResponseDto = z.infer<typeof userResponseSchema>;

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
