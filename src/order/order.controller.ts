import { Request, Response, NextFunction } from 'express';
import { createOrder, updateOrder } from './order.service';

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

/**
 * 更新订单
 */
export const update = async (
  request: Request,
  response: Response,
  next: NextFunction,
) => {
  const { dataForUpdate, order } = request.body;

  try {
    const data = await updateOrder(order.id, dataForUpdate);
    return response.send(data);
  } catch (error) {
    return next(error);
  }
};
