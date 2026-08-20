import { Rider } from '../domain/entities/rider.entity';
import { RiderRepositoryPort } from '../domain/ports/rider-repository.port';
import { CreateRiderInput, RiderServicePort } from '../domain/ports/rider-service.port';
import { TeamServicePort } from '@modules/teams/domain/ports/team-service.port';
import { BulkImportResult } from '@shared/excel/bulk-import-result';
import { PaginatedResult, PaginationParams } from '@shared/domain/pagination';
import { CreateRiderUseCase } from './use-cases/create-rider.usecase';
import { GetRiderUseCase } from './use-cases/get-rider.usecase';
import { ListRidersUseCase } from './use-cases/list-riders.usecase';
import { BulkImportRidersUseCase } from './use-cases/bulk-import-riders.usecase';

export class RiderService implements RiderServicePort {
  private readonly createRiderUseCase: CreateRiderUseCase;
  private readonly getRiderUseCase: GetRiderUseCase;
  private readonly listRidersUseCase: ListRidersUseCase;
  private readonly bulkImportRidersUseCase: BulkImportRidersUseCase;

  constructor(riderRepository: RiderRepositoryPort, teamService: TeamServicePort) {
    this.createRiderUseCase = new CreateRiderUseCase(riderRepository, teamService);
    this.getRiderUseCase = new GetRiderUseCase(riderRepository);
    this.listRidersUseCase = new ListRidersUseCase(riderRepository);
    this.bulkImportRidersUseCase = new BulkImportRidersUseCase(riderRepository, teamService);
  }

  createRider(input: CreateRiderInput): Promise<Rider> {
    return this.createRiderUseCase.execute(input);
  }

  getRiderById(id: string): Promise<Rider> {
    return this.getRiderUseCase.execute(id);
  }

  listRiders(params: PaginationParams): Promise<PaginatedResult<Rider>> {
    return this.listRidersUseCase.execute(params);
  }

  bulkImportRiders(fileBuffer: Buffer): Promise<BulkImportResult> {
    return this.bulkImportRidersUseCase.execute(fileBuffer);
  }
}
