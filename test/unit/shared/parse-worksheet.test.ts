import { describe, it, expect } from 'vitest';
import { z } from 'zod';
import { parseWorksheetRows, ExcelColumn } from '@shared/excel/parse-worksheet';
import { buildWorkbookBuffer } from './build-workbook';

const rowSchema = z.object({
  name: z.string().min(1).max(255),
  logoUrl: z.url().max(500).optional(),
});
type Row = z.infer<typeof rowSchema>;

const COLUMNS: ExcelColumn<Row>[] = [
  { header: 'Name', field: 'name', required: true },
  { header: 'Logo URL', field: 'logoUrl', required: false },
];

describe('parseWorksheetRows', () => {
  it('parses valid rows, in order, with their sheet row numbers', async () => {
    const buffer = await buildWorkbookBuffer(
      ['Name', 'Logo URL'],
      [
        ['UAE Team Emirates', 'https://example.com/uae.png'],
        ['Visma | Lease a Bike', undefined],
      ],
    );

    const result = await parseWorksheetRows(buffer, rowSchema, COLUMNS);

    expect(result.errors).toEqual([]);
    expect(result.valid).toEqual([
      { row: 2, data: { name: 'UAE Team Emirates', logoUrl: 'https://example.com/uae.png' } },
      { row: 3, data: { name: 'Visma | Lease a Bike' } },
    ]);
  });

  it('is case-insensitive and trims header/column matching', async () => {
    const buffer = await buildWorkbookBuffer(
      ['  name  ', 'LOGO URL'],
      [['UAE Team Emirates', ' ']],
    );

    const result = await parseWorksheetRows(buffer, rowSchema, COLUMNS);

    expect(result.errors).toEqual([]);
    expect(result.valid).toEqual([{ row: 2, data: { name: 'UAE Team Emirates' } }]);
  });

  it('skips a fully blank row without treating it as an error', async () => {
    const buffer = await buildWorkbookBuffer(
      ['Name', 'Logo URL'],
      [
        ['UAE Team Emirates', undefined],
        [undefined, undefined],
      ],
    );

    const result = await parseWorksheetRows(buffer, rowSchema, COLUMNS);

    expect(result.valid).toHaveLength(1);
    expect(result.errors).toEqual([]);
  });

  it('reports a per-row error with the correct row number for a row that fails schema validation', async () => {
    // Row 2 is valid; row 3 has a logoUrl but no name — required field
    // missing (the logoUrl is what keeps it from being treated as blank).
    const buffer = await buildWorkbookBuffer(
      ['Name', 'Logo URL'],
      [
        ['UAE Team Emirates', undefined],
        [undefined, 'https://example.com/no-name.png'],
      ],
    );

    const result = await parseWorksheetRows(buffer, rowSchema, COLUMNS);

    expect(result.valid).toHaveLength(1);
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0]?.row).toBe(3);
    expect(result.errors[0]?.message).toContain('name');
  });

  it('rejects the whole file with a single error when a required column is missing entirely', async () => {
    const buffer = await buildWorkbookBuffer(['Logo URL'], [['https://example.com/x.png']]);

    const result = await parseWorksheetRows(buffer, rowSchema, COLUMNS);

    expect(result.valid).toEqual([]);
    expect(result.errors).toEqual([{ row: 1, message: 'Missing required column "Name"' }]);
  });

  it('does not error when an optional column is missing entirely from the sheet', async () => {
    const buffer = await buildWorkbookBuffer(['Name'], [['UAE Team Emirates']]);

    const result = await parseWorksheetRows(buffer, rowSchema, COLUMNS);

    expect(result.errors).toEqual([]);
    expect(result.valid).toEqual([{ row: 2, data: { name: 'UAE Team Emirates' } }]);
  });

  it('returns no valid rows and no errors for a header-only (empty) file', async () => {
    const buffer = await buildWorkbookBuffer(['Name', 'Logo URL'], []);

    const result = await parseWorksheetRows(buffer, rowSchema, COLUMNS);

    expect(result).toEqual({ valid: [], errors: [] });
  });

  it('reports a single row:0 error for a buffer that is not a readable .xlsx workbook', async () => {
    const garbage = Buffer.from('this is definitely not an xlsx file');

    const result = await parseWorksheetRows(garbage, rowSchema, COLUMNS);

    expect(result.valid).toEqual([]);
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0]?.row).toBe(0);
  });
});
