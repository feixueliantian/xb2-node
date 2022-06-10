import { Request, Response, NextFunction } from 'express';
import { PaymentName } from '../payment/payment.model';
import { getPostById, PostStatus } from '../post/post.service';
import { ProductStatus } from '../product/product.model';
import { getProductById } from '../product/product.service';
import { OrderStatus } from './order.model';

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
