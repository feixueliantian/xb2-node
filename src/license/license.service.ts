import { ResourceType } from '../app/app.enum';
import { connection } from '../app/database/mysql';
import { LicenseModel } from './license.model';

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
