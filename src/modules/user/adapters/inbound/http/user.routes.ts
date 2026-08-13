import { Router } from 'express';
import { validateBody } from '@infrastructure/http/middlewares/validate.middleware';
import { UserController } from './user.controller';
import { createUserSchema } from './dto/create-user.dto';

export function createUserRouter(controller: UserController): Router {
  const router = Router();

  router.post('/', validateBody(createUserSchema), controller.create);
  router.get('/:id', controller.getById);

  return router;
}
