import { Router } from 'express';
import { accessLog } from '../access-log/access-log.middleware';
import * as weixinLoginController from './weixin-login.controller';
import { weixinLoginGuard } from './weixin-login.middleware';

const router = Router();

router.get(
  '/weixin-login/callback',
  weixinLoginGuard,
  accessLog({
    action: 'weixinLogin',
    resourceType: 'auth',
  }),
  weixinLoginController.weixinLoginCallback,
);

export default router;
