import { Router } from 'express';
import { accessLog } from '../access-log/access-log.middleware';
import { accessControl, authGuard } from '../auth/auth.middleware';
import * as orderController from './order.controller';
import { orderGuard, updateOrderGuard } from './order.middleware';

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

export default router;
