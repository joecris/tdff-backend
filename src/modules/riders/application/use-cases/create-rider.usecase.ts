import { randomUUID } from 'node:crypto';
import { Rider } from '../../domain/entities/rider.entity';
import { RiderRepositoryPort } from '../../domain/ports/rider-repository.port';
import { CreateRiderInput } from '../../domain/ports/rider-service.port';
import { TeamServicePort } from '@modules/teams/domain/ports/team-service.port';

/**
 * Depends on `TeamServicePort` (the teams module's own inbound port, not
 * its repository) to validate `teamId` when provided — a rider referencing
 * a team that doesn't exist should fail with a clear domain error here,
 * not surface as a raw Postgres foreign-key-violation once `save()` runs.
 * `TeamServicePort.getTeamById` already throws `TeamNotFoundError` for a
 * missing id, so it's reused as-is rather than duplicated.
 */
export class CreateRiderUseCase {
  constructor(
    private readonly riderRepository: RiderRepositoryPort,
    private readonly teamService: TeamServicePort,
  ) {}

  async execute(input: CreateRiderInput): Promise<Rider> {
    if (input.teamId !== undefined) {
      await this.teamService.getTeamById(input.teamId);
    }

    const rider = Rider.create({
      id: randomUUID(),
      name: input.name,
      ...(input.nationality !== undefined ? { nationality: input.nationality } : {}),
      ...(input.imageUrl !== undefined ? { imageUrl: input.imageUrl } : {}),
      ...(input.type !== undefined ? { type: input.type } : {}),
      ...(input.teamId !== undefined ? { teamId: input.teamId } : {}),
    });

    await this.riderRepository.save(rider);
    return rider;
  }
}
