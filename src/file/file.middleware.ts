import { Request, Response, NextFunction } from 'express';
import multer = require('multer');
import Jimp = require('jimp');

/**
 * 创建一个 Multer
 */
const fileUpload = multer({
  dest: 'uploads/',
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
  next();
};
