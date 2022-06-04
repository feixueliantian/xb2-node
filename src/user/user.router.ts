import express = require('express');
import { accessLog } from '../access-log/access-log.middleware';
import { authGuard } from '../auth/auth.middleware';
import * as userController from './user.controller';
import {
  validateUserData,
  hashPassword,
  validateUpdateUserData,
} from './user.middleware';

const router = express.Router();

router.post(
  '/users',
  validateUserData,
  hashPassword,
  accessLog({
    action: 'createUser',
    resourceType: 'user',
    payloadParam: 'body.name',
  }),
  userController.store,
);

router.get(
  '/users/:userId',
  accessLog({
    action: 'getUserById',
    resourceType: 'user',
    resourceParamName: 'userId',
  }),
  userController.show,
);

router.patch(
  '/users',
  authGuard,
  validateUpdateUserData,
  accessLog({
    action: 'updateUser',
    resourceType: 'user',
    payloadParam: 'body.update.name',
  }),
  userController.update,
);

export default router;
