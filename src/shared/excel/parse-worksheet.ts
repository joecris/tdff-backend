import { Workbook, CellValue } from 'exceljs';
import { ZodType } from 'zod';
import { ParseResult, ParsedRow, RowError } from './bulk-import-result';

/**
 * Declares one expected column on the sheet: the human-readable header
 * text to look for (matched case-insensitively, trimmed) and which field
 * of `T` it maps to. `required: true` means the WHOLE FILE is rejected
 * with a single "missing column" error if the header is absent — not a
 * per-row concern, since if the column itself doesn't exist there's
 * nothing to parse per row. Optional columns that are simply absent from
 * the sheet are treated as "every row leaves this field blank," which
 * `rowSchema`'s own `.optional()` already tolerates fine.
 */
export interface ExcelColumn<T> {
  header: string;
  field: keyof T & string;
  required: boolean;
}

/**
 * Generic worksheet -> validated-row parser. Only file in this codebase
 * that imports `exceljs` directly — `TeamExcelParser`/`RiderExcelParser`
 * call this instead, keeping the ExcelJS dependency an implementation
 * detail of the shared kernel, not something every importer-specific file
 * needs to know about.
 *
 * Reads the first worksheet only. Row 1 is always the header row; data
 * starts at row 2. A row where every mapped column is blank is skipped
 * silently (trailing blank rows in a hand-edited sheet are common, not
 * errors). Never throws for content-shape problems — an unreadable
 * workbook, a missing required column, or a row that fails `rowSchema` are
 * all reported through the returned `errors` array so a caller can always
 * report "N rows imported, M rows failed" uniformly.
 */
export async function parseWorksheetRows<T>(
  buffer: Buffer,
  rowSchema: ZodType<T>,
  columns: ExcelColumn<T>[],
): Promise<ParseResult<T>> {
  const workbook = new Workbook();
  try {
    // exceljs's own .d.ts declares a `Buffer extends ArrayBuffer` that
    // resolves to a different, incompatible type than Node's real global
    // `Buffer` — a known package typing quirk (it works fine at runtime
    // with a genuine Node Buffer). `Parameters<...>` pulls exceljs's own
    // declared parameter type directly, sidestepping the name clash.
    await workbook.xlsx.load(buffer as unknown as Parameters<typeof workbook.xlsx.load>[0]);
  } catch {
    return { valid: [], errors: [{ row: 0, message: 'File is not a readable .xlsx workbook' }] };
  }

  const worksheet = workbook.worksheets[0];
  if (!worksheet || worksheet.rowCount === 0) {
    return { valid: [], errors: [] };
  }

  const columnIndexByHeader = new Map<string, number>();
  worksheet.getRow(1).eachCell((cell, colNumber) => {
    const text = cellToString(cell.value);
    if (text !== undefined) columnIndexByHeader.set(text.toLowerCase(), colNumber);
  });

  const missingRequiredColumns = columns.filter(
    (column) => column.required && !columnIndexByHeader.has(column.header.toLowerCase()),
  );
  if (missingRequiredColumns.length > 0) {
    const errors: RowError[] = missingRequiredColumns.map((column) => ({
      row: 1,
      message: `Missing required column "${column.header}"`,
    }));
    return { valid: [], errors };
  }

  const valid: ParsedRow<T>[] = [];
  const errors: RowError[] = [];

  for (let rowNumber = 2; rowNumber <= worksheet.rowCount; rowNumber += 1) {
    const row = worksheet.getRow(rowNumber);
    const raw: Partial<Record<keyof T & string, string>> = {};
    let hasAnyValue = false;

    for (const column of columns) {
      const colIndex = columnIndexByHeader.get(column.header.toLowerCase());
      if (colIndex === undefined) continue; // optional column not present on this sheet at all

      const cellText = cellToString(row.getCell(colIndex).value);
      if (cellText !== undefined) {
        raw[column.field] = cellText;
        hasAnyValue = true;
      }
    }

    if (!hasAnyValue) continue; // fully blank row — skip, not an error

    const result = rowSchema.safeParse(raw);
    if (result.success) {
      valid.push({ row: rowNumber, data: result.data });
    } else {
      const message = result.error.issues
        .map((issue) => `${issue.path.join('.') || 'value'}: ${issue.message}`)
        .join('; ');
      errors.push({ row: rowNumber, message });
    }
  }

  return { valid, errors };
}

/** Coerces the handful of ExcelJS cell shapes this codebase's imports
 * actually need (plain values, hyperlinks, rich text) into a trimmed
 * string, or `undefined` for a genuinely blank cell. Formula results and
 * other exotic cell types fall back to `String(value)` — good enough for
 * the plain data-entry sheets this feature targets. */
function cellToString(value: CellValue): string | undefined {
  if (value === null || value === undefined) return undefined;

  if (typeof value === 'object') {
    if ('text' in value && typeof value.text === 'string') {
      const text = value.text.trim();
      return text.length > 0 ? text : undefined;
    }
    if ('richText' in value && Array.isArray(value.richText)) {
      const text = value.richText.map((part) => part.text).join('').trim();
      return text.length > 0 ? text : undefined;
    }
  }

  const text = String(value).trim();
  return text.length > 0 ? text : undefined;
}
