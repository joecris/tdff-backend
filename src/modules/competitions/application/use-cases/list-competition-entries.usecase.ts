import { CompetitionEntry } from '../../domain/entities/competition-entry.entity';
import { CompetitionEntryRepositoryPort } from '../../domain/ports/competition-entry-repository.port';
import { CompetitionRepositoryPort } from '../../domain/ports/competition-repository.port';
import { CompetitionNotFoundError } from '../../domain/errors/competition.errors';

export class ListCompetitionEntriesUseCase {
  constructor(
    private readonly entryRepository: CompetitionEntryRepositoryPort,
    private readonly competitionRepository: CompetitionRepositoryPort,
  ) {}

  async execute(competitionId: string): Promise<CompetitionEntry[]> {
    const competition = await this.competitionRepository.findById(competitionId);
    if (!competition) {
      throw new CompetitionNotFoundError(competitionId);
    }

    return this.entryRepository.listByCompetition(competitionId);
  }
}
