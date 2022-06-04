import { Request, Response, NextFunction } from 'express';
import { possess } from '../auth/auth.service';
import { AuditLogStatus } from './audit-log.model';

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

  if (isAdmin) {
    return next();
  }

  // 作者
  try {
    const isOwner = await possess({ resourceId, resourceType, userId });
    if (isOwner) {
      // 资源作者审核资源的时候，只能将 status 设置为 pending
      request.body.status = AuditLogStatus.pending;
      return next();
    }
  } catch (error) {
    return next(error);
  }

  // 其他人无权审核资源
  return next(new Error('USER_DOES_NOT_OWN_RESOURCE'));
};
