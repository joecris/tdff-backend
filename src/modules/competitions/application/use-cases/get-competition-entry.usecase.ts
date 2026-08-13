import { CompetitionEntry } from '../../domain/entities/competition-entry.entity';
import { CompetitionEntryRepositoryPort } from '../../domain/ports/competition-entry-repository.port';
import { CompetitionRepositoryPort } from '../../domain/ports/competition-repository.port';
import {
  CompetitionEntryNotFoundError,
  CompetitionNotFoundError,
} from '../../domain/errors/competition.errors';

export class GetCompetitionEntryUseCase {
  constructor(
    private readonly entryRepository: CompetitionEntryRepositoryPort,
    private readonly competitionRepository: CompetitionRepositoryPort,
  ) {}

  async execute(competitionId: string, userId: string): Promise<CompetitionEntry> {
    const competition = await this.competitionRepository.findById(competitionId);
    if (!competition) {
      throw new CompetitionNotFoundError(competitionId);
    }

    const entry = await this.entryRepository.findByCompetitionAndUser(competitionId, userId);
    if (!entry) {
      throw new CompetitionEntryNotFoundError(competitionId, userId);
    }
    return entry;
  }
}
