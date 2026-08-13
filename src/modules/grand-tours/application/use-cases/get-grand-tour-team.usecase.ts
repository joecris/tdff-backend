import { GrandTourTeam } from '../../domain/entities/grand-tour-team.entity';
import { GrandTourTeamRepositoryPort } from '../../domain/ports/grand-tour-team-repository.port';
import { GrandTourTeamNotFoundError } from '../../domain/errors/grand-tour.errors';

/**
 * Added for Phase 3 — the `competitions` module needs to resolve a
 * `grand_tour_team_id` referenced by an entry selection back to which
 * grand tour it actually belongs to (to confirm it matches the
 * competition's own grand tour), without knowing anything about how
 * start-list rows are persisted.
 */
export class GetGrandTourTeamUseCase {
  constructor(private readonly grandTourTeamRepository: GrandTourTeamRepositoryPort) {}

  async execute(id: string): Promise<GrandTourTeam> {
    const grandTourTeam = await this.grandTourTeamRepository.findById(id);
    if (!grandTourTeam) {
      throw new GrandTourTeamNotFoundError(id);
    }
    return grandTourTeam;
  }
}
