import { Router } from 'express';
import * as dashboardController from './dashboard.controller';
import { accessCountFilter } from './dashboard.middleware';

const router = Router();
router.get(
  '/dashboard/access-counts',
  accessCountFilter,
  dashboardController.accessCountIndex,
);

export default router;
