import { Request, Response, NextFunction } from 'express';
import { allowedAccessCounts } from './dashboard.provider';

/**
 * 过滤时间段
 */
export const accessCountsFilter = async (
  request: Request,
  response: Response,
  next: NextFunction,
) => {
  const { dateTimeRange = '1-day' } = request.query;

  const filter = {
    name: 'dateTimeRange',
    sql: null,
    param: null,
  };

  switch (dateTimeRange) {
    case '1-day':
      filter.sql = 'access_log.created > now() - INTERVAL 1 DAY';
      filter.param = '%Y%m%d%H';
      break;
    case '7-day':
      filter.sql = 'access_log.created > now() - INTERVAL 7 DAY';
      filter.param = '%Y%m%d';
      break;
    case '1-month':
      filter.sql = 'access_log.created > now() - INTERVAL 1 MONTH';
      filter.param = '%Y%m%d';
      break;
    case '3-month':
      filter.sql = 'access_log.created > now() - INTERVAL 3 MONTH';
      filter.param = '%Y%m';
      break;
    default:
      filter.sql = 'access_log.created > now() - INTERVAL 1 DAY';
      filter.param = '%Y%m%d%H';
      break;
  }

  request.filter = filter;

  next();
};

/**
 * 访问次数守卫
 */
export const accessCountsGuard = async (
  request: Request,
  response: Response,
  next: NextFunction,
) => {
  const { action } = request.params;

  const allowedActions = allowedAccessCounts.map(
    (allowdAccessCount) => allowdAccessCount.action,
  );

  const isAllowdAction = allowedActions.includes(action);

  if (!isAllowdAction) return next(new Error('BAD_REQUEST'));

  return next();
};
