import { connection } from '../app/database/mysql';
import { OrderLogModel } from './order-log.model';

/**
 * 创建订单日志
 */
export const createOrderLog = async (orderLog: OrderLogModel) => {
  const statement = `
    INSERT INTO order_log
    SET ? 
  `;

  const [data] = await connection.promise().query(statement, orderLog);
  return data as any;
};
