import express = require('express');
import * as fileController from './file.controller';
import { authGuard } from '../auth/auth.middleware';
import { fileInterceptor } from './file.middleware';

const router = express.Router();

router.post('/files', authGuard, fileInterceptor, fileController.store);

export default router;
