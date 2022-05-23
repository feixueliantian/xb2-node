import path = require('path');
import { access } from 'fs/promises';
import { constants } from 'fs';

import { Request, Response, NextFunction } from 'express';
import { createAvatar, getAvatarByUserId } from './avatar.service';

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

/**
 * 头像服务
 */
export const serve = async (
  request: Request,
  response: Response,
  next: NextFunction,
) => {
  const { userId } = request.params;
  const { size } = request.query;

  try {
    // 获取头像文件的信息
    const avatar = await getAvatarByUserId(parseInt(userId, 10));
    if (!avatar) throw new Error();

    let root: string;
    let filename: string;

    if (size) {
      // 检查头像尺寸
      const avatarSizes = ['large', 'medium', 'thumbnail'];
      if (!avatarSizes.includes(size as string)) throw new Error();

      // 检查头像是否存在
      root = path.join(__dirname, '../../uploads/avatar/resized');
      filename = `${avatar.filename}-${size}`;
      await access(path.join(root, filename), constants.F_OK);
    } else {
      // 检查头像是否存在
      root = path.join(__dirname, '../../uploads/avatar');
      filename = avatar.filename;
      await access(path.join(root, filename), constants.F_OK);
    }

    return response.sendFile(filename, {
      root,
      headers: {
        'Content-Type': avatar.mimetype,
      },
    });
  } catch (error) {
    return next(new Error('FILE_NOT_FOUND'));
  }
};
