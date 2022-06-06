import { Router } from 'express';
import * as dashboardController from './dashboard.controller';
import { accessCountsFilter } from './dashboard.middleware';

const router = Router();
router.get(
  '/dashboard/access-counts',
  accessCountsFilter,
  dashboardController.accessCountIndex,
);

export default router;
