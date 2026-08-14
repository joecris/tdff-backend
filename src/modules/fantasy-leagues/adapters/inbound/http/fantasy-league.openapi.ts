import { z } from 'zod';
import { registry, idPathParam, standardErrorResponses } from '@infrastructure/openapi/registry';
import { createFantasyLeagueSchema } from './dto/create-fantasy-league.dto';
import { fantasyLeagueResponseSchema } from './dto/fantasy-league-response.dto';
import { fantasyLeagueMemberResponseSchema } from './dto/fantasy-league-member-response.dto';
// Cross-module import for docs purposes only — this route is mounted here
// (`/fantasy-leagues/:id/leaderboard`) even though the computation lives
// in the `scoring` module, see `fantasy-league.routes.ts` and
// `ScoringController`'s own doc comment on why.
import { leaderboardEntryResponseSchema } from '@modules/scoring/adapters/inbound/http/dto/leaderboard-response.dto';

const fantasyLeagueIdParam = z.object({ id: idPathParam('Fantasy league id') });

registry.registerPath({
  method: 'post',
  path: '/api/fantasy-leagues',
  operationId: 'createFantasyLeague',
  tags: ['Fantasy Leagues'],
  summary: 'Create a fantasy league',
  security: [{ bearerAuth: [] }],
  description: 'Requires `admin` role.',
  request: {
    body: { content: { 'application/json': { schema: createFantasyLeagueSchema } } },
  },
  responses: {
    201: {
      description: 'Fantasy league created',
      content: { 'application/json': { schema: fantasyLeagueResponseSchema } },
    },
    ...standardErrorResponses([400, 401, 403, 404]),
  },
});

registry.registerPath({
  method: 'get',
  path: '/api/fantasy-leagues/{id}',
  operationId: 'getFantasyLeagueById',
  tags: ['Fantasy Leagues'],
  summary: 'Get a fantasy league by id',
  security: [],
  request: { params: fantasyLeagueIdParam },
  responses: {
    200: {
      description: 'The fantasy league',
      content: { 'application/json': { schema: fantasyLeagueResponseSchema } },
    },
    ...standardErrorResponses([404]),
  },
});

registry.registerPath({
  method: 'post',
  path: '/api/fantasy-leagues/{id}/join',
  operationId: 'joinFantasyLeague',
  tags: ['Fantasy Leagues'],
  summary: 'Join a fantasy league as the authenticated caller',
  security: [{ bearerAuth: [] }],
  description:
    'Open to any authenticated user in v1 — no invite code or capacity cap. The joining ' +
    'user is always the authenticated caller, never a body field.',
  request: { params: fantasyLeagueIdParam },
  responses: {
    201: {
      description: 'Membership created',
      content: { 'application/json': { schema: fantasyLeagueMemberResponseSchema } },
    },
    ...standardErrorResponses([401, 404, 409]),
  },
});

registry.registerPath({
  method: 'get',
  path: '/api/fantasy-leagues/{id}/members',
  operationId: 'listFantasyLeagueMembers',
  tags: ['Fantasy Leagues'],
  summary: 'List a fantasy league’s members',
  security: [],
  request: { params: fantasyLeagueIdParam },
  responses: {
    200: {
      description: 'Members',
      content: { 'application/json': { schema: z.array(fantasyLeagueMemberResponseSchema) } },
    },
    ...standardErrorResponses([404]),
  },
});

registry.registerPath({
  method: 'get',
  path: '/api/fantasy-leagues/{id}/leaderboard',
  operationId: 'getFantasyLeagueLeaderboard',
  tags: ['Fantasy Leagues'],
  summary: 'Get the persisted leaderboard for a fantasy league',
  security: [],
  description:
    'Recomputed automatically whenever an admin submits/corrects a competition result ' +
    "(see `competitions`' submit-results endpoint) — not derived per-read.",
  request: { params: fantasyLeagueIdParam },
  responses: {
    200: {
      description: 'Leaderboard entries, ranked',
      content: { 'application/json': { schema: z.array(leaderboardEntryResponseSchema) } },
    },
    ...standardErrorResponses([404]),
  },
});
