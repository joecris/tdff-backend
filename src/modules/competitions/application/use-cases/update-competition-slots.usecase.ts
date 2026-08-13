import { Competition } from '../../domain/entities/competition.entity';
import { CompetitionRepositoryPort } from '../../domain/ports/competition-repository.port';
import { CompetitionResultRepositoryPort } from '../../domain/ports/competition-result-repository.port';
import { UpdateCompetitionSlotsInput } from '../../domain/ports/competition-service.port';
import {
  CompetitionNotFoundError,
  CompetitionResultsAlreadySubmittedError,
} from '../../domain/errors/competition.errors';

/**
 * Admin-only reshape of a competition's required slots/points — the write
 * side of Phase 4.5's "stop hardcoding slots/points in TS" fix. Blocked
 * once a result exists: silently reshaping required slots after scores
 * have already been computed against the old shape would leave those
 * scores meaningless without anyone being told. An admin who genuinely
 * needs to redo a competition's shape after results are in should retract
 * the result first (out of scope for this use case).
 */
export class UpdateCompetitionSlotsUseCase {
  constructor(
    private readonly competitionRepository: CompetitionRepositoryPort,
    private readonly resultRepository: CompetitionResultRepositoryPort,
  ) {}

  async execute(input: UpdateCompetitionSlotsInput): Promise<Competition> {
    const competition = await this.competitionRepository.findById(input.competitionId);
    if (!competition) {
      throw new CompetitionNotFoundError(input.competitionId);
    }

    const existingResult = await this.resultRepository.findByCompetition(input.competitionId);
    if (existingResult) {
      throw new CompetitionResultsAlreadySubmittedError(input.competitionId);
    }

    competition.updateSlots(input.slots);
    await this.competitionRepository.save(competition);
    return competition;
  }
}
