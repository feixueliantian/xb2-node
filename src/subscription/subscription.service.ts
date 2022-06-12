import { connection } from '../app/database/mysql';
import { OrderModel } from '../order/order.model';
import { ProductModel } from '../product/product.model';
import { SubscriptionLogAction } from '../subscription-log/subscription-log.model';
import { createSubscriptionLog } from '../subscription-log/subscription-log.service';
import { SubscriptionModel, SubscriptionStatus } from './subscription.model';

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
  }

  // 创建订阅日志
  await createSubscriptionLog({
    subscriptionId,
    userId,
    orderId: order.id,
    action,
    meta: JSON.stringify({
      subscriptionType,
      totalAmount: order.totalAmount,
    }),
  });
};
