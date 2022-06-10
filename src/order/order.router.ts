import { Router } from 'express';
import { accessLog } from '../access-log/access-log.middleware';
import { authGuard } from '../auth/auth.middleware';
import * as orderController from './order.controller';
import { orderGuard } from './order.middleware';

const router = Router();

// 创建订单
router.post(
  '/orders',
  authGuard,
  orderGuard,
  accessLog({
    action: 'createOrder',
    resourceType: 'order',
  }),
  orderController.store,
);

export default router;
