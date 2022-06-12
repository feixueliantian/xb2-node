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

/**
 * 按照订单 ID 调取订阅日志
 */
export const getSubscriptionLogByOrderId = async (orderId: number) => {
  const statement = `
    SELECT
      *
    FROM
      subscription_log
    WHERE
      subscription_log.orderId = ?
    ORDER BY
      subscription_log.id DESC
    LIMIT 1 
  `;

  const [data] = await connection.promise().query(statement, orderId);
  return data[0] as SubscriptionLogModel;
};
