import { Router } from 'express';
import * as tagController from './tag.controller';
import { authGuard } from '../auth/auth.middleware';
import { accessLog } from '../access-log/access-log.middleware';

const router = Router();

router.post(
  '/tags',
  authGuard,
  accessLog({
    action: 'createTag',
    resourceType: 'tag',
    payloadParam: 'body.name',
  }),
  tagController.store,
);

export default router;
