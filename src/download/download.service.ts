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

/**
 * 统计下载次数
 */
export interface CountDownloadsOptions {
  userId: number;
  datetime: string;
  type: string;
}

export const countDownloads = async (options: CountDownloadsOptions) => {
  const { datetime, userId, type } = options;

  // 查询条件
  const whereUsed = 'download.used IS NOT NULL';
  const whereUserId = 'download.userId = ?';

  let whereDatetime = '';
  let whereType = '';

  switch (datetime) {
    case '1-day':
      whereDatetime = 'download.created > now() - INTERVAL 1 DAY';
      break;
    case '7-day':
      whereDatetime = 'download.created > now() - INTERVAL 7 DAY';
      break;
    case '1-month':
      whereDatetime = 'download.created > now() - INTERVAL 1 MONTH';
      break;
    case '3-month':
      whereDatetime = 'download.created > now() - INTERVAL 3 MONTH';
      break;
  }

  if (type === 'license') {
    whereType = 'download.licenseId IS NOT NULL';
  }

  if (type === 'subscription') {
    whereType = 'download.licenseId IS NULL';
  }

  const statement = `
    SELECT
      count(download.id) AS count
    FROM
      download
    WHERE
      ${whereUsed}
      AND ${whereUserId}
      AND ${whereDatetime}
      AND ${whereType}
  `;

  const [data] = await connection.promise().query(statement, userId);
  return data[0] as { count: number };
};
