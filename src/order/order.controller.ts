import dayjs = require('dayjs');
import { Request, Response, NextFunction } from 'express';
import { DATE_TIME_FORMAT } from '../app/app.config';
import { socketIoServer } from '../app/app.server';
import { connection } from '../app/database/mysql';
import { LicenseStatus } from '../license/license.model';
import { createLicense } from '../license/license.service';
import { OrderLogAction } from '../order-log/order-log.model';
import { createOrderLog } from '../order-log/order-log.service';
import { alipay } from '../payment/alipay/alipay.service';
import { PaymentName } from '../payment/payment.model';
import { wxpay } from '../payment/wxpay/wxpay.service';
import { ProductModel, ProductType } from '../product/product.model';
import { SubscriptionLogAction } from '../subscription-log/subscription-log.model';
import {
  createSubscriptionLog,
  getSubscriptionLogByOrderId,
} from '../subscription-log/subscription-log.service';
import {
  SubscriptionModel,
  SubscriptionStatus,
  SubscriptionType,
} from '../subscription/subscription.model';
import {
  processSubscription,
  updateSubscription,
} from '../subscription/subscription.service';
import { OrderModel } from './order.model';
import {
  countOrders,
  createOrder,
  getOrderLicenseItem,
  getOrders,
  updateOrder,
} from './order.service';

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

    return response.status(201).send(order);
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

/**
 * 处理订阅：后期
 */
export interface PostProcessSubsciption {
  order: OrderModel;
  product: ProductModel;
  socketId: string;
}

export const postProcessSubsciption = async (
  options: PostProcessSubsciption,
) => {
  const { id: orderId, userId } = options.order;
  const { subscriptionType } = options.product.meta;
  const { socketId } = options;

  // 订阅日志
  const subscriptionLog = await getSubscriptionLogByOrderId(orderId);

  // 找出订阅
  const subscription = await getSubscriptionById(
    subscriptionLog.subscriptionId,
  );

  // 订阅日志动作
  let action: SubscriptionLogAction;

  // 之前订阅类型
  let preType: SubscriptionType;

  // 订阅状态
  const status = SubscriptionStatus.valid;

  // 有效 SocketId
  const isValidSocketId = socketId && socketId !== 'NULL';

  // 新订阅
  if (subscription.status === SubscriptionStatus.pending) {
    // 设置新订阅的过期时间
    subscription.expired = dayjs(Date.now())
      .add(1, 'year')
      .format(DATE_TIME_FORMAT);

    action = SubscriptionLogAction.statusChanged;
    preType = null;
  }

  // 续订
  if (
    subscriptionType === subscription.type &&
    subscriptionLog.action === SubscriptionLogAction.renew
  ) {
    subscription.expired = dayjs(subscription.expired)
      .add(1, 'year')
      .format(DATE_TIME_FORMAT);

    action = SubscriptionLogAction.renewed;
  }

  // 重订
  if (
    subscriptionType === subscription.type &&
    subscriptionLog.action === SubscriptionLogAction.resubscribe
  ) {
    subscription.expired = dayjs(Date.now())
      .add(1, 'year')
      .format(DATE_TIME_FORMAT);

    action = SubscriptionLogAction.resubscribed;
  }

  // 升级
  if (subscriptionLog.action === SubscriptionLogAction.upgrade) {
    action = SubscriptionLogAction.upgraded;
  }

  // 更新订阅
  await updateSubscription(subscription.id, {
    type: subscriptionType,
    status,
    expired: subscription.expired,
  });

  // 创建订阅日志
  await createSubscriptionLog({
    userId,
    subscriptionId: subscription.id,
    orderId,
    action,
    meta: JSON.stringify({
      status,
      expired: dayjs(subscription.expired).toISOString(),
      type: subscriptionType,
      preType,
    }),
  });

  // 实时事件
  if (isValidSocketId) {
    socketIoServer.to(socketId).emit('subscriptionChanged', {
      ...subscription,
      type: subscriptionType,
      status,
      expired: subscription.expired,
      action,
    });
  }
};

/**
 * 支付
 */
export interface PrepayResult {
  codeUrl?: string;
  offSiteUrl?: string;
  payment?: PaymentName;
}

export const pay = async (
  request: Request,
  response: Response,
  next: NextFunction,
) => {
  const { order } = request.body;
  const { id: userId } = request.user;

  try {
    const data: PrepayResult = {};

    // 微信支付
    if (order.payment === PaymentName.wxpay) {
      const wxpayResult = await wxpay(order, request);
      data.codeUrl = wxpayResult.code_url;
      data.payment = PaymentName.wxpay;

      await createOrderLog({
        userId,
        orderId: order.id,
        action: OrderLogAction.orderUpdated,
        meta: JSON.stringify(wxpayResult),
      });
    }

    // 支付宝
    if (order.payment === PaymentName.alipay) {
      const alipayResult = await alipay(order, request);

      data.codeUrl = alipayResult.paymentUrl;
      data.payment = PaymentName.alipay;
      data.offSiteUrl = alipayResult.pagePayRequestUrl;

      await createOrderLog({
        userId,
        orderId: order.id,
        action: OrderLogAction.orderUpdated,
        meta: JSON.stringify(alipayResult),
      });
    }

    response.send(data);
  } catch (error) {
    return next(error);
  }
};

/**
 * 订单列表
 */
export const index = async (
  request: Request,
  response: Response,
  next: NextFunction,
) => {
  const { filter, pagination } = request;

  try {
    const orders = await getOrders({ filter, pagination });
    const ordersCount = await countOrders({ filter });

    response.header('X-Total-Count', ordersCount.count);
    return response.send({ orders, ordersCount });
  } catch (error) {
    return next(error);
  }
};

/**
 * 订单许可项目
 */
export const licenseItem = async (
  request: Request,
  response: Response,
  next: NextFunction,
) => {
  const { orderId } = request.params;

  try {
    const item = await getOrderLicenseItem(parseInt(orderId, 10));
    response.send(item);
  } catch (error) {
    return next(error);
  }
};
