import { OpenApiGeneratorV31 } from '@asteasolutions/zod-to-openapi';
import { registry } from './registry';
import './register-all';

/**
 * Assembles the full spec object from whatever every module's
 * `*.openapi.ts` file registered onto the shared registry (see
 * `register-all.ts`'s barrel import, which runs before this executes).
 * The only place `OpenApiGeneratorV31` is invoked — both the runtime
 * `/api/openapi.json` route and `generate-spec.ts`'s CLI call this same
 * function, so there's exactly one way the document gets built.
 */
export function buildOpenApiDocument() {
  const generator = new OpenApiGeneratorV31(registry.definitions);
  return generator.generateDocument({
    openapi: '3.1.0',
    info: {
      title: 'TDFF Backend — Grand Tour Cycling Fantasy League API',
      version: '1.0.0',
      description:
        'Real credential in production: a Bearer JWT issued by Auth0 (`AUTH_MODE=auth0`). ' +
        'Local dev only (`AUTH_MODE=dev`) accepts an unverified `x-user-id` header instead ' +
        "— not modeled here as a security scheme since it's not part of the real contract.",
    },
    servers: [
      { url: 'https://tdff-backend.vercel.app', description: 'Production' },
      { url: 'http://localhost:3000', description: 'Local dev' },
    ],
  });
}
