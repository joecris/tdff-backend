import { RequestHandler } from 'express';
import { CompetitionServicePort } from '../../../domain/ports/competition-service.port';
import { UnauthorizedError } from '@shared/errors/app-error';
import { PaginationParams } from '@shared/domain/pagination';
import { CreateCompetitionDto } from './dto/create-competition.dto';
import { UpdateCompetitionSlotsDto } from './dto/update-competition-slots.dto';
import { UpdateCompetitionDetailsDto } from './dto/update-competition-details.dto';
import { SubmitCompetitionEntryDto } from './dto/submit-competition-entry.dto';
import { SubmitCompetitionResultsDto } from './dto/submit-competition-results.dto';
import {
  toCompetitionResponseDto,
  toPaginatedCompetitionResponseDto,
} from './dto/competition-response.dto';
import { toCompetitionEntryResponseDto } from './dto/competition-entry-response.dto';
import { toCompetitionResultResponseDto } from './dto/competition-result-response.dto';

export class CompetitionController {
  constructor(private readonly competitionService: CompetitionServicePort) {}

  create: RequestHandler = async (req, res, next) => {
    try {
      const dto = req.body as CreateCompetitionDto;
      const competition = await this.competitionService.createCompetition({
        name: dto.name,
        type: dto.type,
        fantasyLeagueId: dto.fantasyLeagueId,
        slots: dto.slots,
        ...(dto.description !== undefined ? { description: dto.description } : {}),
        ...(dto.imageUrl !== undefined ? { imageUrl: dto.imageUrl } : {}),
        ...(dto.entryLockAt !== undefined ? { entryLockAt: dto.entryLockAt } : {}),
      });
      res.status(201).json(toCompetitionResponseDto(competition));
    } catch (err) {
      next(err);
    }
  };

  getById: RequestHandler = async (req, res, next) => {
    try {
      const competition = await this.competitionService.getCompetitionById(req.params.id as string);
      res.status(200).json(toCompetitionResponseDto(competition));
    } catch (err) {
      next(err);
    }
  };

  list: RequestHandler = async (req, res, next) => {
    try {
      const result = await this.competitionService.listCompetitions(
        req.pagination as PaginationParams,
      );
      res.status(200).json(toPaginatedCompetitionResponseDto(result));
    } catch (err) {
      next(err);
    }
  };

  updateSlots: RequestHandler = async (req, res, next) => {
    try {
      const dto = req.body as UpdateCompetitionSlotsDto;
      const competition = await this.competitionService.updateCompetitionSlots({
        competitionId: req.params.id as string,
        slots: dto.slots,
      });
      res.status(200).json(toCompetitionResponseDto(competition));
    } catch (err) {
      next(err);
    }
  };

  updateDetails: RequestHandler = async (req, res, next) => {
    try {
      const dto = req.body as UpdateCompetitionDetailsDto;
      const competition = await this.competitionService.updateCompetitionDetails({
        competitionId: req.params.id as string,
        ...(dto.imageUrl !== undefined ? { imageUrl: dto.imageUrl } : {}),
      });
      res.status(200).json(toCompetitionResponseDto(competition));
    } catch (err) {
      next(err);
    }
  };

  // The submitting user comes from the authenticated principal, never a
  // body field — same reasoning as FantasyLeagueController.join.
  submitEntry: RequestHandler = async (req, res, next) => {
    try {
      if (!req.auth) {
        throw new UnauthorizedError('No authenticated principal on request');
      }
      const dto = req.body as SubmitCompetitionEntryDto;
      const entry = await this.competitionService.submitEntry({
        competitionId: req.params.id as string,
        userId: req.auth.userId,
        // Zod's `.optional()` infers `T | undefined` explicitly; the
        // service input uses plain `?:` — same conditional-spread-per-item
        // mapping used everywhere else in this codebase for that mismatch.
        selections: dto.selections.map((s) => ({
          slot: s.slot,
          ...(s.grandTourRiderId !== undefined ? { grandTourRiderId: s.grandTourRiderId } : {}),
          ...(s.grandTourTeamId !== undefined ? { grandTourTeamId: s.grandTourTeamId } : {}),
        })),
      });
      res.status(200).json(toCompetitionEntryResponseDto(entry));
    } catch (err) {
      next(err);
    }
  };

  getMyEntry: RequestHandler = async (req, res, next) => {
    try {
      if (!req.auth) {
        throw new UnauthorizedError('No authenticated principal on request');
      }
      const entry = await this.competitionService.getMyEntry(
        req.params.id as string,
        req.auth.userId,
      );
      res.status(200).json(toCompetitionEntryResponseDto(entry));
    } catch (err) {
      next(err);
    }
  };

  listEntries: RequestHandler = async (req, res, next) => {
    try {
      const entries = await this.competitionService.listEntries(req.params.id as string);
      res.status(200).json(entries.map(toCompetitionEntryResponseDto));
    } catch (err) {
      next(err);
    }
  };

  // The submitting admin comes from the authenticated principal, same
  // reasoning as submitEntry — never a body field.
  submitResults: RequestHandler = async (req, res, next) => {
    try {
      if (!req.auth) {
        throw new UnauthorizedError('No authenticated principal on request');
      }
      const dto = req.body as SubmitCompetitionResultsDto;
      const result = await this.competitionService.submitResults({
        competitionId: req.params.id as string,
        submittedByUserId: req.auth.userId,
        selections: dto.selections.map((s) => ({
          slot: s.slot,
          ...(s.grandTourRiderId !== undefined ? { grandTourRiderId: s.grandTourRiderId } : {}),
          ...(s.grandTourTeamId !== undefined ? { grandTourTeamId: s.grandTourTeamId } : {}),
        })),
      });
      res.status(200).json(toCompetitionResultResponseDto(result));
    } catch (err) {
      next(err);
    }
  };
}
