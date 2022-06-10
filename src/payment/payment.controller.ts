import { Request, Response, NextFunction } from 'express';
import { getPayments } from './payment.service';
/**
 * 获取支付方式
 */
export const index = async (
  request: Request,
  response: Response,
  next: NextFunction,
) => {
  try {
    const payments = await getPayments();
    return response.send(payments);
  } catch (error) {
    return next(error);
  }
};
