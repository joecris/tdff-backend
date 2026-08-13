import { randomUUID } from 'node:crypto';
import { GrandTourTeam } from '../../domain/entities/grand-tour-team.entity';
import { GrandTourRepositoryPort } from '../../domain/ports/grand-tour-repository.port';
import { GrandTourTeamRepositoryPort } from '../../domain/ports/grand-tour-team-repository.port';
import { AddTeamToGrandTourInput } from '../../domain/ports/grand-tour-participation-service.port';
import {
  GrandTourNotFoundError,
  TeamAlreadyInGrandTourError,
} from '../../domain/errors/grand-tour.errors';
import { TeamServicePort } from '@modules/teams/domain/ports/team-service.port';

/**
 * `grandTourRepository` (this module's own outbound port) validates the
 * grand tour exists; `teamService` (the teams module's inbound port, a
 * cross-module dependency) validates the team exists — same "same-module
 * checks use the repository, cross-module checks use the other module's
 * service" split as `riders`' CreateRiderUseCase.
 */
export class AddTeamToGrandTourUseCase {
  constructor(
    private readonly grandTourTeamRepository: GrandTourTeamRepositoryPort,
    private readonly grandTourRepository: GrandTourRepositoryPort,
    private readonly teamService: TeamServicePort,
  ) {}

  async execute(input: AddTeamToGrandTourInput): Promise<GrandTourTeam> {
    const grandTour = await this.grandTourRepository.findById(input.grandTourId);
    if (!grandTour) {
      throw new GrandTourNotFoundError(input.grandTourId);
    }

    await this.teamService.getTeamById(input.teamId);

    const existing = await this.grandTourTeamRepository.findByGrandTourAndTeam(
      input.grandTourId,
      input.teamId,
    );
    if (existing) {
      throw new TeamAlreadyInGrandTourError(input.grandTourId, input.teamId);
    }

    const grandTourTeam = GrandTourTeam.create({
      id: randomUUID(),
      grandTourId: input.grandTourId,
      teamId: input.teamId,
    });

    await this.grandTourTeamRepository.save(grandTourTeam);
    return grandTourTeam;
  }
}
