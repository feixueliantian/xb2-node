import { Request, Response, NextFunction } from 'express';
import { uid } from '../app/app.service';
import { createDownload, getDownloadById } from './download.service';

/**
 * 创建下载
 */
export const store = async (
  request: Request,
  response: Response,
  next: NextFunction,
) => {
  const { resourceType, resourceId, license } = request.body;
  const { id: userId } = request.user;

  try {
    let licenseId: number | null;
    if (license) {
      licenseId = license.id;
    }

    const token = uid();

    const data = await createDownload({
      userId,
      licenseId,
      token,
      resourceType,
      resourceId,
    });

    const download = await getDownloadById(data.insertId);

    response.send(download);
  } catch (error) {
    return next(error);
  }
};
