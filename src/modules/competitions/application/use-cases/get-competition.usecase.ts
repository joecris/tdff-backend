import { Competition } from '../../domain/entities/competition.entity';
import { CompetitionRepositoryPort } from '../../domain/ports/competition-repository.port';
import { CompetitionNotFoundError } from '../../domain/errors/competition.errors';

export class GetCompetitionUseCase {
  constructor(private readonly competitionRepository: CompetitionRepositoryPort) {}

  async execute(id: string): Promise<Competition> {
    const competition = await this.competitionRepository.findById(id);
    if (!competition) {
      throw new CompetitionNotFoundError(id);
    }
    return competition;
  }
}
