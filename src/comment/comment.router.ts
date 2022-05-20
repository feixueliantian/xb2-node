import { Router } from 'express';
import { accessControl, authGuard } from '../auth/auth.middleware';
import * as commentController from './comment.controller';

const router = Router();

router.post('/comments', authGuard, commentController.store);
router.post('/comments/:commentId/reply', authGuard, commentController.reply);
router.patch(
  '/comments/:commentId',
  authGuard,
  accessControl({ possession: true }),
  commentController.update,
);

export default router;
