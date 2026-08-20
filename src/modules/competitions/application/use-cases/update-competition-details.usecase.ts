import { Competition } from '../../domain/entities/competition.entity';
import { CompetitionRepositoryPort } from '../../domain/ports/competition-repository.port';
import { UpdateCompetitionDetailsInput } from '../../domain/ports/competition-service.port';
import { CompetitionNotFoundError } from '../../domain/errors/competition.errors';

/**
 * Cosmetic-details update (currently just `imageUrl`) — deliberately
 * unblocked by an existing result, unlike `UpdateCompetitionSlotsUseCase`.
 * Reshaping required slots after scoring would invalidate computed scores;
 * changing a banner image never does, so there's no analogous guard here.
 */
export class UpdateCompetitionDetailsUseCase {
  constructor(private readonly competitionRepository: CompetitionRepositoryPort) {}

  async execute(input: UpdateCompetitionDetailsInput): Promise<Competition> {
    const competition = await this.competitionRepository.findById(input.competitionId);
    if (!competition) {
      throw new CompetitionNotFoundError(input.competitionId);
    }

    competition.updateDetails({
      ...(input.imageUrl !== undefined ? { imageUrl: input.imageUrl } : {}),
    });
    await this.competitionRepository.save(competition);
    return competition;
  }
}
