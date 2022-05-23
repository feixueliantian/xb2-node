import { Router } from 'express';
import { authGuard } from '../auth/auth.middleware';
import * as avatarController from './avatar.controller';
import { avatarInterceptor, avatarProcessor } from './avatar.middleware';

const router = Router();

router.post(
  '/avatar',
  authGuard,
  avatarInterceptor,
  avatarProcessor,
  avatarController.store,
);

export default router;