import { connection } from '../app/database/mysql';
import { DownloadModel } from './download.model';

/**
 * 创建下载
 */
export const createDownload = async (download: DownloadModel) => {
  const statement = `
    INSERT INTO download
    SET ?
  `;

  const [data] = await connection.promise().query(statement, download);
  return data as any;
};

/**
 * 按照 ID 调取下载
 */
export const getDownloadById = async (downloadId: number) => {
  const statement = `
    SELECT
      *
    FROM
      download
    WHERE
      download.id = ?
  `;

  const [data] = await connection.promise().query(statement, downloadId);
  return data[0] as DownloadModel;
};

/**
 * 按照 token 调取下载
 */
export const getDownloadByToken = async (token: string) => {
  const statement = `
    SELECT
      *
    FROM
      download
    WHERE
      download.token = ?
  `;

  const [data] = await connection.promise().query(statement, token);
  return data[0] as DownloadModel;
};

/**
 * 更新下载
 */
export const updateDownloadById = async (
  downloadId: number,
  download: DownloadModel,
) => {
  const statement = `
    UPDATE download
    SET ?
    WHERE download.id = ?
  `;

  const [data] = await connection
    .promise()
    .query(statement, [download, downloadId]);
  return data as any;
};
