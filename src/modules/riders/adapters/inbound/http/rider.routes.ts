import { Router } from 'express';
import { validateBody } from '@infrastructure/http/middlewares/validate.middleware';
import { requireRole } from '@infrastructure/http/middlewares/require-role.middleware';
import { uploadExcelFile } from '@infrastructure/http/middlewares/upload.middleware';
import { RiderController } from './rider.controller';
import { createRiderSchema } from './dto/create-rider.dto';

export function createRiderRouter(controller: RiderController): Router {
  const router = Router();

  router.post('/', requireRole('admin'), validateBody(createRiderSchema), controller.create);
  router.get('/:id', controller.getById);

  // Phase 5 — bulk roster setup from a spreadsheet, same shape as teams'.
  router.post('/import', requireRole('admin'), uploadExcelFile('file'), controller.bulkImport);

  return router;
}
