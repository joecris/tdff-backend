import { randomUUID } from 'node:crypto';
import { FantasyLeague } from '../../domain/entities/fantasy-league.entity';
import { FantasyLeagueRepositoryPort } from '../../domain/ports/fantasy-league-repository.port';
import { CreateFantasyLeagueInput } from '../../domain/ports/fantasy-league-service.port';
import { GrandTourServicePort } from '@modules/grand-tours/domain/ports/grand-tour-service.port';

/**
 * First use case in the codebase where `grandTourId` is cross-checked via
 * the *other* module's inbound service port from outside that module — the
 * exact pattern flagged as coming in this phase back when `riders`
 * validated `teamId` against `teams` in Phase 1.
 */
export class CreateFantasyLeagueUseCase {
  constructor(
    private readonly fantasyLeagueRepository: FantasyLeagueRepositoryPort,
    private readonly grandTourService: GrandTourServicePort,
  ) {}

  async execute(input: CreateFantasyLeagueInput): Promise<FantasyLeague> {
    await this.grandTourService.getGrandTourById(input.grandTourId);

    const fantasyLeague = FantasyLeague.create({
      id: randomUUID(),
      name: input.name,
      grandTourId: input.grandTourId,
      ...(input.description !== undefined ? { description: input.description } : {}),
      ...(input.startDate !== undefined ? { startDate: input.startDate } : {}),
      ...(input.endDate !== undefined ? { endDate: input.endDate } : {}),
    });

    await this.fantasyLeagueRepository.save(fantasyLeague);
    return fantasyLeague;
  }
}
