import { connection } from '../app/database/mysql';
import { SubscriptionLogModel } from './subscription-log.model';

/**
 * 创建订阅日志
 */
export const createSubscriptionLog = async (
  subscriptionLog: SubscriptionLogModel,
) => {
  const statement = `
    INSERT INTO subscription_log
    SET ?
  `;

  const [data] = await connection.promise().query(statement, subscriptionLog);
  return data as any;
};
