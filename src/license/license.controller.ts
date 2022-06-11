import { Request, Response, NextFunction } from 'express';
import { ResourceType } from '../app/app.enum';
import { getUserValidLicense } from './license.service';

/**
 * 调取有效许可
 */
export const valideLicense = async (
  request: Request,
  response: Response,
  next: NextFunction,
) => {
  const { id: userId } = request.user;
  const { resourceType, resourceId } = request.query;

  try {
    const data = await getUserValidLicense(
      userId,
      ResourceType[resourceType as string],
      parseInt(resourceId as string, 10),
    );

    return response.send(data);
  } catch (error) {
    return next(error);
  }
};
