import { Request, Response, NextFunction } from 'express';

/**
 * 支付地址
 */
export const paymentUrl = async (
  request: Request,
  response: Response,
  next: NextFunction,
) => {
  const { paymentUrl } = request.body;
  return response.redirect(301, paymentUrl.url);
};
