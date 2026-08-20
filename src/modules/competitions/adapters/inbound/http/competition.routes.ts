import { Router } from 'express';
import { validateBody } from '@infrastructure/http/middlewares/validate.middleware';
import { requireRole } from '@infrastructure/http/middlewares/require-role.middleware';
import { CompetitionController } from './competition.controller';
import { ScoringController } from '@modules/scoring/adapters/inbound/http/scoring.controller';
import { createCompetitionSchema } from './dto/create-competition.dto';
import { updateCompetitionSlotsSchema } from './dto/update-competition-slots.dto';
import { updateCompetitionDetailsSchema } from './dto/update-competition-details.dto';
import { submitCompetitionEntrySchema } from './dto/submit-competition-entry.dto';
import { submitCompetitionResultsSchema } from './dto/submit-competition-results.dto';

export function createCompetitionRouter(
  controller: CompetitionController,
  scoringController: ScoringController,
): Router {
  const router = Router();

  router.post('/', requireRole('admin'), validateBody(createCompetitionSchema), controller.create);
  router.get('/:id', controller.getById);
  // Cosmetic details only (currently just imageUrl) — never blocked by an
  // existing result, unlike /slots below.
  router.put(
    '/:id',
    requireRole('admin'),
    validateBody(updateCompetitionDetailsSchema),
    controller.updateDetails,
  );
  // Reshaping required slots/points — rejected once a result exists (see
  // UpdateCompetitionSlotsUseCase).
  router.put(
    '/:id/slots',
    requireRole('admin'),
    validateBody(updateCompetitionSlotsSchema),
    controller.updateSlots,
  );

  // Submitting user comes from req.auth, so no requireRole needed — any
  // authenticated caller may submit/replace their own entry.
  router.post('/:id/entries', validateBody(submitCompetitionEntrySchema), controller.submitEntry);
  router.get('/:id/entries/me', controller.getMyEntry);
  // Seeing everyone's picks before results are locked is admin-only —
  // avoids leaking other users' selections while entries are still open.
  router.get('/:id/entries', requireRole('admin'), controller.listEntries);

  // Admin declares the outcome; triggers score recalculation internally
  // (see SubmitCompetitionResultsUseCase) — the route itself knows nothing
  // about scoring.
  router.post(
    '/:id/results',
    requireRole('admin'),
    validateBody(submitCompetitionResultsSchema),
    controller.submitResults,
  );

  // Scores are public once computed — unlike raw entries (which stay
  // admin-only while still open), seeing how you scored is the point of a
  // fantasy competition, not a spoiler.
  router.get('/:id/scores', scoringController.listScores);

  return router;
}
