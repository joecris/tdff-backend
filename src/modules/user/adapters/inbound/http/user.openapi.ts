import { z } from 'zod';
import { registry, idPathParam, standardErrorResponses } from '@infrastructure/openapi/registry';
import { createUserSchema } from './dto/create-user.dto';
import { userResponseSchema } from './dto/user-response.dto';

/**
 * OpenAPI path registrations for the `user` module — colocated with
 * `user.routes.ts` deliberately, see `registry.ts`'s doc comment. Both
 * routes here predate the auth seam and stay open/unauthenticated (no
 * `requireRole`, no `req.auth` check) — real user identity in production
 * comes from Auth0 JIT-provisioning on first authenticated request, not
 * this endpoint; this one remains for direct/dev/admin-tool use.
 */
registry.registerPath({
  method: 'post',
  path: '/api/users',
  operationId: 'createUser',
  tags: ['Users'],
  summary: 'Create a user',
  security: [],
  request: {
    body: { content: { 'application/json': { schema: createUserSchema } } },
  },
  responses: {
    201: {
      description: 'User created',
      content: { 'application/json': { schema: userResponseSchema } },
    },
    ...standardErrorResponses([400, 409]),
  },
});

registry.registerPath({
  method: 'get',
  path: '/api/users/{id}',
  operationId: 'getUserById',
  tags: ['Users'],
  summary: 'Get a user by id',
  security: [],
  request: { params: z.object({ id: idPathParam('User id') }) },
  responses: {
    200: {
      description: 'The user',
      content: { 'application/json': { schema: userResponseSchema } },
    },
    ...standardErrorResponses([404]),
  },
});
