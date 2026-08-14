import {
  OpenAPIRegistry,
  ResponseConfig,
  extendZodWithOpenApi,
} from '@asteasolutions/zod-to-openapi';
import { z } from 'zod';

// Documented as a required one-time call for any `.openapi(...)` usage
// (path/query param metadata, examples) — must run before any schema in
// this file or any `*.openapi.ts` module file calls `.openapi(...)`, so it
// lives here, at the top of the one file every one of them imports first.
extendZodWithOpenApi(z);

/**
 * The one shared registry every module's `*.openapi.ts` file registers
 * itself onto (side-effect imports, see `register-all.ts`) — mirrors
 * `db/schema/index.ts`'s barrel role for the OpenAPI doc, not a second
 * source of truth. `build-document.ts` is the only place this registry is
 * actually turned into a spec object.
 */
export const registry = new OpenAPIRegistry();

/**
 * Documents the real production credential — a Bearer JWT verified by
 * `Auth0JwtVerifier` (see `auth0-jwt-verifier.ts`). `AUTH_MODE=dev`'s
 * unverified `x-user-id` header is a local-only escape hatch, not part of
 * the real contract, so it's called out in `build-document.ts`'s top-level
 * `info.description` instead of being modeled as a second security scheme.
 */
registry.registerComponent('securitySchemes', 'bearerAuth', {
  type: 'http',
  scheme: 'bearer',
  bearerFormat: 'JWT',
});

/**
 * Matches `error-handler.middleware.ts`'s actual response envelope
 * exactly — every error response in this spec references this one schema,
 * so a shape change there only needs updating in one place here too.
 */
export const errorResponseSchema = registry.register(
  'ErrorResponse',
  z.object({
    error: z.object({
      code: z.string(),
      message: z.string(),
      details: z.unknown().optional(),
    }),
  }),
);

const ERROR_DESCRIPTIONS: Record<number, string> = {
  400: 'Validation failed',
  401: 'No valid credential on the request',
  403: "Caller doesn't have the required role",
  404: 'Resource not found',
  409: 'Conflicts with existing state',
};

/**
 * Builds the `responses` object for the given non-2xx status codes,
 * all pointing at the shared `ErrorResponse` schema — avoids every
 * `*.openapi.ts` file hand-rolling the same 401/403/404/409 boilerplate.
 */
export function standardErrorResponses(codes: number[]): Record<number, ResponseConfig> {
  return Object.fromEntries(
    codes.map((code) => [
      code,
      {
        description: ERROR_DESCRIPTIONS[code] ?? 'Error',
        content: { 'application/json': { schema: errorResponseSchema } },
      },
    ]),
  );
}

/** Every `:id` path param in this API is a uuid — one reusable param schema
 * instead of every `*.openapi.ts` file redeclaring the same uuid string. */
export function idPathParam(description: string) {
  return z.uuid().openapi({ param: { name: 'id', in: 'path' }, description });
}

/**
 * Matches `shared/excel/bulk-import-result.ts`'s `BulkImportResult`
 * exactly — both Excel-import endpoints (`teams`, `riders`) return this
 * same shape, so it's registered once here rather than per-module.
 */
export const bulkImportResultSchema = registry.register(
  'BulkImportResult',
  z.object({
    created: z.number().int(),
    updated: z.number().int(),
    errors: z.array(
      z.object({
        row: z.number().int(),
        message: z.string(),
      }),
    ),
  }),
);
