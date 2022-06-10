import { connection } from '../app/database/mysql';
import { OrderModel } from './order.model';

/**
 * 创建订单
 */
export const createOrder = async (order: OrderModel) => {
  const statement = `
    INSERT INTO \`order\`
    SET ?
  `;

  const [data] = await connection.promise().query(statement, order);
  return data as any;
};
