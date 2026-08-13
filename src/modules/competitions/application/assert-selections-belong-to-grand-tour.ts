import {
  RiderNotInGrandTourError,
  TeamNotInGrandTourError,
} from '../domain/errors/competition.errors';
import { GrandTourParticipationServicePort } from '@modules/grand-tours/domain/ports/grand-tour-participation-service.port';

/**
 * Shared by `SubmitCompetitionEntryUseCase` and `SubmitCompetitionResultsUseCase`
 * — both validate the exact same rule (every picked rider/team must belong
 * to the competition's own grand tour) against the exact same cross-module
 * port, just for a different selection set (a user's entry vs the admin's
 * result). Factored out rather than duplicated once a second caller needed
 * it — same reasoning as `selection-validation.ts`.
 *
 * Parameter type explicitly includes `| undefined` (not plain `?:`) — the
 * real callers pass `CompetitionEntrySelection[]`/`CompetitionResultSelection[]`,
 * whose getters always return `string | undefined` unconditionally, not
 * "present or absent." exactOptionalPropertyTypes distinguishes those two
 * shapes, so a plain `?:` here would reject entity instances.
 */
export async function assertSelectionsBelongToGrandTour(
  selections: Array<{
    grandTourRiderId?: string | undefined;
    grandTourTeamId?: string | undefined;
  }>,
  expectedGrandTourId: string,
  grandTourParticipationService: GrandTourParticipationServicePort,
): Promise<void> {
  for (const selection of selections) {
    if (selection.grandTourRiderId !== undefined) {
      const grandTourRider = await grandTourParticipationService.getGrandTourRiderById(
        selection.grandTourRiderId,
      );
      if (grandTourRider.grandTourId !== expectedGrandTourId) {
        throw new RiderNotInGrandTourError(selection.grandTourRiderId);
      }
    }
    if (selection.grandTourTeamId !== undefined) {
      const grandTourTeam = await grandTourParticipationService.getGrandTourTeamById(
        selection.grandTourTeamId,
      );
      if (grandTourTeam.grandTourId !== expectedGrandTourId) {
        throw new TeamNotInGrandTourError(selection.grandTourTeamId);
      }
    }
  }
}
