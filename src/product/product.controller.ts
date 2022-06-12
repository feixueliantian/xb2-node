import { Request, Response, NextFunction } from 'express';
import { SubscriptionType } from '../subscription/subscription.model';
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

/**
 * 获取订阅产品
 */
export const showSubscriptionProduct = async (
  request: Request,
  response: Response,
  next: NextFunction,
) => {
  try {
    const data = [];

    const standardProduct = await getProductByType('subscription', {
      meta: {
        subscriptionType: SubscriptionType.standard,
      },
    });

    if (standardProduct) {
      data.push(standardProduct);
    }

    const proProduct = await getProductByType('subscription', {
      meta: {
        subscriptionType: SubscriptionType.pro,
      },
    });

    if (proProduct) {
      data.push(proProduct);
    }

    return response.send(data);
  } catch (error) {
    return next(error);
  }
};
