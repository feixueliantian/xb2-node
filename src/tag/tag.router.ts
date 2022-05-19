import { Router } from 'express';
import * as tagController from './tag.controller';
import { authGuard } from '../auth/auth.middleware';

const router = Router();

router.post('/tags', authGuard, tagController.store);

export default router;
