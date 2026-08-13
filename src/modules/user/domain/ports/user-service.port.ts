import { User, UserRole } from '../entities/user.entity';

/**
 * Owned here (domain layer, alongside the port) rather than in the use case
 * that consumes it — the use case and the service both implement/call
 * against this same port, so the port is the one place the shape should be
 * declared. Import this type instead of restating the shape at each call
 * site.
 *
 * `role` is deliberately NOT exposed on `create-user.dto.ts`'s Zod schema —
 * Zod strips unknown body fields by default, so an HTTP caller can never
 * set it; this field exists for trusted, non-HTTP callers only (the seed
 * script today, an Auth0 JIT-provisioning path later).
 */
export interface CreateUserInput {
  email: string;
  name: string;
  role?: UserRole;
}

/**
 * Inbound port. The HTTP controller depends on this interface only;
 * `application/user.service.ts` implements it. A future inbound adapter
 * (CLI, gRPC, queue consumer) would depend on the same port.
 */
export interface UserServicePort {
  createUser(input: CreateUserInput): Promise<User>;
  getUserById(id: string): Promise<User>;
}
