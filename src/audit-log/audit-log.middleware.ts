import { Request, Response, NextFunction } from 'express';
import { possess } from '../auth/auth.service';
import { AuditLogStatus } from './audit-log.model';
import { getAuditLogByResource } from './audit-log.service';

/**
 * 审核日志守卫
 */
export const auditLogGuard = async (
  request: Request,
  response: Response,
  next: NextFunction,
) => {
  const { id: userId, name: userName } = request.user;
  const { resourceType, resourceId, note, status } = request.body;

  // 验证资源类型是否有效
  const isValideResourceType = ['post', 'comment'].includes(resourceType);
  if (!isValideResourceType) return next(new Error('BAD_REQUEST'));

  // 准备日志数据
  request.body = {
    userId,
    userName,
    resourceId,
    resourceType,
    status,
    note,
  };

  // 管理员
  const isAdmin = userId === 1;

  if (!isAdmin) {
    try {
      // 只有资源作者才能审核资源
      const isOwner = await possess({ resourceId, resourceType, userId });
      if (!isOwner) throw new Error('USER_DOSE_NOT_OWN_RESOURCE');

      // 资源作者审核资源的时候，只能将 status 设置为 pending
      request.body.status = AuditLogStatus.pending;
    } catch (error) {
      return next(error);
    }
  }

  // 检查审核日志的状态是否已经存在
  try {
    const [auditLog] = await getAuditLogByResource({
      resourceType,
      resourceId,
    });

    // 资源状态不能相同
    const isSameStatue = auditLog && auditLog.status === request.body.status;
    if (isSameStatue) throw new Error('BAD_REQUEST');
  } catch (error) {
    return next(error);
  }

  return next();
};
