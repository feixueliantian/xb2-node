import dayjs = require('dayjs');
import { Request, Response, NextFunction } from 'express';
import { SubscriptionModel } from './subscription.model';
import {
  getSubscriptionHistory,
  getUserValidSubscription,
} from './subscription.service';

/**
 * 有效订阅
 */
export interface ValidSubscription extends SubscriptionModel {
  isExpired: boolean;
  daysRemaining: number;
}

export const validSubscription = async (
  request: Request,
  response: Response,
  next: NextFunction,
) => {
  const { id: userId } = request.user;

  try {
    const subscription = await getUserValidSubscription(userId);
    const validSubscription = subscription
      ? (subscription as ValidSubscription)
      : null;

    if (subscription) {
      validSubscription.isExpired = dayjs().isAfter(subscription.expired);
      validSubscription.daysRemaining = validSubscription.isExpired
        ? 0
        : dayjs(subscription.expired).diff(dayjs(), 'days');
    }

    response.send(validSubscription);
  } catch (error) {
    return next(error);
  }
};

/**
 * 订阅历史
 */
export const history = async (
  request: Request,
  response: Response,
  next: NextFunction,
) => {
  const { subscriptionId } = request.params;

  try {
    const history = await getSubscriptionHistory(parseInt(subscriptionId, 10));
    response.send(history);
  } catch (error) {
    return next(error);
  }
};
