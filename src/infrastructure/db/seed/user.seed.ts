import { CreateUserInput, UserServicePort } from '@modules/user/domain/ports/user-service.port';
import { User } from '@modules/user/domain/entities/user.entity';
import { EmailAlreadyInUseError } from '@modules/user/domain/errors/user.errors';

const SAMPLE_USERS: CreateUserInput[] = [
  // Admin, so the dev auth seam has a real seeded admin to test against
  // (see infrastructure/auth/dev-auth-verifier.ts) — send `x-user-id:
  // <alice's id>` to exercise admin-gated routes as this user.
  { email: 'alice@example.com', name: 'Alice Johnson', role: 'admin' },
  { email: 'bob@example.com', name: 'Bob Smith' },
  { email: 'carol@example.com', name: 'Carol Davis' },
];

/**
 * Seeds sample users through the same UserService the HTTP layer calls —
 * exercises the real create-user use case (validation, email
 * normalization), not a raw insert. Safe to re-run: an email that's
 * already seeded is skipped via the same EmailAlreadyInUseError the API
 * itself raises for a duplicate signup, rather than failing the whole run.
 *
 * Returns only the users actually created this run — the real orchestrator
 * (seed/index.ts) always calls clearDb() first, so the skip path is only
 * ever exercised if this is invoked directly without clearing.
 */
export async function seedUsers(userService: UserServicePort): Promise<User[]> {
  const users: User[] = [];
  for (const input of SAMPLE_USERS) {
    try {
      const user = await userService.createUser(input);
      console.warn(`  ✓ created user "${user.email}"`);
      users.push(user);
    } catch (err) {
      if (err instanceof EmailAlreadyInUseError) {
        console.warn(`  · skipped user "${input.email}" (already exists)`);
        continue;
      }
      throw err;
    }
  }
  return users;
}
