import { Router } from 'express';
import * as paymentController from './payment.controller';

const router = Router();

router.get('/payments', paymentController.index);

router.get('/payments/wxpay/notify', paymentController.wxpayNotify);
router.get('/payments/alipay/notify', paymentController.alipayNotify);

export default router;
