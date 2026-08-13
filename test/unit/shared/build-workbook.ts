import { Workbook } from 'exceljs';

/**
 * Builds a real, in-memory .xlsx buffer for tests — no fixture files on
 * disk, and it exercises the exact same ExcelJS read path the app uses,
 * not a hand-rolled fake of one.
 */
export async function buildWorkbookBuffer(
  headers: string[],
  rows: Array<Array<string | number | undefined>>,
): Promise<Buffer> {
  const workbook = new Workbook();
  const sheet = workbook.addWorksheet('Sheet1');
  sheet.addRow(headers);
  for (const row of rows) {
    sheet.addRow(row);
  }

  const raw = await workbook.xlsx.writeBuffer();
  // Same exceljs `Buffer` typing quirk as parse-worksheet.ts — `raw` is a
  // real Buffer-compatible value at runtime regardless of what its
  // declared type claims.
  return Buffer.from(raw as unknown as Uint8Array);
}
