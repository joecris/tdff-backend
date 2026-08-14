import { z } from 'zod';
import {
  registry,
  idPathParam,
  standardErrorResponses,
  bulkImportResultSchema,
} from '@infrastructure/openapi/registry';
import { createTeamSchema } from './dto/create-team.dto';
import { teamResponseSchema } from './dto/team-response.dto';

registry.registerPath({
  method: 'post',
  path: '/api/teams',
  operationId: 'createTeam',
  tags: ['Teams'],
  summary: 'Create a team',
  security: [{ bearerAuth: [] }],
  description: 'Requires `admin` role.',
  request: {
    body: { content: { 'application/json': { schema: createTeamSchema } } },
  },
  responses: {
    201: {
      description: 'Team created',
      content: { 'application/json': { schema: teamResponseSchema } },
    },
    ...standardErrorResponses([400, 401, 403]),
  },
});

registry.registerPath({
  method: 'get',
  path: '/api/teams/{id}',
  operationId: 'getTeamById',
  tags: ['Teams'],
  summary: 'Get a team by id',
  security: [],
  request: { params: z.object({ id: idPathParam('Team id') }) },
  responses: {
    200: {
      description: 'The team',
      content: { 'application/json': { schema: teamResponseSchema } },
    },
    ...standardErrorResponses([404]),
  },
});

registry.registerPath({
  method: 'post',
  path: '/api/teams/import',
  operationId: 'bulkImportTeams',
  tags: ['Teams'],
  summary: 'Bulk-import teams from an .xlsx file',
  security: [{ bearerAuth: [] }],
  description:
    'Requires `admin` role. Best-effort/partial-success — reconciles by exact name match ' +
    '(re-importing an existing name updates it rather than duplicating it).',
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
