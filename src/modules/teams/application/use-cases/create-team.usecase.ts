import { randomUUID } from 'node:crypto';
import { Team } from '../../domain/entities/team.entity';
import { TeamRepositoryPort } from '../../domain/ports/team-repository.port';
import { CreateTeamInput } from '../../domain/ports/team-service.port';

/**
 * No duplicate-name rejection here, deliberately — `teams.name` has no
 * unique constraint (real-world team names can plausibly repeat across
 * eras/organizations), so unlike `CreateUserUseCase` there's no invariant
 * to check before creating.
 */
export class CreateTeamUseCase {
  constructor(private readonly teamRepository: TeamRepositoryPort) {}

  async execute(input: CreateTeamInput): Promise<Team> {
    const team = Team.create({
      id: randomUUID(),
      name: input.name,
      ...(input.logoUrl !== undefined ? { logoUrl: input.logoUrl } : {}),
    });

    await this.teamRepository.save(team);
    return team;
  }
}
