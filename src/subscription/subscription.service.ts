import { connection } from '../app/database/mysql';
import { SubscriptionModel } from './subscription.model';

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
