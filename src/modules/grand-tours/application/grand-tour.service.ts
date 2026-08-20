import { GrandTour } from '../domain/entities/grand-tour.entity';
import { GrandTourRepositoryPort } from '../domain/ports/grand-tour-repository.port';
import {
  CreateGrandTourInput,
  GrandTourServicePort,
} from '../domain/ports/grand-tour-service.port';
import { PaginatedResult, PaginationParams } from '@shared/domain/pagination';
import { CreateGrandTourUseCase } from './use-cases/create-grand-tour.usecase';
import { GetGrandTourUseCase } from './use-cases/get-grand-tour.usecase';
import { ListGrandToursUseCase } from './use-cases/list-grand-tours.usecase';

/**
 * Implements the inbound port by delegating to individual use cases.
 * For a small module this facade could be skipped and the controller could
 * call use cases directly — kept here so the module's public surface
 * (`GrandTourServicePort`) stays stable even as use cases are added/split.
 */
export class GrandTourService implements GrandTourServicePort {
  private readonly createGrandTourUseCase: CreateGrandTourUseCase;
  private readonly getGrandTourUseCase: GetGrandTourUseCase;
  private readonly listGrandToursUseCase: ListGrandToursUseCase;

  constructor(grandTourRepository: GrandTourRepositoryPort) {
    this.createGrandTourUseCase = new CreateGrandTourUseCase(grandTourRepository);
    this.getGrandTourUseCase = new GetGrandTourUseCase(grandTourRepository);
    this.listGrandToursUseCase = new ListGrandToursUseCase(grandTourRepository);
  }

  createGrandTour(input: CreateGrandTourInput): Promise<GrandTour> {
    return this.createGrandTourUseCase.execute(input);
  }

  getGrandTourById(id: string): Promise<GrandTour> {
    return this.getGrandTourUseCase.execute(id);
  }

  listGrandTours(params: PaginationParams): Promise<PaginatedResult<GrandTour>> {
    return this.listGrandToursUseCase.execute(params);
  }
}
