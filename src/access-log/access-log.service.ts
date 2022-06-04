import { socketIoServer } from '../app/app.server';
import { connection } from '../app/database/mysql';

/**
 * 创建访问日志
 */
export const createAccessLog = async (accessLog: AccessLogModel) => {
  const statement = `
    INSERT INTO access_log
    SET ?
  `;

  const [data] = await connection.promise().query(statement, accessLog);

  socketIoServer.emit('accessLogCreated', accessLog);

  return data;
};
