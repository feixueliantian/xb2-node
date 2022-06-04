import express = require('express');
import { accessLog } from '../access-log/access-log.middleware';
import * as authController from './auth.controller';
import { authGuard, validateLoginData } from './auth.middleware';

const router = express.Router();

router.post(
  '/login',
  validateLoginData,
  accessLog({
    action: 'login',
    resourceType: 'auth',
    payloadParam: 'body.name',
  }),
  authController.login,
);

router.post('/auth/validate', authGuard, authController.validate);

export default router;
