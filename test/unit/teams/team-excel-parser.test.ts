import { describe, it, expect } from 'vitest';
import { parseTeamsExcel } from '@modules/teams/application/team-excel-parser';
import { buildWorkbookBuffer } from '../shared/build-workbook';

describe('parseTeamsExcel', () => {
  it('parses valid team rows', async () => {
    const buffer = await buildWorkbookBuffer(
      ['Name', 'Logo URL'],
      [
        ['UAE Team Emirates', 'https://example.com/uae.png'],
        ['Visma | Lease a Bike', undefined],
      ],
    );

    const result = await parseTeamsExcel(buffer);

    expect(result.errors).toEqual([]);
    expect(result.valid.map((r) => r.data)).toEqual([
      { name: 'UAE Team Emirates', logoUrl: 'https://example.com/uae.png' },
      { name: 'Visma | Lease a Bike' },
    ]);
  });

  it('rejects the file when the "Name" column is missing', async () => {
    const buffer = await buildWorkbookBuffer(['Logo URL'], [['https://example.com/uae.png']]);

    const result = await parseTeamsExcel(buffer);

    expect(result.valid).toEqual([]);
    expect(result.errors).toEqual([{ row: 1, message: 'Missing required column "Name"' }]);
  });

  it('reports an invalid logo URL as a per-row error, not a crash', async () => {
    const buffer = await buildWorkbookBuffer(
      ['Name', 'Logo URL'],
      [['UAE Team Emirates', 'not-a-url']],
    );

    const result = await parseTeamsExcel(buffer);

    expect(result.valid).toEqual([]);
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0]?.row).toBe(2);
  });
});
