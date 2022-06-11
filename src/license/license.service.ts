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
