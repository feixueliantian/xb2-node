import { Request, Response, NextFunction } from 'express';
import { getAccessCounts } from './dashboard.service';

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
