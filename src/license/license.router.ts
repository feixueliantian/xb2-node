import { Router } from 'express';
import { authGuard } from '../auth/auth.middleware';
import * as licenseController from './license.controller';

const router = Router();

router.get('/valid-license', authGuard, licenseController.valideLicense);

export default router;
