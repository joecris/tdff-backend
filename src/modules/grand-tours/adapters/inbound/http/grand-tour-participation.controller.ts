import { RequestHandler } from 'express';
import { GrandTourParticipationServicePort } from '../../../domain/ports/grand-tour-participation-service.port';
import { AddGrandTourTeamDto } from './dto/add-grand-tour-team.dto';
import { AddGrandTourRiderDto } from './dto/add-grand-tour-rider.dto';
import { toGrandTourTeamResponseDto } from './dto/grand-tour-team-response.dto';
import { toGrandTourRiderResponseDto } from './dto/grand-tour-rider-response.dto';

/**
 * Separate from GrandTourController deliberately — same reasoning as the
 * port split (grand-tour-participation-service.port.ts): start-list
 * management is a distinct concern from grand tour CRUD, even sharing the
 * same URL namespace (`/grand-tours/:id/...`) and router file.
 */
export class GrandTourParticipationController {
  constructor(private readonly participationService: GrandTourParticipationServicePort) {}

  addTeam: RequestHandler = async (req, res, next) => {
    try {
      const dto = req.body as AddGrandTourTeamDto;
      const grandTourTeam = await this.participationService.addTeam({
        grandTourId: req.params.id as string,
        teamId: dto.teamId,
      });
      res.status(201).json(toGrandTourTeamResponseDto(grandTourTeam));
    } catch (err) {
      next(err);
    }
  };

  listTeams: RequestHandler = async (req, res, next) => {
    try {
      const grandTourTeams = await this.participationService.listTeams(req.params.id as string);
      res.status(200).json(grandTourTeams.map(toGrandTourTeamResponseDto));
    } catch (err) {
      next(err);
    }
  };

  addRider: RequestHandler = async (req, res, next) => {
    try {
      const dto = req.body as AddGrandTourRiderDto;
      const grandTourRider = await this.participationService.addRider({
        grandTourId: req.params.id as string,
        riderId: dto.riderId,
      });
      res.status(201).json(toGrandTourRiderResponseDto(grandTourRider));
    } catch (err) {
      next(err);
    }
  };

  listRiders: RequestHandler = async (req, res, next) => {
    try {
      const grandTourRiders = await this.participationService.listRiders(req.params.id as string);
      res.status(200).json(grandTourRiders.map(toGrandTourRiderResponseDto));
    } catch (err) {
      next(err);
    }
  };
}
