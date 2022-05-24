import { Router } from 'express';
import { authGuard } from '../auth/auth.middleware';
import * as likeController from './like.controller';

const router = Router();

router.post('/posts/:postId/like', authGuard, likeController.storeUserLikePost);
router.delete(
  '/posts/:postId/like',
  authGuard,
  likeController.destroyUserLikePost,
);
export default router;
