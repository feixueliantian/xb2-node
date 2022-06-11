import { ResourceType } from '../app/app.enum';
import { connection } from '../app/database/mysql';
import { LicenseModel } from './license.model';
import { sqlFragment as postSqlFragment } from '../post/post.provider';
import { licenseSqlFragment } from './license.provider';

/**
 * 创建许可
 */
export const createLicense = async (license: LicenseModel) => {
  const statement = `
    INSERT INTO license
    SET ?
  `;

  const [data] = await connection.promise().query(statement, license);
  return data as any;
};

/**
 * 更新许可
 */
export const updateLicense = async (
  licenseId: number,
  license: LicenseModel,
) => {
  const statement = `
    UPDATE license
    SET ?
    WHERE license.id = ?
  `;

  const [data] = await connection
    .promise()
    .query(statement, [license, licenseId]);

  return data as any;
};

/**
 * 按照订单 ID 获取许可
 */
export const getLicenseByOrderId = async (orderId: number) => {
  const statement = `
    SELECT
      *
    FROM
      license
    WHERE
      license.orderId = ?
  `;

  const [data] = await connection.promise().query(statement, orderId);
  return data[0] as LicenseModel;
};

/**
 * 有效许可证
 */
export const getUserValidLicense = async (
  userId: number,
  resourceType: ResourceType,
  resourceId: number,
) => {
  const statement = `
    SELECT
      *
    FROM
      license
    WHERE
      license.status = 'valid'
      AND license.userId = ?
      AND license.resourceType = ?
      AND license.resourceId = ?
    ORDER BY
      license.id DESC
    LIMIT
      1
  `;

  const [data] = await connection
    .promise()
    .query(statement, [userId, resourceType, resourceId]);
  return data[0] as LicenseModel;
};

/**
 * 调取许可列表
 */
export interface GetLicensesOptions {
  filters?: { user?: number };
  pagination?: { limit?: number; offset?: number };
}

export const getLicenses = async (options: GetLicensesOptions) => {
  const { user } = options.filters;
  const { limit, offset } = options.pagination;
  const params = [user, limit, offset];

  const statement = `
    SELECT
      license.id,
      license.created,
      ${postSqlFragment.user},
      ${licenseSqlFragment.order},
      ${licenseSqlFragment.resource},
      ${postSqlFragment.file}
    FROM
      license
    ${licenseSqlFragment.leftJoinLicenseUser}
    ${licenseSqlFragment.leftJoinOrder}
    ${licenseSqlFragment.leftJoinPost}
    ${licenseSqlFragment.leftJoinResourceUser}
    ${postSqlFragment.innerJoinFile}
    WHERE
      license.status = 'valid'
      AND license.userId = ?
    GROUP BY license.id
    ORDER BY license.id DESC
    LIMIT ?
    OFFSET ?
  `;

  // 执行查询
  const [data] = await connection.promise().query(statement, params);
  return data as any;
};

/**
 * 统计许可列表数量
 */
export const getLicensesTotalCount = async (options: GetLicensesOptions) => {
  const { user } = options.filters;
  const params = [user];

  const statement = `
    SELECT
      COUNT(license.id) AS total
    FROM
      license
    WHERE
      license.status = 'valid'
      AND license.userId = ?
  `;

  const [data] = await connection.promise().query(statement, params);
  return data[0].total;
};
