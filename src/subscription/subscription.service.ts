import { connection } from '../app/database/mysql';
import { OrderModel } from '../order/order.model';
import { ProductModel } from '../product/product.model';
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
  const { userId, order, product } = options;

  // 调取用户有效订阅
  const subscription = await getUserValidSubscription(userId);

  // 全新订阅
  if (!subscription) {
    await createSubscription({
      userId,
      type: product.meta.subscriptionType,
      status: SubscriptionStatus.pending,
    });
  }
};
