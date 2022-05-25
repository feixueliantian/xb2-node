import express = require('express');
import { authGuard } from '../auth/auth.middleware';
import * as userController from './user.controller';
import {
  validateUserData,
  hashPassword,
  validateUpdateUserData,
} from './user.middleware';

const router = express.Router();

router.post('/users', validateUserData, hashPassword, userController.store);

router.get('/users/:userId', userController.show);

router.patch(
  '/users',
  authGuard,
  validateUpdateUserData,
  userController.update,
);

export default router;
