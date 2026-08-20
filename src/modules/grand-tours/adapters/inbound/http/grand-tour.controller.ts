import { RequestHandler } from 'express';
import { GrandTourServicePort } from '../../../domain/ports/grand-tour-service.port';
import { PaginationParams } from '@shared/domain/pagination';
import { CreateGrandTourDto } from './dto/create-grand-tour.dto';
import {
  toGrandTourResponseDto,
  toPaginatedGrandTourResponseDto,
} from './dto/grand-tour-response.dto';

/**
 * Inbound HTTP adapter. Depends only on the GrandTourServicePort interface —
 * knows nothing about Drizzle or how the use cases are implemented.
 * Translates HTTP <-> domain calls; no business logic lives here.
 */
export class GrandTourController {
  constructor(private readonly grandTourService: GrandTourServicePort) {}

  create: RequestHandler = async (req, res, next) => {
    try {
      const dto = req.body as CreateGrandTourDto;
      const grandTour = await this.grandTourService.createGrandTour({
        name: dto.name,
        // Zod's `.optional()` infers `T | undefined` explicitly; the domain
        // input type uses plain `?:` — exactOptionalPropertyTypes treats
        // those as distinct, so map through rather than pass `dto` as-is.
        ...(dto.description !== undefined ? { description: dto.description } : {}),
        ...(dto.startDate !== undefined ? { startDate: dto.startDate } : {}),
        ...(dto.endDate !== undefined ? { endDate: dto.endDate } : {}),
      });
      res.status(201).json(toGrandTourResponseDto(grandTour));
    } catch (err) {
      next(err);
    }
  };

  getById: RequestHandler = async (req, res, next) => {
    try {
      const grandTour = await this.grandTourService.getGrandTourById(req.params.id as string);
      res.status(200).json(toGrandTourResponseDto(grandTour));
    } catch (err) {
      next(err);
    }
  };

  list: RequestHandler = async (req, res, next) => {
    try {
      const result = await this.grandTourService.listGrandTours(req.pagination as PaginationParams);
      res.status(200).json(toPaginatedGrandTourResponseDto(result));
    } catch (err) {
      next(err);
    }
  };
}
