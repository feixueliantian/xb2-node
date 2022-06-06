import { Request, Response, NextFunction } from 'express';
import { getAccessCounts, getAccessCountsByAction } from './dashboard.service';

/**
 * 访问次数列表
 */
export const accessCountIndex = async (
  request: Request,
  response: Response,
  next: NextFunction,
) => {
  const { filter } = request;

  try {
    const accessCounts = await getAccessCounts({ filter });
    return response.send(accessCounts);
  } catch (error) {
    return next(error);
  }
};

/**
 * 按动作显示访问次数
 */
export const accessCountShow = async (
  request: Request,
  response: Response,
  next: NextFunction,
) => {
  const { action } = request.params;
  const { filter } = request;

  try {
    const accessCount = await getAccessCountsByAction({
      action,
      filter,
    });
    return response.send(accessCount);
  } catch (error) {
    return next(error);
  }
};
