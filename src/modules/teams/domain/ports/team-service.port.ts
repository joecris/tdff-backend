import { Team } from '../entities/team.entity';
import { BulkImportResult } from '@shared/excel/bulk-import-result';

export interface CreateTeamInput {
  name: string;
  logoUrl?: string;
}

/**
 * Inbound port. The HTTP controller depends on this interface only;
 * `application/team.service.ts` implements it.
 */
export interface TeamServicePort {
  createTeam(input: CreateTeamInput): Promise<Team>;
  getTeamById(id: string): Promise<Team>;
  /** `null` for no match — see GetTeamByNameUseCase's doc comment for why
   * this one doesn't throw like `getTeamById`. */
  getTeamByName(name: string): Promise<Team | null>;
  bulkImportTeams(fileBuffer: Buffer): Promise<BulkImportResult>;
}
