import { Router } from 'express';
import * as dashboardController from './dashboard.controller';
import { accessCountsFilter, accessCountsGuard } from './dashboard.middleware';

const router = Router();

router.get(
  '/dashboard/access-counts',
  accessCountsFilter,
  dashboardController.accessCountIndex,
);

router.get(
  '/dashboard/access-counts/:action',
  accessCountsGuard,
  accessCountsFilter,
  dashboardController.accessCountShow,
);

export default router;
