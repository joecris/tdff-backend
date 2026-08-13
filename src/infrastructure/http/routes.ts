import { Router } from 'express';
import { Container } from '@infrastructure/config/di-container';
import { createUserRouter } from '@modules/user/adapters/inbound/http/user.routes';
import { createGrandTourRouter } from '@modules/grand-tours/adapters/inbound/http/grand-tour.routes';
import { createTeamRouter } from '@modules/teams/adapters/inbound/http/team.routes';
import { createRiderRouter } from '@modules/riders/adapters/inbound/http/rider.routes';
import { createFantasyLeagueRouter } from '@modules/fantasy-leagues/adapters/inbound/http/fantasy-league.routes';
import { createCompetitionRouter } from '@modules/competitions/adapters/inbound/http/competition.routes';

/**
 * Aggregates every module's router under its base path. Add one line here
 * per new module. Double-check the leading `/` on every new mount path —
 * a mount path without it silently 404s instead of erroring at startup.
 */
export function createApiRouter(container: Container): Router {
  const router = Router();

  router.get('/health', (_req, res) => {
    res.status(200).json({ status: 'ok' });
  });

  router.use('/users', createUserRouter(container.user.userController));
  router.use(
    '/grand-tours',
    createGrandTourRouter(
      container.grandTour.grandTourController,
      container.grandTourParticipation.grandTourParticipationController,
    ),
  );
  router.use('/teams', createTeamRouter(container.team.teamController));
  router.use('/riders', createRiderRouter(container.rider.riderController));
  router.use(
    '/fantasy-leagues',
    createFantasyLeagueRouter(
      container.fantasyLeague.fantasyLeagueController,
      container.scoring.scoringController,
    ),
  );
  router.use(
    '/competitions',
    createCompetitionRouter(
      container.competition.competitionController,
      container.scoring.scoringController,
    ),
  );

  return router;
}
