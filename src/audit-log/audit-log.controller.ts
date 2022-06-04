import { Request, Response, NextFunction } from 'express';
import { AuditLogStatus } from './audit-log.model';
import {
  createAuditLog,
  deleteAuditLog,
  getAuditLogByResource,
} from './audit-log.service';

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

/**
 * 取消审核日志
 */
export const revoke = async (
  request: Request,
  response: Response,
  next: NextFunction,
) => {
  const { resourceId, resourceType } = request.body;
  const { id: userId } = request.user;

  try {
    const [auditLog] = await getAuditLogByResource({
      resourceId,
      resourceType,
    });

    const canRevokeAudit =
      auditLog &&
      auditLog.status === AuditLogStatus.pending &&
      auditLog.userId === userId;

    if (!canRevokeAudit) throw new Error('BAD_REQUEST');

    await deleteAuditLog(auditLog.id);
    return response.send({ message: '成功取消审核' });
  } catch (error) {
    return next(error);
  }
};
