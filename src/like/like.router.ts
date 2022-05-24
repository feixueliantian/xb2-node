import { Router } from 'express';
import { authGuard } from '../auth/auth.middleware';
import * as likeController from './like.controller';

const router = Router();

router.post('/posts/:postId/like', authGuard, likeController.storeUserLikePost);
export default router;
