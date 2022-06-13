import { Request, Response, NextFunction } from 'express';
import { connection } from '../app/database/mysql';
import { LicenseStatus } from '../license/license.model';
import { createLicense } from '../license/license.service';
import { OrderLogAction } from '../order-log/order-log.model';
import { createOrderLog } from '../order-log/order-log.service';
import { ProductType } from '../product/product.model';
import { SubscriptionModel } from '../subscription/subscription.model';
import { processSubscription } from '../subscription/subscription.service';
import { createOrder, updateOrder } from './order.service';

/**
 * 创建订单
 */
export const store = async (
  request: Request,
  response: Response,
  next: NextFunction,
) => {
  const { order, resourceType, resourceId, product } = request.body;
  const { id: userId } = request.user;

  try {
    // 创建订单
    const data = await createOrder(order);
    const orderId = data.insertId;
    order.id = orderId;

    // 创建订单日志
    await createOrderLog({
      userId,
      orderId,
      action: OrderLogAction.orderCreated,
      meta: JSON.stringify({
        ...order,
        resourceType,
        resourceId,
      }),
    });

    // 创建许可
    if (product.type === ProductType.license) {
      await createLicense({
        userId,
        orderId,
        resourceType,
        resourceId,
        status: LicenseStatus.pending,
      });
    }

    // 创建订阅
    if (product.type === ProductType.subscription) {
      const result = await processSubscription({
        userId,
        order,
        product,
      });

      if (result) {
        await updateOrder(orderId, { totalAmount: result.order.totalAmount });

        // 创建订单日志
        await createOrderLog({
          userId,
          orderId,
          action: OrderLogAction.orderUpdated,
          meta: JSON.stringify({
            totalAmount: result.order.totalAmount,
          }),
        });
      }
    }

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

/**
 * 按 ID 获取订阅
 */
export const getSubscriptionById = async (subscriptionId: number) => {
  const statement = `
    SELECT
      *
    FROM
      subscription
    WHERE
      subscription.id = ? 
  `;

  const [data] = await connection.promise().query(statement, subscriptionId);
  return data[0] as SubscriptionModel;
};
