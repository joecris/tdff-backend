import { Router } from 'express';
import { validateBody } from '@infrastructure/http/middlewares/validate.middleware';
import { requireRole } from '@infrastructure/http/middlewares/require-role.middleware';
import { GrandTourController } from './grand-tour.controller';
import { GrandTourParticipationController } from './grand-tour-participation.controller';
import { createGrandTourSchema } from './dto/create-grand-tour.dto';
import { addGrandTourTeamSchema } from './dto/add-grand-tour-team.dto';
import { addGrandTourRiderSchema } from './dto/add-grand-tour-rider.dto';

export function createGrandTourRouter(
  controller: GrandTourController,
  participationController: GrandTourParticipationController,
): Router {
  const router = Router();

  // Retrofitted admin gate — this predates the auth seam (Phase 1) and was
  // left open; grand tour setup belongs in the same "admin manages" bucket
  // as the start-list routes right below it.
  router.post('/', requireRole('admin'), validateBody(createGrandTourSchema), controller.create);
  router.get('/:id', controller.getById);

  router.post(
    '/:id/teams',
    requireRole('admin'),
    validateBody(addGrandTourTeamSchema),
    participationController.addTeam,
  );
  router.get('/:id/teams', participationController.listTeams);

  router.post(
    '/:id/riders',
    requireRole('admin'),
    validateBody(addGrandTourRiderSchema),
    participationController.addRider,
  );
  router.get('/:id/riders', participationController.listRiders);

  return router;
}
