import { RequestHandler } from 'express';
import { FantasyLeagueServicePort } from '../../../domain/ports/fantasy-league-service.port';
import { UnauthorizedError } from '@shared/errors/app-error';
import { CreateFantasyLeagueDto } from './dto/create-fantasy-league.dto';
import { toFantasyLeagueResponseDto } from './dto/fantasy-league-response.dto';
import { toFantasyLeagueMemberResponseDto } from './dto/fantasy-league-member-response.dto';

export class FantasyLeagueController {
  constructor(private readonly fantasyLeagueService: FantasyLeagueServicePort) {}

  create: RequestHandler = async (req, res, next) => {
    try {
      const dto = req.body as CreateFantasyLeagueDto;
      const fantasyLeague = await this.fantasyLeagueService.createFantasyLeague({
        name: dto.name,
        grandTourId: dto.grandTourId,
        ...(dto.description !== undefined ? { description: dto.description } : {}),
        ...(dto.startDate !== undefined ? { startDate: dto.startDate } : {}),
        ...(dto.endDate !== undefined ? { endDate: dto.endDate } : {}),
      });
      res.status(201).json(toFantasyLeagueResponseDto(fantasyLeague));
    } catch (err) {
      next(err);
    }
  };

  getById: RequestHandler = async (req, res, next) => {
    try {
      const fantasyLeague = await this.fantasyLeagueService.getFantasyLeagueById(
        req.params.id as string,
      );
      res.status(200).json(toFantasyLeagueResponseDto(fantasyLeague));
    } catch (err) {
      next(err);
    }
  };

  // No request body — the joining user comes from the authenticated
  // principal (`requireRole`-style middlewares run before this one
  // attaches `req.auth`), never from a client-supplied field, so a caller
  // can never join a league "as" someone else.
  join: RequestHandler = async (req, res, next) => {
    try {
      if (!req.auth) {
        throw new UnauthorizedError('No authenticated principal on request');
      }
      const member = await this.fantasyLeagueService.joinFantasyLeague({
        fantasyLeagueId: req.params.id as string,
        userId: req.auth.userId,
      });
      res.status(201).json(toFantasyLeagueMemberResponseDto(member));
    } catch (err) {
      next(err);
    }
  };

  listMembers: RequestHandler = async (req, res, next) => {
    try {
      const members = await this.fantasyLeagueService.listMembers(req.params.id as string);
      res.status(200).json(members.map(toFantasyLeagueMemberResponseDto));
    } catch (err) {
      next(err);
    }
  };
}
