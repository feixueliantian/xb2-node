import { Router } from 'express';
import * as paymentController from './payment.controller';

const router = Router();

router.get('/payments', paymentController.index);

export default router;
