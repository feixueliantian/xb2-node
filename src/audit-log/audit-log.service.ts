import { connection } from '../app/database/mysql';
import { AuditLogModel } from './audit-log.model';

/**
 * 创建审核日志
 */
export const createAuditLog = async (auditLog: AuditLogModel) => {
  const statement = `
    INSERT INTO audit_log
    SET ?
  `;

  const [data] = await connection.promise().query(statement, auditLog);
  return data;
};

/**
 * 按照资源获取审核日志
 */
interface GetAuditLogByResourceOptions {
  resourceType?: string;
  resourceId?: number;
}

export const getAuditLogByResource = async (
  options: GetAuditLogByResourceOptions,
) => {
  const { resourceType, resourceId } = options;

  const statement = `
    SELECT *
    FROM audit_log
    WHERE resourceType = ? AND resourceId = ?
    ORDER BY audit_log.id DESC
  `;

  const [data] = await connection
    .promise()
    .query(statement, [resourceType, resourceId]);

  return data as Array<AuditLogModel>;
};
