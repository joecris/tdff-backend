import { RequestHandler } from 'express';
import { RiderServicePort } from '../../../domain/ports/rider-service.port';
import { ValidationError } from '@shared/errors/app-error';
import { PaginationParams } from '@shared/domain/pagination';
import { CreateRiderDto } from './dto/create-rider.dto';
import { toRiderResponseDto, toPaginatedRiderResponseDto } from './dto/rider-response.dto';

export class RiderController {
  constructor(private readonly riderService: RiderServicePort) {}

  create: RequestHandler = async (req, res, next) => {
    try {
      const dto = req.body as CreateRiderDto;
      const rider = await this.riderService.createRider({
        name: dto.name,
        ...(dto.nationality !== undefined ? { nationality: dto.nationality } : {}),
        ...(dto.imageUrl !== undefined ? { imageUrl: dto.imageUrl } : {}),
        ...(dto.type !== undefined ? { type: dto.type } : {}),
        ...(dto.teamId !== undefined ? { teamId: dto.teamId } : {}),
      });
      res.status(201).json(toRiderResponseDto(rider));
    } catch (err) {
      next(err);
    }
  };

  getById: RequestHandler = async (req, res, next) => {
    try {
      const rider = await this.riderService.getRiderById(req.params.id as string);
      res.status(200).json(toRiderResponseDto(rider));
    } catch (err) {
      next(err);
    }
  };

  list: RequestHandler = async (req, res, next) => {
    try {
      const result = await this.riderService.listRiders(req.pagination as PaginationParams);
      res.status(200).json(toPaginatedRiderResponseDto(result));
    } catch (err) {
      next(err);
    }
  };

  bulkImport: RequestHandler = async (req, res, next) => {
    try {
      if (!req.file) {
        throw new ValidationError('No file uploaded — expected a multipart field named "file"');
      }
      const result = await this.riderService.bulkImportRiders(req.file.buffer);
      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  };
}
