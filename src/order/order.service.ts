import { connection } from '../app/database/mysql';
import { OrderModel } from './order.model';
import { orderSqlFragment } from './order.provider';
import { sqlFragment as postSqlFragment } from '../post/post.provider';
import {
  GetPostsOptionsFilter,
  GetPostsOptionsPagination,
} from '../post/post.service';

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
      \`order\`.id = ?
  `;

  const [data] = await connection.promise().query(statement, orderId);
  return data[0] as OrderModel;
};

/**
 * 更新订单
 */
export const updateOrder = async (orderId: number, order: OrderModel) => {
  const statement = `
    UPDATE \`order\`
    SET ?
    WHERE \`order\`.id = ?
  `;

  const [data] = await connection.promise().query(statement, [order, orderId]);
  return data as any;
};

/**
 * 调取订单列表
 */
export interface GetOrdersOptions {
  filter: GetPostsOptionsFilter;
  pagination: GetPostsOptionsPagination;
}

export const getOrders = async (options: GetOrdersOptions) => {
  const {
    pagination: { limit, offset },
    filter,
  } = options;

  const statement = `
    SELECT
      ${orderSqlFragment.orderFields},
      ${postSqlFragment.user},
      ${orderSqlFragment.productField}
    FROM
      \`order\`
    ${orderSqlFragment.leftJoinTables}
    WHERE ${filter.sql}
    GROUP BY order.id
    ORDER BY order.id DESC
    LIMIT ?
    OFFSET ?
  `;

  const params = [...filter.params, limit, offset];

  const [data] = await connection.promise().query(statement, params);
  return data as any;
};
