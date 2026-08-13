import { randomUUID } from 'node:crypto';
import { Rider } from '../../domain/entities/rider.entity';
import { RiderRepositoryPort } from '../../domain/ports/rider-repository.port';
import { TeamServicePort } from '@modules/teams/domain/ports/team-service.port';
import { parseRidersExcel } from '../rider-excel-parser';
import { BulkImportResult } from '@shared/excel/bulk-import-result';

/**
 * Same best-effort/partial-success + match-by-name-to-reconcile shape as
 * `BulkImportTeamsUseCase` — see its doc comment. `teamService` is only
 * threaded through to the parser (for "Team Name" resolution); this use
 * case itself never touches the teams module's repository, same
 * same-module-repository / cross-module-service-port rule as
 * `CreateRiderUseCase`.
 */
export class BulkImportRidersUseCase {
  constructor(
    private readonly riderRepository: RiderRepositoryPort,
    private readonly teamService: TeamServicePort,
  ) {}

  async execute(fileBuffer: Buffer): Promise<BulkImportResult> {
    const { valid, errors } = await parseRidersExcel(fileBuffer, this.teamService);

    let created = 0;
    let updated = 0;

    for (const { data: row } of valid) {
      const existing = await this.riderRepository.findByName(row.name);
      if (existing) {
        existing.updateDetails({
          ...(row.nationality !== undefined ? { nationality: row.nationality } : {}),
          ...(row.imageUrl !== undefined ? { imageUrl: row.imageUrl } : {}),
          ...(row.type !== undefined ? { type: row.type } : {}),
          ...(row.teamId !== undefined ? { teamId: row.teamId } : {}),
        });
        await this.riderRepository.save(existing);
        updated += 1;
      } else {
        const rider = Rider.create({
          id: randomUUID(),
          name: row.name,
          ...(row.nationality !== undefined ? { nationality: row.nationality } : {}),
          ...(row.imageUrl !== undefined ? { imageUrl: row.imageUrl } : {}),
          ...(row.type !== undefined ? { type: row.type } : {}),
          ...(row.teamId !== undefined ? { teamId: row.teamId } : {}),
        });
        await this.riderRepository.save(rider);
        created += 1;
      }
    }

    return { created, updated, errors };
  }
}
