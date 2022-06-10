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

/**
 * 按照 ID 获取订单
 */
export const getOrderById = async (orderId: number) => {
  const statement = `
    SELECT
      *
    FROM
      \`order\`
    WHERE
      order.id = ?
  `;

  const [data] = await connection.promise().query(statement, orderId);
  return data[0] as OrderModel;
};
