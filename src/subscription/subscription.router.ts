import { Router } from 'express';
import { accessControl, authGuard } from '../auth/auth.middleware';
import * as subscriptionController from './subscription.controller';

const router = Router();

router.get(
  '/valid-subscription',
  authGuard,
  subscriptionController.validSubscription,
);

router.get(
  '/subscriptions/:subscriptionId/history',
  authGuard,
  accessControl({ possession: true }),
  subscriptionController.history,
);

export default router;
