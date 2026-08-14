import { z } from 'zod';
import { registry, idPathParam, standardErrorResponses } from '@infrastructure/openapi/registry';
import { createGrandTourSchema } from './dto/create-grand-tour.dto';
import { grandTourResponseSchema } from './dto/grand-tour-response.dto';
import { addGrandTourTeamSchema } from './dto/add-grand-tour-team.dto';
import { grandTourTeamResponseSchema } from './dto/grand-tour-team-response.dto';
import { addGrandTourRiderSchema } from './dto/add-grand-tour-rider.dto';
import { grandTourRiderResponseSchema } from './dto/grand-tour-rider-response.dto';

const grandTourIdParam = z.object({ id: idPathParam('Grand tour id') });

registry.registerPath({
  method: 'post',
  path: '/api/grand-tours',
  operationId: 'createGrandTour',
  tags: ['Grand Tours'],
  summary: 'Create a grand tour',
  security: [{ bearerAuth: [] }],
  description: 'Requires `admin` role.',
  request: {
    body: { content: { 'application/json': { schema: createGrandTourSchema } } },
  },
  responses: {
    201: {
      description: 'Grand tour created',
      content: { 'application/json': { schema: grandTourResponseSchema } },
    },
    ...standardErrorResponses([400, 401, 403]),
  },
});

registry.registerPath({
  method: 'get',
  path: '/api/grand-tours/{id}',
  operationId: 'getGrandTourById',
  tags: ['Grand Tours'],
  summary: 'Get a grand tour by id',
  security: [],
  request: { params: grandTourIdParam },
  responses: {
    200: {
      description: 'The grand tour',
      content: { 'application/json': { schema: grandTourResponseSchema } },
    },
    ...standardErrorResponses([404]),
  },
});

registry.registerPath({
  method: 'post',
  path: '/api/grand-tours/{id}/teams',
  operationId: 'addGrandTourTeam',
  tags: ['Grand Tours'],
  summary: "Add a team to this grand tour's start list",
  security: [{ bearerAuth: [] }],
  description: 'Requires `admin` role.',
  request: {
    params: grandTourIdParam,
    body: { content: { 'application/json': { schema: addGrandTourTeamSchema } } },
  },
  responses: {
    201: {
      description: 'Team added to the start list',
      content: { 'application/json': { schema: grandTourTeamResponseSchema } },
    },
    ...standardErrorResponses([400, 401, 403, 404, 409]),
  },
});

registry.registerPath({
  method: 'get',
  path: '/api/grand-tours/{id}/teams',
  operationId: 'listGrandTourTeams',
  tags: ['Grand Tours'],
  summary: "List this grand tour's start-list teams",
  security: [],
  request: { params: grandTourIdParam },
  responses: {
    200: {
      description: 'Start-list teams',
      content: { 'application/json': { schema: z.array(grandTourTeamResponseSchema) } },
    },
    ...standardErrorResponses([404]),
  },
});

registry.registerPath({
  method: 'post',
  path: '/api/grand-tours/{id}/riders',
  operationId: 'addGrandTourRider',
  tags: ['Grand Tours'],
  summary: "Add a rider to this grand tour's start list",
  security: [{ bearerAuth: [] }],
  description: 'Requires `admin` role.',
  request: {
    params: grandTourIdParam,
    body: { content: { 'application/json': { schema: addGrandTourRiderSchema } } },
  },
  responses: {
    201: {
      description: 'Rider added to the start list',
      content: { 'application/json': { schema: grandTourRiderResponseSchema } },
    },
    ...standardErrorResponses([400, 401, 403, 404, 409]),
  },
});

registry.registerPath({
  method: 'get',
  path: '/api/grand-tours/{id}/riders',
  operationId: 'listGrandTourRiders',
  tags: ['Grand Tours'],
  summary: "List this grand tour's start-list riders",
  security: [],
  request: { params: grandTourIdParam },
  responses: {
    200: {
      description: 'Start-list riders',
      content: { 'application/json': { schema: z.array(grandTourRiderResponseSchema) } },
    },
    ...standardErrorResponses([404]),
  },
});
