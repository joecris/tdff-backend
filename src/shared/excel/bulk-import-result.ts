/**
 * One row that couldn't be processed — either because it failed schema
 * validation while parsing the sheet, or because it failed a later
 * persistence-time check (e.g. an unresolvable team name). Both stages
 * report through this same shape so a caller sees one flat list of
 * problems regardless of which stage caught them.
 */
export interface RowError {
  /** 1-indexed Excel row number; 0/1 for a whole-file problem (unreadable
   * workbook, missing required column) that isn't tied to one data row. */
  row: number;
  message: string;
}

/** A row that passed schema validation, tagged with its original sheet
 * row number — kept around so a LATER stage (e.g. RiderExcelParser's
 * team-name resolution) can still report an accurate row number if it
 * rejects the row for a reason schema validation couldn't catch. */
export interface ParsedRow<T> {
  row: number;
  data: T;
}

/** What `parseWorksheetRows` returns — rows that passed schema validation,
 * and rows that didn't. */
export interface ParseResult<T> {
  valid: ParsedRow<T>[];
  errors: RowError[];
}

/** What a `BulkImportXUseCase` returns — every valid row has by now been
 * persisted (created or updated), plus any errors accumulated across
 * parsing AND persistence-time resolution (e.g. RiderExcelParser's
 * unknown-team-name checks). Best-effort/partial-success, never
 * all-or-nothing — standard admin bulk-import UX. */
export interface BulkImportResult {
  created: number;
  updated: number;
  errors: RowError[];
}
