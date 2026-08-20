import { UserRepositoryPort } from '../../domain/ports/user-repository.port';
import { PaginatedResult, PaginationParams, toPaginatedResult } from '@shared/domain/pagination';
import { User } from '../../domain/entities/user.entity';

export class ListUsersUseCase {
  constructor(private readonly userRepository: UserRepositoryPort) {}

  async execute(params: PaginationParams): Promise<PaginatedResult<User>> {
    const { items, total } = await this.userRepository.findMany(params);
    return toPaginatedResult(items, total, params);
  }
}
