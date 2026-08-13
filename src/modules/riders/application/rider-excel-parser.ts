import { z } from 'zod';
import { parseWorksheetRows, ExcelColumn } from '@shared/excel/parse-worksheet';
import { ParseResult, ParsedRow, RowError } from '@shared/excel/bulk-import-result';
import { TeamServicePort } from '@modules/teams/domain/ports/team-service.port';

const riderRowSchema = z.object({
  name: z.string().min(1).max(255),
  nationality: z.string().min(1).max(100).optional(),
  imageUrl: z.url().max(500).optional(),
  type: z.string().min(1).max(50).optional(),
  // Not `teamId` — the sheet carries a human-readable team name, resolved
  // to an id below. Deliberately optional: an unassigned/free-agent rider
  // is a normal row, not an error (mirrors `riders.team_id` being nullable).
  teamName: z.string().min(1).max(255).optional(),
});

type RiderRow = z.infer<typeof riderRowSchema>;

const RIDER_COLUMNS: ExcelColumn<RiderRow>[] = [
  { header: 'Name', field: 'name', required: true },
  { header: 'Nationality', field: 'nationality', required: false },
  { header: 'Image URL', field: 'imageUrl', required: false },
  { header: 'Type', field: 'type', required: false },
  { header: 'Team Name', field: 'teamName', required: false },
];

export interface ResolvedRiderImportRow {
  name: string;
  nationality?: string;
  imageUrl?: string;
  type?: string;
  teamId?: string;
}

/**
 * Two stages: `parseWorksheetRows` handles sheet shape/schema (pure,
 * synchronous-ish), then this function resolves each row's "Team Name"
 * text against the teams module via its inbound `TeamServicePort` — same
 * cross-module dependency rule used everywhere else in this codebase
 * (same-module = repository port, cross-module = service port). An
 * unresolvable team name becomes a row error here, not a crash and not a
 * silently-dropped field — the whole row is excluded from `valid` so a
 * rider never gets imported with the wrong (or no) team by accident.
 */
export async function parseRidersExcel(
  buffer: Buffer,
  teamService: TeamServicePort,
): Promise<ParseResult<ResolvedRiderImportRow>> {
  const { valid: parsedRows, errors } = await parseWorksheetRows(
    buffer,
    riderRowSchema,
    RIDER_COLUMNS,
  );

  const valid: ParsedRow<ResolvedRiderImportRow>[] = [];
  const resolutionErrors: RowError[] = [];

  for (const { row, data } of parsedRows) {
    if (data.teamName === undefined) {
      valid.push({
        row,
        data: {
          name: data.name,
          ...(data.nationality !== undefined ? { nationality: data.nationality } : {}),
          ...(data.imageUrl !== undefined ? { imageUrl: data.imageUrl } : {}),
          ...(data.type !== undefined ? { type: data.type } : {}),
        },
      });
      continue;
    }

    const team = await teamService.getTeamByName(data.teamName);
    if (!team) {
      resolutionErrors.push({ row, message: `Unknown team "${data.teamName}"` });
      continue;
    }

    valid.push({
      row,
      data: {
        name: data.name,
        ...(data.nationality !== undefined ? { nationality: data.nationality } : {}),
        ...(data.imageUrl !== undefined ? { imageUrl: data.imageUrl } : {}),
        ...(data.type !== undefined ? { type: data.type } : {}),
        teamId: team.id,
      },
    });
  }

  return { valid, errors: [...errors, ...resolutionErrors] };
}
