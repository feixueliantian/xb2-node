import { connection } from '../app/database/mysql';
import { OrderModel } from './order.model';
import { orderSqlFragment } from './order.provider';
import { sqlFragment as postSqlFragment } from '../post/post.provider';
import {
  GetPostsOptionsFilter,
  GetPostsOptionsPagination,
} from '../post/post.service';
import { PostModel } from '../post/post.model';
import { SubscriptionType } from '../subscription/subscription.model';

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
  pagination?: GetPostsOptionsPagination;
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

/**
 * 统计订单
 */
export const countOrders = async (options: GetOrdersOptions) => {
  const { filter } = options;

  const statement = `
    SELECT
      COUNT(*) as count,
      SUM(totalAmount) as totalAmount
    FROM
      (
        SELECT
          order.totalAmount
        FROM
          \`order\`
        ${orderSqlFragment.leftJoinTables}
        WHERE ${filter.sql}
        GROUP BY order.id
      ) AS count
  `;

  const [data] = await connection.promise().query(statement, filter.params);
  return data[0] as any;
};

/**
 * 根据订单 ID 获取对应的 post
 */
export const getOrderLicenseItem = async (orderId: number) => {
  const post = await getPostByOrderId(orderId);
  if (!post) return null;

  const statement = `
    SELECT
      post.id,
      post.title,
      ${postSqlFragment.file},
      ${postSqlFragment.user}
    FROM
      post
    ${postSqlFragment.leftJoinOneFile}
    ${postSqlFragment.leftJoinUser}
    WHERE
      post.id = ?
    GROUP BY
      post.id
  `;

  const [data] = await connection.promise().query(statement, post.id);
  const postData = data[0];

  const salesData = await getPostSalesByPostId(post.id);
  if (salesData) {
    postData.sales = salesData.sales;
  } else {
    postData.sales = null;
  }
  return postData as any;
};

const getPostByOrderId = async (orderId: number) => {
  const statement = `
    SELECT
      post.*
    FROM
      \`order\`
    INNER JOIN
      license ON license.orderId = order.id
    INNER JOIN
      post ON post.id = license.resourceId
    WHERE
      order.id = ?
      AND order.status = 'completed'
    `;

  const [data] = await connection.promise().query(statement, orderId);
  return data[0] as PostModel;
};

const getPostSalesByPostId = async (postId: number) => {
  const statement = `
    SELECT
      JSON_OBJECT(
        'count', COUNT(order.id),
        'totalAmount', IF(
          COUNT(order.id),
          SUM(order.totalAmount),
          0
        )
      ) AS sales
    FROM
      license
    LEFT JOIN \`order\` ON license.orderId = order.id
    WHERE license.resourceId = ?
    GROUP BY license.resourceId
  `;

  const [data] = await connection.promise().query(statement, postId);
  return data[0] as any;
};

/**
 * 调取订单订阅项目
 */
export const getOrderSubscriptionItem = async (
  subscriptionType: SubscriptionType,
) => {
  const statement = `
    SELECT
      product.id,
      product.title,
      product.type,
      product.meta,
      JSON_OBJECT(
        'count', COUNT(order.id),
        'totalAmount', SUM(order.totalAmount)
      ) AS sales
    FROM
      \`order\`
    LEFT JOIN
      product ON order.productId = product.id
    WHERE
      order.status = 'completed'
      AND product.meta->'$.subscriptionType' = ?
    GROUP BY product.id
  `;

  const [data] = await connection.promise().query(statement, subscriptionType);
  return data[0] as any;
};
