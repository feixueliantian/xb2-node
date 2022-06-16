import { Request, Response, NextFunction } from 'express';
import _ = require('lodash');
import { PaymentName } from '../payment/payment.model';
import { getPostById, PostStatus } from '../post/post.service';
import { ProductStatus, ProductType } from '../product/product.model';
import { getProductById } from '../product/product.service';
import { OrderStatus } from './order.model';
import { getOrderById } from './order.service';

/**
 * 订单守卫
 */
export const orderGuard = async (
  request: Request,
  response: Response,
  next: NextFunction,
) => {
  // 准备数据
  const { user: currentUser } = request;
  const { payment, productId, resourceType, resourceId } = request.body;

  try {
    // 检查支付方式
    const isValidPayment = payment in PaymentName;
    if (!isValidPayment) throw new Error('BAD_REQUEST');

    // 检查资源类型
    const isValidResourceType = ['post', 'subscription'].includes(resourceType);
    if (!isValidResourceType) throw new Error('BAD_REQUEST');

    // 检查内容
    if (resourceType === 'post') {
      const post = await getPostById(resourceId, { currentUser });
      const isValidPost = post && post.status === PostStatus.published;
      if (!isValidPost) throw new Error('BAD_REQUEST');
    }

    // 检查产品
    const product = await getProductById(productId);
    const isValidProduct =
      product && product.status === ProductStatus.published;
    if (!isValidProduct) throw new Error('BAD_REQUEST');

    // 准备订单数据
    const order = {
      userId: currentUser.id,
      productId,
      status: OrderStatus.pending,
      payment,
      totalAmount: product.salePrice,
    };

    // 设置请求主体
    request.body = {
      ...request.body,
      order,
      product,
    };
  } catch (error) {
    return next(error);
  }

  // 下一步
  return next();
};

/**
 * 更新订单守卫
 */
export const updateOrderGuard = async (
  request: Request,
  response: Response,
  next: NextFunction,
) => {
  // 准备数据
  const { orderId } = request.params;
  const { payment } = request.body;

  try {
    // 检查支付方法
    const isValidPayment = payment && payment in PaymentName;
    if (!isValidPayment) throw new Error('BAD_REQUEST');

    // 检查订单
    const order = await getOrderById(parseInt(orderId, 10));
    const isValidOrder =
      order &&
      order.status === OrderStatus.pending &&
      order.payment !== payment;
    if (!isValidOrder) throw new Error('BAD_REQUEST');

    // 设置请求主体
    const dataForUpdate = {
      payment,
    };
    request.body = {
      dataForUpdate,
      order,
    };
  } catch (error) {
    return next(error);
  }

  // 下一步
  return next();
};

/**
 * 支付订单守卫
 */
export const payOrderGuard = async (
  request: Request,
  response: Response,
  next: NextFunction,
) => {
  const { orderId } = request.params;
  const { id: userId } = request.user;

  try {
    const order = await getOrderById(parseInt(orderId, 10));
    const isValidOrder = order && order.status === OrderStatus.pending;
    if (!isValidOrder) throw new Error('BAD_REQUEST');

    const isOwner = order.userId === userId;
    if (!isOwner) throw new Error('FORBIDDEN');

    request.body.order = order;
  } catch (error) {
    return next(error);
  }

  return next();
};

/**
 * 订单列表过滤器
 */
export interface OrderIndexAllowedFilter {
  order?: string;
  user?: string;
  payment?: string;
  status?: OrderStatus;
  owner?: number;
  created?: Array<string>;
  productType?: ProductType;
}

export const orderIndexFilter = async (
  request: Request,
  response: Response,
  next: NextFunction,
) => {
  const filters: OrderIndexAllowedFilter = _.pick(request.query, [
    'order',
    'user',
    'payment',
    'status',
  ]) as OrderIndexAllowedFilter;

  // 订单日期
  const { created } = request.query;
  if (created) {
    const dates = decodeURI(created as string).split('|');
    filters.created = dates;
  }

  // 当前用户
  const { id: userId } = request.user;
  filters.owner = userId;

  // 管理模式
  const { admin, productType } = request.query;
  if (admin === 'true' && userId === 1) {
    delete filters.owner;

    if (productType) {
      filters.productType = ProductType[productType as string];
    }
  }

  // 过滤条件 SQL
  let filterSql = 'order.id IS NOT NULL';

  // SQL 参数
  let params = [];

  for (const [type, value] of Object.entries(filters)) {
    let sql = '';

    switch (type) {
      case 'status':
        sql = 'order.status = ?';
        break;
      case 'order':
        sql = 'order.id = ?';
        break;
      case 'user':
        sql = 'user.name LIKE ?';
        break;
      case 'payment':
        sql = 'order.payment = ?';
        break;
      case 'created':
        sql = 'DATE(order.created) between ? AND ?';
        break;
      case 'owner':
        sql = 'post.userId = ?';
        break;
      case 'productType':
        sql = 'product.type = ?';
        break;
    }

    filterSql = `${filterSql} AND ${sql}`;

    if (Array.isArray(value)) {
      params = [...params, ...value];
    } else {
      params = [...params, value];
    }
  }

  request.filter = {
    name: 'orderIndex',
    sql: filterSql,
    params,
  };

  return next();
};
