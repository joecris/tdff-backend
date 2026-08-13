import { NotFoundError } from '@shared/errors/app-error';

/**
 * Defensive only — in practice `recalculateCompetitionScores` is always
 * called right after `SubmitCompetitionResultsUseCase` has already
 * confirmed the competition exists, so this is never expected to fire from
 * the real trigger path. Guards a future caller that invokes recalculation
 * directly without that upstream check.
 */
export class ScoringContextNotFoundError extends NotFoundError {
  constructor(competitionId: string) {
    super(`No competition found with id "${competitionId}" to recalculate scores for`);
  }
}
