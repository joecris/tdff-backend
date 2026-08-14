/**
 * Side-effect-only barrel — importing each module's `*.openapi.ts` file
 * runs its `registry.registerPath(...)`/`registry.register(...)` calls
 * against the shared singleton in `registry.ts`. Same role as
 * `db/schema/index.ts`'s barrel: add one line here per new module, in the
 * same PR that adds the module's routes.
 */
import { registry } from './registry';
import { z } from 'zod';
import '@modules/user/adapters/inbound/http/user.openapi';
import '@modules/grand-tours/adapters/inbound/http/grand-tour.openapi';
import '@modules/teams/adapters/inbound/http/team.openapi';
import '@modules/riders/adapters/inbound/http/rider.openapi';
import '@modules/fantasy-leagues/adapters/inbound/http/fantasy-league.openapi';
import '@modules/competitions/adapters/inbound/http/competition.openapi';

registry.registerPath({
  method: 'get',
  path: '/api/health',
  operationId: 'getHealth',
  tags: ['Health'],
  summary: 'Liveness check',
  security: [],
  responses: {
    200: {
      description: 'The service is up',
      content: {
        'application/json': { schema: z.object({ status: z.literal('ok') }) },
      },
    },
  },
});
