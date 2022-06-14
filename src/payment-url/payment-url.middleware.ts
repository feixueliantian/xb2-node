import dayjs = require('dayjs');
import { Request, Response, NextFunction } from 'express';
import { DATE_TIME_FORMAT } from '../app/app.config';
import { getPaymentUrlByToken, updatePaymentUrl } from './payment-url.service';

/**
 * 支付地址守卫
 */
export const paymentUrlGuard = async (
  request: Request,
  response: Response,
  next: NextFunction,
) => {
  const { token } = request.query;

  try {
    // 检查 token
    if (!token) throw new Error('BAD_REQUEST');

    // 检查支付地址是否有效
    const paymentUrl = await getPaymentUrlByToken(token as string);
    const isValidPaymentUrl = paymentUrl && !paymentUrl.used;
    if (!isValidPaymentUrl) throw new Error('BAD_REQUEST');

    // 检查支付地址是否过期
    const isExpired = dayjs().subtract(2, 'hours').isAfter(paymentUrl.created);
    if (!isExpired) throw new Error('PAYMENT_EXPIRED');

    // 更新支付地址，将 used 设置为当前时间
    await updatePaymentUrl(paymentUrl.id, {
      used: dayjs().format(DATE_TIME_FORMAT),
    });

    // 设置请求
    request.body.paymentUrl = paymentUrl;
  } catch (error) {
    return next(error);
  }

  return next();
};
