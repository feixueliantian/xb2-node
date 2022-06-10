import { Request, Response, NextFunction } from 'express';
import { getProductByType } from './product.service';

/**
 * 获取许可产品
 */
export const showLicenseProduct = async (
  request: Request,
  response: Response,
  next: NextFunction,
) => {
  try {
    const product = await getProductByType('license');
    return response.send(product);
  } catch (error) {
    return next(error);
  }
};
