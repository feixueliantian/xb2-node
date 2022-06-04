import { Router } from 'express';
import { accessLog } from '../access-log/access-log.middleware';
import { authGuard } from '../auth/auth.middleware';
import * as likeController from './like.controller';

const router = Router();

router.post(
  '/posts/:postId/like',
  authGuard,
  accessLog({
    action: 'createUserLikePost',
    resourceType: 'post',
    resourceParamName: 'postId',
  }),
  likeController.storeUserLikePost,
);
router.delete(
  '/posts/:postId/like',
  authGuard,
  accessLog({
    action: 'deleteUserLikePost',
    resourceType: 'post',
    resourceParamName: 'postId',
  }),
  likeController.destroyUserLikePost,
);
export default router;
