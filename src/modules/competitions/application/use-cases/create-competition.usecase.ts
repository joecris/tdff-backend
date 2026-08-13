import { randomUUID } from 'node:crypto';
import { Competition } from '../../domain/entities/competition.entity';
import { CompetitionRepositoryPort } from '../../domain/ports/competition-repository.port';
import { CreateCompetitionInput } from '../../domain/ports/competition-service.port';
import { FantasyLeagueServicePort } from '@modules/fantasy-leagues/domain/ports/fantasy-league-service.port';

/** Validates `fantasyLeagueId` via the fantasy-leagues module's own inbound
 * port — same cross-module pattern `CreateFantasyLeagueUseCase` already
 * uses for `grandTourId`, one level deeper in the dependency chain. */
export class CreateCompetitionUseCase {
  constructor(
    private readonly competitionRepository: CompetitionRepositoryPort,
    private readonly fantasyLeagueService: FantasyLeagueServicePort,
  ) {}

  async execute(input: CreateCompetitionInput): Promise<Competition> {
    await this.fantasyLeagueService.getFantasyLeagueById(input.fantasyLeagueId);

    const competition = Competition.create({
      id: randomUUID(),
      name: input.name,
      type: input.type,
      fantasyLeagueId: input.fantasyLeagueId,
      slots: input.slots,
      ...(input.description !== undefined ? { description: input.description } : {}),
      ...(input.entryLockAt !== undefined ? { entryLockAt: input.entryLockAt } : {}),
    });

    await this.competitionRepository.save(competition);
    return competition;
  }
}
