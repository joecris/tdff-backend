import { z } from 'zod';
import {
  registry,
  idPathParam,
  standardErrorResponses,
  bulkImportResultSchema,
} from '@infrastructure/openapi/registry';
import { createRiderSchema } from './dto/create-rider.dto';
import { riderResponseSchema } from './dto/rider-response.dto';

registry.registerPath({
  method: 'post',
  path: '/api/riders',
  operationId: 'createRider',
  tags: ['Riders'],
  summary: 'Create a rider',
  security: [{ bearerAuth: [] }],
  description: 'Requires `admin` role.',
  request: {
    body: { content: { 'application/json': { schema: createRiderSchema } } },
  },
  responses: {
    201: {
      description: 'Rider created',
      content: { 'application/json': { schema: riderResponseSchema } },
    },
    ...standardErrorResponses([400, 401, 403]),
  },
});

registry.registerPath({
  method: 'get',
  path: '/api/riders/{id}',
  operationId: 'getRiderById',
  tags: ['Riders'],
  summary: 'Get a rider by id',
  security: [],
  request: { params: z.object({ id: idPathParam('Rider id') }) },
  responses: {
    200: {
      description: 'The rider',
      content: { 'application/json': { schema: riderResponseSchema } },
    },
    ...standardErrorResponses([404]),
  },
});

registry.registerPath({
  method: 'post',
  path: '/api/riders/import',
  operationId: 'bulkImportRiders',
  tags: ['Riders'],
  summary: 'Bulk-import riders from an .xlsx file',
  security: [{ bearerAuth: [] }],
  description:
    'Requires `admin` role. Best-effort/partial-success — a row referencing an unknown ' +
    'team name is skipped and reported in `errors`, not a whole-file failure.',
  request: {
    body: {
      content: {
        'multipart/form-data': {
          schema: z.object({
            file: z.string().openapi({ type: 'string', format: 'binary' }),
          }),
        },
      },
    },
  },
  responses: {
    200: {
      description: 'Import result — always 200, even for partial success; see `errors`',
      content: { 'application/json': { schema: bulkImportResultSchema } },
    },
    ...standardErrorResponses([400, 401, 403]),
  },
});
