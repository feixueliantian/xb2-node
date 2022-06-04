import { Router } from 'express';
import { authGuard } from '../auth/auth.middleware';
import * as auditLogController from './audit-log.controller';
import { auditLogGuard } from './audit-log.middleware';

const router = Router();

router.post('/audit-logs', authGuard, auditLogGuard, auditLogController.store);

export default router;
