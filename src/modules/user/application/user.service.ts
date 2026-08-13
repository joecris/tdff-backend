import { User } from '../domain/entities/user.entity';
import { UserRepositoryPort } from '../domain/ports/user-repository.port';
import { CreateUserInput, UserServicePort } from '../domain/ports/user-service.port';
import { CreateUserUseCase } from './use-cases/create-user.usecase';
import { GetUserUseCase } from './use-cases/get-user.usecase';

/**
 * Implements the inbound port by delegating to individual use cases.
 * For a small module this facade could be skipped and the controller could
 * call use cases directly — kept here so the module's public surface
 * (`UserServicePort`) stays stable even as use cases are added/split.
 */
export class UserService implements UserServicePort {
  private readonly createUserUseCase: CreateUserUseCase;
  private readonly getUserUseCase: GetUserUseCase;

  constructor(userRepository: UserRepositoryPort) {
    this.createUserUseCase = new CreateUserUseCase(userRepository);
    this.getUserUseCase = new GetUserUseCase(userRepository);
  }

  createUser(input: CreateUserInput): Promise<User> {
    return this.createUserUseCase.execute(input);
  }

  getUserById(id: string): Promise<User> {
    return this.getUserUseCase.execute(id);
  }
}
