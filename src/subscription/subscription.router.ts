import { Router } from 'express';
import { authGuard } from '../auth/auth.middleware';
import * as subscriptionController from './subscription.controller';

const router = Router();

router.get(
  '/valid-subscription',
  authGuard,
  subscriptionController.validSubscription,
);

export default router;
