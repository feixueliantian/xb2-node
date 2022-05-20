import { Router } from 'express';
import { authGuard } from '../auth/auth.middleware';
import * as commentController from './comment.controller';

const router = Router();

router.post('/comments', authGuard, commentController.store);
router.post('/comments/:commentId/reply', authGuard, commentController.reply);

export default router;
