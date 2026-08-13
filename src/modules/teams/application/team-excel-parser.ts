import { z } from 'zod';
import { parseWorksheetRows, ExcelColumn } from '@shared/excel/parse-worksheet';
import { ParseResult } from '@shared/excel/bulk-import-result';

const teamRowSchema = z.object({
  name: z.string().min(1).max(255),
  logoUrl: z.url().max(500).optional(),
});

export type TeamImportRow = z.infer<typeof teamRowSchema>;

const TEAM_COLUMNS: ExcelColumn<TeamImportRow>[] = [
  { header: 'Name', field: 'name', required: true },
  { header: 'Logo URL', field: 'logoUrl', required: false },
];

/**
 * Teams have no cross-module reference to resolve (unlike riders' "Team
 * Name" column), so this is a thin, dependency-free wrapper around the
 * generic parser — no class, no DI, just a function.
 */
export function parseTeamsExcel(buffer: Buffer): Promise<ParseResult<TeamImportRow>> {
  return parseWorksheetRows(buffer, teamRowSchema, TEAM_COLUMNS);
}
