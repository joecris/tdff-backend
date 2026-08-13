import { randomUUID } from 'node:crypto';
import { CompetitionResult } from '../../domain/entities/competition-result.entity';
import { SelectionInput } from '../../domain/entities/competition-entry.entity';
import { CompetitionResultRepositoryPort } from '../../domain/ports/competition-result-repository.port';
import { CompetitionRepositoryPort } from '../../domain/ports/competition-repository.port';
import { SubmitCompetitionResultsInput } from '../../domain/ports/competition-service.port';
import { CompetitionNotFoundError } from '../../domain/errors/competition.errors';
import { assertSelectionsBelongToGrandTour } from '../assert-selections-belong-to-grand-tour';
import { UserServicePort } from '@modules/user/domain/ports/user-service.port';
import { FantasyLeagueServicePort } from '@modules/fantasy-leagues/domain/ports/fantasy-league-service.port';
import { GrandTourParticipationServicePort } from '@modules/grand-tours/domain/ports/grand-tour-participation-service.port';
import { ScoringServicePort } from '@modules/scoring/domain/ports/scoring-service.port';

/**
 * Admin-only upsert (full-replace on resubmit — see
 * `CompetitionResult.updateSelections`), structurally the same validation
 * chain as `SubmitCompetitionEntryUseCase` (shares
 * `assertSelectionsBelongToGrandTour`), plus one more step: after
 * persisting, it triggers `scoringService.recalculateCompetitionScores`.
 * That trigger is *inside* this use case, not in the controller — the
 * controller doesn't (and shouldn't) know recalculation exists.
 */
export class SubmitCompetitionResultsUseCase {
  constructor(
    private readonly resultRepository: CompetitionResultRepositoryPort,
    private readonly competitionRepository: CompetitionRepositoryPort,
    private readonly userService: UserServicePort,
    private readonly fantasyLeagueService: FantasyLeagueServicePort,
    private readonly grandTourParticipationService: GrandTourParticipationServicePort,
    private readonly scoringService: ScoringServicePort,
  ) {}

  async execute(input: SubmitCompetitionResultsInput): Promise<CompetitionResult> {
    const competition = await this.competitionRepository.findById(input.competitionId);
    if (!competition) {
      throw new CompetitionNotFoundError(input.competitionId);
    }

    if (input.submittedByUserId !== undefined) {
      await this.userService.getUserById(input.submittedByUserId);
    }

    const requiredSlots = competition.requiredSlots;
    const selectionInputs: SelectionInput[] = input.selections.map((s) => ({
      id: randomUUID(),
      slot: s.slot,
      ...(s.grandTourRiderId !== undefined ? { grandTourRiderId: s.grandTourRiderId } : {}),
      ...(s.grandTourTeamId !== undefined ? { grandTourTeamId: s.grandTourTeamId } : {}),
    }));

    const existing = await this.resultRepository.findByCompetition(input.competitionId);

    let result: CompetitionResult;
    if (existing) {
      existing.updateSelections(selectionInputs, requiredSlots, input.submittedByUserId);
      result = existing;
    } else {
      result = CompetitionResult.create({
        id: randomUUID(),
        competitionId: input.competitionId,
        ...(input.submittedByUserId !== undefined
          ? { submittedByUserId: input.submittedByUserId }
          : {}),
        selections: selectionInputs,
        requiredSlots,
      });
    }

    const fantasyLeague = await this.fantasyLeagueService.getFantasyLeagueById(
      competition.fantasyLeagueId,
    );
    await assertSelectionsBelongToGrandTour(
      result.selections,
      fantasyLeague.grandTourId,
      this.grandTourParticipationService,
    );

    await this.resultRepository.save(result);
    await this.scoringService.recalculateCompetitionScores(input.competitionId);

    return result;
  }
}
