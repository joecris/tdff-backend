import { randomUUID } from 'node:crypto';
import { User } from '../../domain/entities/user.entity';
import { UserRepositoryPort } from '../../domain/ports/user-repository.port';
import { CreateUserInput } from '../../domain/ports/user-service.port';
import { EmailAlreadyInUseError } from '../../domain/errors/user.errors';

/**
 * Use cases are plain classes/functions depending only on ports (interfaces).
 * No Express, no Drizzle — trivially unit-testable with a fake repository.
 */
export class CreateUserUseCase {
  constructor(private readonly userRepository: UserRepositoryPort) {}

  async execute(input: CreateUserInput): Promise<User> {
    const existing = await this.userRepository.findByEmail(input.email);
    if (existing) {
      throw new EmailAlreadyInUseError(input.email);
    }

    const user = User.create({
      id: randomUUID(),
      email: input.email,
      name: input.name,
      ...(input.role !== undefined ? { role: input.role } : {}),
    });

    await this.userRepository.save(user);
    return user;
  }
}
