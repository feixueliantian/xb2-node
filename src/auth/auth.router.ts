import express = require('express');
import * as authController from './auth.controller';
import { authGuard, validateLoginData } from './auth.middleware';

const router = express.Router();

router.post('/login', validateLoginData, authController.login);

router.post('/auth/validate', authGuard, authController.validate);

export default router;
