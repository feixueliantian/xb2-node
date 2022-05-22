import { Router } from 'express';
import { authGuard } from '../auth/auth.middleware';
import * as avatarController from './avatar.controller';
import { avatarInterceptor } from './avatar.middleware';

const router = Router();

router.post('avatar', authGuard, avatarInterceptor, avatarController.store);

export default router;
