import express from 'express';
import * as userController from './user.controller';

const router = express.Router();

router.post('/users', userController.store);

export default router;
