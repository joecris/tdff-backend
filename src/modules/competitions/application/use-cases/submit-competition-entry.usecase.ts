import { randomUUID } from 'node:crypto';
import { CompetitionEntry, SelectionInput } from '../../domain/entities/competition-entry.entity';
import { CompetitionEntryRepositoryPort } from '../../domain/ports/competition-entry-repository.port';
import { CompetitionRepositoryPort } from '../../domain/ports/competition-repository.port';
import { SubmitCompetitionEntryInput } from '../../domain/ports/competition-service.port';
import { CompetitionNotFoundError } from '../../domain/errors/competition.errors';
import { assertSelectionsBelongToGrandTour } from '../assert-selections-belong-to-grand-tour';
import { UserServicePort } from '@modules/user/domain/ports/user-service.port';
import { FantasyLeagueServicePort } from '@modules/fantasy-leagues/domain/ports/fantasy-league-service.port';
import { GrandTourParticipationServicePort } from '@modules/grand-tours/domain/ports/grand-tour-participation-service.port';

/**
 * Upsert: creates the user's first entry into this competition, or
 * fully replaces their existing one (see `CompetitionEntry.updateSelections`
 * — full-replace, not merge). One entry per user per competition, per the
 * plan's decision #4; enforced both here (find-then-update-or-create) and
 * by the DB's unique index as a backstop.
 *
 * Cross-module chain, deepest in the codebase so far:
 *   competition.fantasyLeagueId -> fantasyLeagueService.getFantasyLeagueById
 *     -> .grandTourId, then per selection ->
 *   grandTourParticipationService.getGrandTourTeamById/getGrandTourRiderById
 *     -> confirm it belongs to that same grand tour (see
 *   assert-selections-belong-to-grand-tour.ts, shared with
 *   SubmitCompetitionResultsUseCase which needs the identical check).
 * Structural checks (slot completeness, exactly-one-pick per slot) run
 * first via the entity, synchronously, before any of these async
 * cross-module round trips — cheap validation fails fast before expensive.
 */
export class SubmitCompetitionEntryUseCase {
  constructor(
    private readonly entryRepository: CompetitionEntryRepositoryPort,
    private readonly competitionRepository: CompetitionRepositoryPort,
    private readonly userService: UserServicePort,
    private readonly fantasyLeagueService: FantasyLeagueServicePort,
    private readonly grandTourParticipationService: GrandTourParticipationServicePort,
  ) {}

  async execute(input: SubmitCompetitionEntryInput): Promise<CompetitionEntry> {
    const competition = await this.competitionRepository.findById(input.competitionId);
    if (!competition) {
      throw new CompetitionNotFoundError(input.competitionId);
    }

    await this.userService.getUserById(input.userId);

    const requiredSlots = competition.requiredSlots;
    const selectionInputs: SelectionInput[] = input.selections.map((s) => ({
      id: randomUUID(),
      slot: s.slot,
      ...(s.grandTourRiderId !== undefined ? { grandTourRiderId: s.grandTourRiderId } : {}),
      ...(s.grandTourTeamId !== undefined ? { grandTourTeamId: s.grandTourTeamId } : {}),
    }));

    const existing = await this.entryRepository.findByCompetitionAndUser(
      input.competitionId,
      input.userId,
    );

    // Structural validation (slot completeness, exactly-one-pick) happens
    // synchronously inside create()/updateSelections() before we spend any
    // async round trips on the grand-tour-membership checks below.
    let entry: CompetitionEntry;
    if (existing) {
      existing.updateSelections(selectionInputs, requiredSlots);
      entry = existing;
    } else {
      entry = CompetitionEntry.create({
        id: randomUUID(),
        competitionId: input.competitionId,
        userId: input.userId,
        selections: selectionInputs,
        requiredSlots,
      });
    }

    const fantasyLeague = await this.fantasyLeagueService.getFantasyLeagueById(
      competition.fantasyLeagueId,
    );
    await assertSelectionsBelongToGrandTour(
      entry.selections,
      fantasyLeague.grandTourId,
      this.grandTourParticipationService,
    );

    await this.entryRepository.save(entry);
    return entry;
  }
}
