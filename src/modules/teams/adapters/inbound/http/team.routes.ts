import { Router } from 'express';
import { validateBody } from '@infrastructure/http/middlewares/validate.middleware';
import { validateQuery } from '@infrastructure/http/middlewares/validate-query.middleware';
import { requireRole } from '@infrastructure/http/middlewares/require-role.middleware';
import { uploadExcelFile } from '@infrastructure/http/middlewares/upload.middleware';
import { paginationQuerySchema } from '@shared/http/pagination.dto';
import { TeamController } from './team.controller';
import { createTeamSchema } from './dto/create-team.dto';

export function createTeamRouter(controller: TeamController): Router {
  const router = Router();

  // Team creation is admin-only (roster setup) — reads stay open to any
  // authenticated caller, matching "admin manages, users consume."
  router.post('/', requireRole('admin'), validateBody(createTeamSchema), controller.create);
  router.get('/', validateQuery(paginationQuerySchema), controller.list);
  router.get('/:id', controller.getById);

  // Phase 5 — bulk roster setup from a spreadsheet. Same admin gate as
  // single-team creation; upload runs before the route handler so
  // `req.file` is populated by the time `bulkImport` runs.
  router.post('/import', requireRole('admin'), uploadExcelFile('file'), controller.bulkImport);

  return router;
}
