import { GrandTourTeam } from '../../domain/entities/grand-tour-team.entity';
import { GrandTourRepositoryPort } from '../../domain/ports/grand-tour-repository.port';
import { GrandTourTeamRepositoryPort } from '../../domain/ports/grand-tour-team-repository.port';
import { GrandTourNotFoundError } from '../../domain/errors/grand-tour.errors';

export class ListGrandTourTeamsUseCase {
  constructor(
    private readonly grandTourTeamRepository: GrandTourTeamRepositoryPort,
    private readonly grandTourRepository: GrandTourRepositoryPort,
  ) {}

  async execute(grandTourId: string): Promise<GrandTourTeam[]> {
    const grandTour = await this.grandTourRepository.findById(grandTourId);
    if (!grandTour) {
      throw new GrandTourNotFoundError(grandTourId);
    }

    return this.grandTourTeamRepository.listByGrandTour(grandTourId);
  }
}
