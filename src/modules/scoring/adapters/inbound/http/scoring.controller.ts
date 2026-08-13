import { RequestHandler } from 'express';
import { ScoringServicePort } from '../../../domain/ports/scoring-service.port';
import { toLeaderboardEntryResponseDto } from './dto/leaderboard-response.dto';
import { toCompetitionScoreResponseDto } from './dto/competition-score-response.dto';

/**
 * Mounted onto two OTHER modules' routers (`/fantasy-leagues/:id/leaderboard`,
 * `/competitions/:id/scores`), not its own `/scoring` namespace — these
 * reads are naturally sub-resources of a league/competition from the API's
 * point of view, even though the underlying computation lives in this
 * module. Same pattern as `GrandTourParticipationController` being mounted
 * onto `grand-tour.routes.ts`.
 */
export class ScoringController {
  constructor(private readonly scoringService: ScoringServicePort) {}

  getLeaderboard: RequestHandler = async (req, res, next) => {
    try {
      const leaderboard = await this.scoringService.getLeaderboard(req.params.id as string);
      res.status(200).json(leaderboard.map(toLeaderboardEntryResponseDto));
    } catch (err) {
      next(err);
    }
  };

  listScores: RequestHandler = async (req, res, next) => {
    try {
      const scores = await this.scoringService.listScoresByCompetition(req.params.id as string);
      res.status(200).json(scores.map(toCompetitionScoreResponseDto));
    } catch (err) {
      next(err);
    }
  };
}
