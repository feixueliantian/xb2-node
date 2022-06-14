import { Router } from 'express';
import { accessLog } from '../access-log/access-log.middleware';
import { accessControl, authGuard } from '../auth/auth.middleware';
import * as orderController from './order.controller';
import {
  orderGuard,
  payOrderGuard,
  updateOrderGuard,
} from './order.middleware';

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

// 更新订单
router.patch(
  '/orders/:orderId',
  authGuard,
  accessControl({ possession: true }),
  updateOrderGuard,
  accessLog({
    action: 'updateOrder',
    resourceType: 'order',
    resourceParamName: 'orderId',
  }),
  orderController.update,
);

// 支付订单
router.post(
  '/orders/:orderId/pay',
  authGuard,
  payOrderGuard,
  orderController.pay,
);

export default router;
