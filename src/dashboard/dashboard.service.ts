import { access } from 'fs';
import { connection } from '../app/database/mysql';
import { AccessCountListItem, allowedAccessCounts } from './dashboard.provider';

/**
 * 获取访问次数列表
 */
interface GetAccessCountsOptions {
  filter: {
    name: string;
    sql?: string;
    param?: string;
  };
}

export const getAccessCounts = async (options: GetAccessCountsOptions) => {
  const {
    filter: { sql: whereDatetimeRange },
  } = options;

  // 允许的动作
  const allowedActions = allowedAccessCounts
    .map((allowedAccess) => `'${allowedAccess.action}'`)
    .join(',');

  // 允许的动作条件
  const andWhereActionIn = `AND action in (${allowedActions})`;

  const statement = `
    SELECT
      access_log.action,
      COUNT(access_log.id) AS value
    FROM
      access_log
    WHERE
      ${whereDatetimeRange} ${andWhereActionIn}
    GROUP BY
      access_log.action
  `;

  const [data] = await connection.promise().query(statement);
  const results = data as Array<AccessCountListItem>;

  return allowedAccessCounts.map((allowedAccess) => {
    const result = results.find(
      (result) => result.action === allowedAccess.action,
    );
    allowedAccess.value = result && result.value ? result.value : 0;
    return allowedAccess;
  });
};
