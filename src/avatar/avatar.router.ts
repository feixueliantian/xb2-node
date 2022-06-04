import { Router } from 'express';
import { accessLog } from '../access-log/access-log.middleware';
import { authGuard } from '../auth/auth.middleware';
import * as avatarController from './avatar.controller';
import { avatarInterceptor, avatarProcessor } from './avatar.middleware';

const router = Router();

router.post(
  '/avatar',
  authGuard,
  avatarInterceptor,
  avatarProcessor,
  accessLog({
    action: 'createAvatar',
    resourceType: 'avatar',
  }),
  avatarController.store,
);

router.get('/users/:userId/avatar', avatarController.serve);

export default router;
