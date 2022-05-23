import path = require('path');
import { Request, Response, NextFunction } from 'express';
import multer = require('multer');
import { fileFilter } from '../file/file.middleware';
import Jimp = require('jimp');

const avatarUploadFilter = fileFilter(['image/png', 'image/jpg', 'image/jpeg']);
const avatarUpload = multer({
  dest: 'uploads/avatar',
  fileFilter: avatarUploadFilter,
});

export const avatarInterceptor = avatarUpload.single('avatar');

/**
 * 处理头像
 */
export const avatarProcessor = async (
  request: Request,
  response: Response,
  next: NextFunction,
) => {
  const { file } = request;
  const filePath = path.join(file.destination, 'resized', file.filename);

  try {
    const image = await Jimp.read(file.path);
    image.resize(256, 256).quality(85).write(`${filePath}-large`);
    image.resize(128, 128).quality(85).write(`${filePath}-medium`);
    image.resize(64, 64).quality(85).write(`${filePath}-thumbnail`);
  } catch (error) {
    return next(error);
  }
  return next();
};
