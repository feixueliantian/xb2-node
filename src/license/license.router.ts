import { Router } from 'express';
import { accessLog } from '../access-log/access-log.middleware';
import { LICENSES_PER_PAGE } from '../app/app.config';
import { authGuard } from '../auth/auth.middleware';
import { paginate } from '../post/post.middleware';
import * as licenseController from './license.controller';

const router = Router();

router.get('/valid-license', authGuard, licenseController.valideLicense);
router.get(
  '/licenses',
  authGuard,
  paginate(LICENSES_PER_PAGE),
  accessLog({
    action: 'getLicenses',
    resourceType: 'license',
  }),
  licenseController.index,
);

export default router;
