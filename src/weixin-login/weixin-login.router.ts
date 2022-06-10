import { Router } from 'express';
import { accessLog } from '../access-log/access-log.middleware';
import { validateLoginData } from '../auth/auth.middleware';
import { hashPassword, validateUserData } from '../user/user.middleware';
import * as weixinLoginController from './weixin-login.controller';
import {
  weixinLoginConnector,
  weixinLoginGuard,
} from './weixin-login.middleware';

const router = Router();

// 微信扫码登录
router.get(
  '/weixin-login/callback',
  weixinLoginGuard,
  accessLog({
    action: 'weixinLogin',
    resourceType: 'auth',
  }),
  weixinLoginController.weixinLoginCallback,
);

// 微信关联已有账户之后登录
router.post(
  'weixin-login/connect',
  validateLoginData,
  weixinLoginConnector(),
  accessLog({
    action: 'weixinLoginConnect',
    resourceType: 'auth',
  }),
  weixinLoginController.weixinLoginConnect,
);

// 微信关联新创建的用户之后登录
router.post(
  'weixin-login/create-connect',
  validateUserData,
  hashPassword,
  weixinLoginConnector({ isCreateUserRequired: true }),
  accessLog({
    action: 'createUser',
    resourceType: 'user',
    payloadParam: 'body.name',
  }),
  accessLog({
    action: 'weixinLoginConnect',
    resourceType: 'auth',
  }),
  weixinLoginController.weixinLoginCreateConnect,
);

export default router;
