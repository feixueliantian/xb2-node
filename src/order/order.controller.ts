import { Request, Response, NextFunction } from 'express';
import { createOrder } from './order.service';

/**
 * 创建订单
 */
export const store = async (
  request: Request,
  response: Response,
  next: NextFunction,
) => {
  const { order } = request.body;

  try {
    const data = await createOrder(order);
    return response.status(201).send(data);
  } catch (error) {
    return next(error);
  }
};
