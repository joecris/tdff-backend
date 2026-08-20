import { Router } from 'express';
import { validateBody } from '@infrastructure/http/middlewares/validate.middleware';
import { validateQuery } from '@infrastructure/http/middlewares/validate-query.middleware';
import { requireRole } from '@infrastructure/http/middlewares/require-role.middleware';
import { paginationQuerySchema } from '@shared/http/pagination.dto';
import { FantasyLeagueController } from './fantasy-league.controller';
import { ScoringController } from '@modules/scoring/adapters/inbound/http/scoring.controller';
import { createFantasyLeagueSchema } from './dto/create-fantasy-league.dto';

export function createFantasyLeagueRouter(
  controller: FantasyLeagueController,
  scoringController: ScoringController,
): Router {
  const router = Router();

  router.post(
    '/',
    requireRole('admin'),
    validateBody(createFantasyLeagueSchema),
    controller.create,
  );
  router.get('/', validateQuery(paginationQuerySchema), controller.list);
  router.get('/:id', controller.getById);

  // Open to any authenticated user in v1 — no invite code or capacity cap
  // (see the plan's "Fantasy league visibility" default).
  router.post('/:id/join', controller.join);
  router.get('/:id/members', controller.listMembers);
  router.get('/:id/leaderboard', scoringController.getLeaderboard);

  return router;
}
