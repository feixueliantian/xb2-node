import { Router } from 'express';
import { authGuard } from '../auth/auth.middleware';
import * as downloadController from './download.controller';
import { downloadGuard } from './download.middleware';

const router = Router();

router.post('/downloads', authGuard, downloadGuard, downloadController.store);

export default router;
