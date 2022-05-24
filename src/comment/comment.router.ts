import { Router } from 'express';
import { COMMENTS_PER_PAGE } from '../app/app.config';
import { accessControl, authGuard } from '../auth/auth.middleware';
import { paginate } from '../post/post.middleware';
import * as commentController from './comment.controller';
import { filter } from './comment.middleware';

const router = Router();

router.post('/comments', authGuard, commentController.store);
router.post('/comments/:commentId/reply', authGuard, commentController.reply);
router.patch(
  '/comments/:commentId',
  authGuard,
  accessControl({ possession: true }),
  commentController.update,
);
router.delete(
  '/comments/:commentId',
  authGuard,
  accessControl({ possession: true }),
  commentController.destroy,
);
router.get(
  '/comments',
  filter,
  paginate(COMMENTS_PER_PAGE),
  commentController.index,
);

export default router;
