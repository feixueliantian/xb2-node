import dayjs = require('dayjs');
import { connection } from '../app/database/mysql';
import { OrderModel } from '../order/order.model';
import { ProductModel } from '../product/product.model';
import { getProductByType } from '../product/product.service';
import { SubscriptionLogAction } from '../subscription-log/subscription-log.model';
import { createSubscriptionLog } from '../subscription-log/subscription-log.service';
import {
  SubscriptionModel,
  SubscriptionStatus,
  SubscriptionType,
} from './subscription.model';

/**
 * 创建订阅
 */
export const createSubscription = async (subscription: SubscriptionModel) => {
  const statement = `
    INSERT INTO subscription
    SET ?
  `;

  const [data] = await connection.promise().query(statement, subscription);
  return data as any;
};

/**
 * 更新订阅
 */
export const updateSubscriptino = async (
  subscriptionId: number,
  subscription: SubscriptionModel,
) => {
  const statement = `
    UPDATE subscription
    SET ?
    WHERE subscription.id = ?
  `;

  const [data] = await connection
    .promise()
    .query(statement, [subscription, subscriptionId]);

  return data as any;
};

/**
 * 调取用户有效订阅
 */
export const getUserValidSubscription = async (userId: number) => {
  const statement = `
    SELECT
      *
    FROM
      subscription
    WHERE
      subscription.status = 'valid'
      AND subscription.userId = ?
  `;

  const [data] = await connection.promise().query(statement, userId);
  return data[0] as SubscriptionModel;
};

/**
 * 处理订阅
 */
export interface ProcessSubscriptionOptions {
  userId: number;
  order: OrderModel;
  product: ProductModel;
}

export const processSubscription = async (
  options: ProcessSubscriptionOptions,
) => {
  const {
    userId,
    order,
    product: {
      meta: { subscriptionType },
    },
  } = options;

  // 调取用户有效订阅
  const subscription = await getUserValidSubscription(userId);

  // 订阅 ID
  let subscriptionId = subscription ? subscription.id : null;

  // 订阅日志动作
  let action: SubscriptionLogAction;

  // 全新订阅
  if (!subscription) {
    const data = await createSubscription({
      userId,
      type: subscriptionType,
      status: SubscriptionStatus.pending,
    });

    action = SubscriptionLogAction.create;
    subscriptionId = data.insertId;
  } else {
    // 检查订阅是否已经过期了
    const isExpried = dayjs().isAfter(subscription.expired);

    // 续订
    if (subscriptionType === subscription.type && !isExpried) {
      action = SubscriptionLogAction.renew;
    }

    // 重订
    if (subscriptionType === subscription.type && isExpried) {
      action = SubscriptionLogAction.resubscribe;
    }

    // 升级
    if (
      subscription.type === SubscriptionType.standard &&
      subscriptionType === SubscriptionType.pro &&
      !isExpried
    ) {
      // 订阅剩余天数
      const daysRemaining = Math.abs(
        dayjs().diff(subscription.expired, 'days'),
      );

      // 专业订阅产品
      const proSubscriptionProduct = await getProductByType('subscription', {
        meta: {
          subscriptionType: SubscriptionType.pro,
        },
      });

      // 专业订阅金额
      const proAmount =
        (proSubscriptionProduct.salePrice / 365) * daysRemaining;

      // 标准订阅产品
      const standardSubscriptionProduct = await getProductByType(
        'subscription',
        {
          meta: {
            subscriptionType: SubscriptionType.standard,
          },
        },
      );

      // 剩余金额
      const leftAmount =
        (standardSubscriptionProduct.salePrice / 365) * daysRemaining;

      // 升级应付金额
      order.totalAmount = parseFloat((proAmount - leftAmount).toFixed(2));

      // 订阅日志动作
      action = SubscriptionLogAction.upgrade;
    }
  }

  // 创建订阅日志
  await createSubscriptionLog({
    subscriptionId,
    userId,
    orderId: order.id,
    action,
    meta: JSON.stringify({
      subscriptionType,
      totalAmount: `${order.totalAmount}`,
    }),
  });

  // 提供数据
  return action === SubscriptionLogAction.upgrade ? { order } : null;
};
