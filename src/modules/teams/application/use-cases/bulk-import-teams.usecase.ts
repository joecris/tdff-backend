import { randomUUID } from 'node:crypto';
import { Team } from '../../domain/entities/team.entity';
import { TeamRepositoryPort } from '../../domain/ports/team-repository.port';
import { parseTeamsExcel } from '../team-excel-parser';
import { BulkImportResult } from '@shared/excel/bulk-import-result';

/**
 * Best-effort/partial-success (per the plan) — a bad row is reported and
 * skipped, it never aborts the whole import. Matches by exact `name`
 * string (there's no DB uniqueness on `teams.name` — see
 * team-repository.port.ts) rather than blindly inserting: re-running the
 * same import file twice reconciles existing teams (updates `logoUrl`)
 * instead of creating duplicates every time.
 */
export class BulkImportTeamsUseCase {
  constructor(private readonly teamRepository: TeamRepositoryPort) {}

  async execute(fileBuffer: Buffer): Promise<BulkImportResult> {
    const { valid, errors } = await parseTeamsExcel(fileBuffer);

    let created = 0;
    let updated = 0;

    for (const { data: row } of valid) {
      const existing = await this.teamRepository.findByName(row.name);
      if (existing) {
        existing.updateDetails({
          ...(row.logoUrl !== undefined ? { logoUrl: row.logoUrl } : {}),
        });
        await this.teamRepository.save(existing);
        updated += 1;
      } else {
        const team = Team.create({
          id: randomUUID(),
          name: row.name,
          ...(row.logoUrl !== undefined ? { logoUrl: row.logoUrl } : {}),
        });
        await this.teamRepository.save(team);
        created += 1;
      }
    }

    return { created, updated, errors };
  }
}
