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
