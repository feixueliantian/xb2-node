import { Router } from 'express';
import * as paymentUrlController from './payment-url.controller';
import { paymentUrlGuard } from './payment-url.middleware';

const router = Router();

router.get('/payment-url', paymentUrlGuard, paymentUrlController.paymentUrl);

export default router;
