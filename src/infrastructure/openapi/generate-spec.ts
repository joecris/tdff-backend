import { writeFileSync, readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { buildOpenApiDocument } from './build-document';

const OUTPUT_PATH = join(__dirname, '..', '..', '..', 'openapi.json');

/**
 * CLI entry, same invocation style as `db/seed/index.ts`
 * (`ts-node --transpile-only -r tsconfig-paths/register`). Two modes,
 * mirroring `format`/`format:check`'s single-script pattern:
 *   - `npm run openapi:generate` — writes the committed `openapi.json`
 *   - `npm run openapi:check` (`--check`) — regenerates in memory and
 *     diffs against the committed file, exiting non-zero on mismatch.
 *     This is the actual CI drift gate — see `ci.yml`'s `openapi` job.
 */
function main(): void {
  const document = buildOpenApiDocument();
  const generated = JSON.stringify(document, null, 2) + '\n';
  const checkOnly = process.argv.includes('--check');

  if (!checkOnly) {
    writeFileSync(OUTPUT_PATH, generated);
    console.warn(`Wrote ${OUTPUT_PATH}`);
    return;
  }

  if (!existsSync(OUTPUT_PATH)) {
    console.error(`${OUTPUT_PATH} does not exist — run "npm run openapi:generate" first.`);
    process.exit(1);
  }
  const committed = readFileSync(OUTPUT_PATH, 'utf-8');
  if (committed !== generated) {
    console.error(
      'openapi.json is out of date with the current routes/DTOs.\n' +
        'Run "npm run openapi:generate" and commit the result.',
    );
    process.exit(1);
  }
  console.warn('openapi.json is up to date.');
}

main();
