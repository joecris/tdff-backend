import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { Workbook } from 'exceljs';
import { ExcelColumn } from '@shared/excel/parse-worksheet';
import { TEAM_COLUMNS } from '@modules/teams/application/team-excel-parser';
import { RIDER_COLUMNS } from '@modules/riders/application/rider-excel-parser';

const SAMPLES_DIR = join(__dirname, '..', '..', '..', 'samples');

/**
 * Repo-maintenance CLI script, not shared library code — lives under
 * `infrastructure/` (same reasoning as `openapi/generate-spec.ts` and
 * `db/seed/index.ts`: a one-off tool with real side effects, unconditional
 * `main()` call, nothing a unit test should be asserting against) rather
 * than `shared/excel/`, which sits inside `vitest.config.mts`'s coverage
 * `include` glob. It lived there briefly and dragged the lines-coverage
 * threshold down by ~77 always-uncovered lines — moving it here is the fix,
 * not adding tests for a script that only makes sense to run by hand.
 *
 * Builds one sample .xlsx from a column list + example rows — headers come
 * straight from `TEAM_COLUMNS`/`RIDER_COLUMNS`, the same arrays
 * `parseWorksheetRows` matches against, so this can never drift out of
 * sync with what `POST /teams/import`/`POST /riders/import` actually
 * accept (see those files' own doc comments on why they're exported).
 */
async function buildTemplate<T extends Record<string, string | undefined>>(
  sheetName: string,
  columns: ExcelColumn<T>[],
  exampleRows: Partial<T>[],
): Promise<Buffer> {
  const workbook = new Workbook();
  const sheet = workbook.addWorksheet(sheetName);

  const headerRow = sheet.addRow(columns.map((c) => c.header));
  headerRow.font = { bold: true };
  headerRow.eachCell((cell) => {
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE8E8E8' } };
  });

  for (const row of exampleRows) {
    sheet.addRow(columns.map((c) => row[c.field] ?? ''));
  }

  columns.forEach((c, i) => {
    const col = sheet.getColumn(i + 1);
    col.width = Math.max(c.header.length + 4, 20);
  });

  const raw = await workbook.xlsx.writeBuffer();
  // Same exceljs `Buffer` typing quirk noted in parse-worksheet.ts.
  return Buffer.from(raw as unknown as Uint8Array);
}

async function main(): Promise<void> {
  const teamsBuffer = await buildTemplate('Teams', TEAM_COLUMNS, [
    { name: 'UAE Team Emirates', logoUrl: 'https://example.com/logos/uae.png' },
    { name: 'Visma | Lease a Bike', logoUrl: 'https://example.com/logos/visma.png' },
    // Logo URL blank on purpose — it's optional; every other column
    // besides Name is optional the same way.
    { name: 'Ineos Grenadiers' },
  ]);
  writeFileSync(join(SAMPLES_DIR, 'teams-import-template.xlsx'), teamsBuffer);
  console.warn('Wrote samples/teams-import-template.xlsx');

  const ridersBuffer = await buildTemplate('Riders', RIDER_COLUMNS, [
    {
      name: 'Tadej Pogačar',
      nationality: 'Slovenia',
      type: 'climber',
      teamName: 'UAE Team Emirates',
    },
    {
      name: 'Jonas Vingegaard',
      nationality: 'Denmark',
      type: 'climber',
      teamName: 'Visma | Lease a Bike',
    },
    // Team Name blank on purpose — an unassigned/free-agent rider is a
    // normal row, not an error; every column besides Name is optional.
    { name: 'Mark Cavendish', nationality: 'Great Britain', type: 'sprinter' },
  ]);
  writeFileSync(join(SAMPLES_DIR, 'riders-import-template.xlsx'), ridersBuffer);
  console.warn('Wrote samples/riders-import-template.xlsx');
}

main();
