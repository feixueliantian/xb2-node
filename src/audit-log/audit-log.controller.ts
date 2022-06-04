import { Request, Response, NextFunction } from 'express';
import { createAuditLog } from './audit-log.service';

/**
 * 创建审核日志
 */
export const store = async (
  request: Request,
  response: Response,
  next: NextFunction,
) => {
  try {
    const data = await createAuditLog(request.body);
    return response.status(201).send(data);
  } catch (error) {
    return next(error);
  }
};
