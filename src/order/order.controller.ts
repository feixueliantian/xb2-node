import { Request, Response, NextFunction } from 'express';
import { OrderLogAction } from '../order-log/order-log.model';
import { createOrderLog } from '../order-log/order-log.service';
import { createOrder, updateOrder } from './order.service';

/**
 * 创建订单
 */
export const store = async (
  request: Request,
  response: Response,
  next: NextFunction,
) => {
  const { order, resourceType, resourceId } = request.body;
  const { user } = request;

  try {
    // 创建订单
    const data = await createOrder(order);

    // 创建订单日志
    await createOrderLog({
      userId: user.id,
      orderId: data.insertId,
      action: OrderLogAction.orderCreated,
      meta: JSON.stringify({
        ...order,
        resourceType,
        resourceId,
      }),
    });

    return response.status(201).send(data);
  } catch (error) {
    return next(error);
  }
};

/**
 * 更新订单
 */
export const update = async (
  request: Request,
  response: Response,
  next: NextFunction,
) => {
  const { dataForUpdate, order } = request.body;
  const { user } = request;

  try {
    // 更新订单
    const data = await updateOrder(order.id, dataForUpdate);

    // 创建订单日志
    await createOrderLog({
      userId: user.id,
      orderId: order.id,
      action: OrderLogAction.orderUpdated,
      meta: JSON.stringify({
        ...dataForUpdate,
      }),
    });

    return response.send(data);
  } catch (error) {
    return next(error);
  }
};
