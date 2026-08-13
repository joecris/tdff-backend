import { RequestHandler } from 'express';
import { TeamServicePort } from '../../../domain/ports/team-service.port';
import { ValidationError } from '@shared/errors/app-error';
import { CreateTeamDto } from './dto/create-team.dto';
import { toTeamResponseDto } from './dto/team-response.dto';

export class TeamController {
  constructor(private readonly teamService: TeamServicePort) {}

  create: RequestHandler = async (req, res, next) => {
    try {
      const dto = req.body as CreateTeamDto;
      const team = await this.teamService.createTeam({
        name: dto.name,
        // Zod's `.optional()` infers `T | undefined` explicitly; the
        // service input uses plain `?:` — exactOptionalPropertyTypes
        // treats those as distinct, so map through rather than pass as-is.
        ...(dto.logoUrl !== undefined ? { logoUrl: dto.logoUrl } : {}),
      });
      res.status(201).json(toTeamResponseDto(team));
    } catch (err) {
      next(err);
    }
  };

  getById: RequestHandler = async (req, res, next) => {
    try {
      const team = await this.teamService.getTeamById(req.params.id as string);
      res.status(200).json(toTeamResponseDto(team));
    } catch (err) {
      next(err);
    }
  };

  bulkImport: RequestHandler = async (req, res, next) => {
    try {
      if (!req.file) {
        throw new ValidationError('No file uploaded — expected a multipart field named "file"');
      }
      const result = await this.teamService.bulkImportTeams(req.file.buffer);
      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  };
}
