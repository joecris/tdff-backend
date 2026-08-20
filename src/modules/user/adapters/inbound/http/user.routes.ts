import { Router } from 'express';
import { validateBody } from '@infrastructure/http/middlewares/validate.middleware';
import { validateQuery } from '@infrastructure/http/middlewares/validate-query.middleware';
import { requireRole } from '@infrastructure/http/middlewares/require-role.middleware';
import { paginationQuerySchema } from '@shared/http/pagination.dto';
import { UserController } from './user.controller';
import { createUserSchema } from './dto/create-user.dto';

export function createUserRouter(controller: UserController): Router {
  const router = Router();

  router.post('/', validateBody(createUserSchema), controller.create);
  // Admin-only, unlike GET /:id — a bulk listing exposes every user's
  // email in one call, a meaningfully bigger exposure than looking one up
  // by id at a time.
  router.get('/', requireRole('admin'), validateQuery(paginationQuerySchema), controller.list);
  router.get('/:id', controller.getById);

  return router;
}
