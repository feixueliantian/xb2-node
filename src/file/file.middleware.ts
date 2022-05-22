import { Request, Response, NextFunction } from 'express';
import multer = require('multer');
import { FileFilterCallback } from 'multer';
import Jimp = require('jimp');
import { imageResizer } from './file.service';

/**
 * 文件过滤器
 */
const fileFilter = (fileTypes: string[]) => {
  return (
    request: Request,
    file: Express.Multer.File,
    callback: FileFilterCallback,
  ) => {
    if (fileTypes.includes(file.mimetype)) {
      callback(null, true);
    } else {
      callback(new Error('FILE_TYPE_NOT_ACCEPT'));
    }
  };
};

const fileUploadFilter = fileFilter(['image/png', 'image/jpg', 'image/jpeg']);

/**
 * 创建一个 Multer
 */
const fileUpload = multer({
  dest: 'uploads/',
  fileFilter: fileUploadFilter,
});

/**
 * 文件拦截器
 */
export const fileInterceptor = fileUpload.single('file');

/**
 * 文件处理器
 */
export const fileProcessor = async (
  request: Request,
  response: Response,
  next: NextFunction,
) => {
  const { path } = request.file;

  let image: Jimp;

  try {
    image = await Jimp.read(path);
  } catch (error) {
    return next(error);
  }

  const { imageSize, tags } = image['_exif'];

  request.fileMetaData = {
    width: imageSize.width as number,
    height: imageSize.height as number,
    metadata: JSON.stringify(tags),
  };

  // 调整图像尺寸
  imageResizer(image, request.file);
  next();
};
