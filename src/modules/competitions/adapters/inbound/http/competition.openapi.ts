import { z } from 'zod';
import { registry, idPathParam, standardErrorResponses } from '@infrastructure/openapi/registry';
import { createCompetitionSchema } from './dto/create-competition.dto';
import { competitionResponseSchema } from './dto/competition-response.dto';
import { updateCompetitionSlotsSchema } from './dto/update-competition-slots.dto';
import { submitCompetitionEntrySchema } from './dto/submit-competition-entry.dto';
import { competitionEntryResponseSchema } from './dto/competition-entry-response.dto';
import { submitCompetitionResultsSchema } from './dto/submit-competition-results.dto';
import { competitionResultResponseSchema } from './dto/competition-result-response.dto';
// Cross-module import for docs purposes only — mounted here
// (`/competitions/:id/scores`) even though the computation lives in the
// `scoring` module, same reasoning as fantasy-league.openapi.ts's
// leaderboard route.
import { competitionScoreResponseSchema } from '@modules/scoring/adapters/inbound/http/dto/competition-score-response.dto';

const competitionIdParam = z.object({ id: idPathParam('Competition id') });

registry.registerPath({
  method: 'post',
  path: '/api/competitions',
  operationId: 'createCompetition',
  tags: ['Competitions'],
  summary: 'Create a competition',
  security: [{ bearerAuth: [] }],
  description:
    'Requires `admin` role. `slots` declares this competition instance’s required picks ' +
    'and their point values — e.g. GC Top 3 and KOM Top 3 can both use `top_1`/`top_2`/`top_3` ' +
    'at different point values; a stage-winner competition can be winner-only or top-3, per instance.',
  request: {
    body: { content: { 'application/json': { schema: createCompetitionSchema } } },
  },
  responses: {
    201: {
      description: 'Competition created',
      content: { 'application/json': { schema: competitionResponseSchema } },
    },
    ...standardErrorResponses([400, 401, 403, 404]),
  },
});

registry.registerPath({
  method: 'get',
  path: '/api/competitions/{id}',
  operationId: 'getCompetitionById',
  tags: ['Competitions'],
  summary: 'Get a competition by id',
  security: [],
  request: { params: competitionIdParam },
  responses: {
    200: {
      description: 'The competition',
      content: { 'application/json': { schema: competitionResponseSchema } },
    },
    ...standardErrorResponses([404]),
  },
});

registry.registerPath({
  method: 'put',
  path: '/api/competitions/{id}/slots',
  operationId: 'updateCompetitionSlots',
  tags: ['Competitions'],
  summary: 'Reshape a competition’s required slots/points',
  security: [{ bearerAuth: [] }],
  description:
    'Requires `admin` role. Rejected with 409 once a result has been submitted for this ' +
    'competition — slots are locked in at that point.',
  request: {
    params: competitionIdParam,
    body: { content: { 'application/json': { schema: updateCompetitionSlotsSchema } } },
  },
  responses: {
    200: {
      description: 'Updated competition',
      content: { 'application/json': { schema: competitionResponseSchema } },
    },
    ...standardErrorResponses([400, 401, 403, 404, 409]),
  },
});

registry.registerPath({
  method: 'post',
  path: '/api/competitions/{id}/entries',
  operationId: 'submitCompetitionEntry',
  tags: ['Competitions'],
  summary: 'Submit or replace the authenticated caller’s entry',
  security: [{ bearerAuth: [] }],
  description:
    'Any authenticated user may submit/replace their own entry — one entry per user per ' +
    'competition, editable until a future lock point. Every required slot must be filled ' +
    'exactly once, and every picked rider/team must belong to this competition’s grand ' +
    "tour's start list.",
  request: {
    params: competitionIdParam,
    body: { content: { 'application/json': { schema: submitCompetitionEntrySchema } } },
  },
  responses: {
    200: {
      description: 'Entry submitted/replaced',
      content: { 'application/json': { schema: competitionEntryResponseSchema } },
    },
    ...standardErrorResponses([400, 401, 404]),
  },
});

registry.registerPath({
  method: 'get',
  path: '/api/competitions/{id}/entries/me',
  operationId: 'getMyCompetitionEntry',
  tags: ['Competitions'],
  summary: 'Get the authenticated caller’s own entry',
  security: [{ bearerAuth: [] }],
  request: { params: competitionIdParam },
  responses: {
    200: {
      description: 'The caller’s entry',
      content: { 'application/json': { schema: competitionEntryResponseSchema } },
    },
    ...standardErrorResponses([401, 404]),
  },
});

registry.registerPath({
  method: 'get',
  path: '/api/competitions/{id}/entries',
  operationId: 'listCompetitionEntries',
  tags: ['Competitions'],
  summary: 'List every entry for a competition',
  security: [{ bearerAuth: [] }],
  description:
    'Requires `admin` role — seeing everyone’s picks before results are locked would leak ' +
    'other users’ selections while entries are still open.',
  request: { params: competitionIdParam },
  responses: {
    200: {
      description: 'All entries',
      content: { 'application/json': { schema: z.array(competitionEntryResponseSchema) } },
    },
    ...standardErrorResponses([401, 403, 404]),
  },
});

registry.registerPath({
  method: 'post',
  path: '/api/competitions/{id}/results',
  operationId: 'submitCompetitionResults',
  tags: ['Competitions'],
  summary: 'Submit or replace the official results for a competition',
  security: [{ bearerAuth: [] }],
  description:
    'Requires `admin` role. Full-replace on resubmit. Triggers automatic recalculation of ' +
    'every entry’s score and the owning league’s leaderboard — idempotent from-scratch, ' +
    'never additive.',
  request: {
    params: competitionIdParam,
    body: { content: { 'application/json': { schema: submitCompetitionResultsSchema } } },
  },
  responses: {
    200: {
      description: 'Results submitted/replaced',
      content: { 'application/json': { schema: competitionResultResponseSchema } },
    },
    ...standardErrorResponses([400, 401, 403, 404]),
  },
});

registry.registerPath({
  method: 'get',
  path: '/api/competitions/{id}/scores',
  operationId: 'listCompetitionScores',
  tags: ['Competitions'],
  summary: 'List every entry’s score for a competition',
  security: [],
  description:
    'Public once computed — unlike raw entries (admin-only while open), seeing how you ' +
    'scored is the point of a fantasy competition, not a spoiler.',
  request: { params: competitionIdParam },
  responses: {
    200: {
      description: 'Scores',
      content: { 'application/json': { schema: z.array(competitionScoreResponseSchema) } },
    },
    ...standardErrorResponses([404]),
  },
});
