import { Request, Response, NextFunction } from 'express';
import { createAvatar } from './avatar.service';

/**
 * 上传头像处理器
 */
export const store = async (
  request: Request,
  response: Response,
  next: NextFunction,
) => {
  const { id: userId } = request.user;
  const { filename, mimetype, size } = request.file;
  const avatar = {
    userId,
    filename,
    mimetype,
    size,
  };

  try {
    const data = await createAvatar(avatar);
    return response.status(201).send(data);
  } catch (error) {
    return next(error);
  }
};
