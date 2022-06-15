import { Request, Response, NextFunction } from 'express';
import multer = require('multer');
import dayjs = require('dayjs');
import { FileFilterCallback } from 'multer';
import Jimp = require('jimp');
import { findFileById, imageResizer } from './file.service';
import {
  getDownloadByToken,
  updateDownload,
} from '../download/download.service';
import { DATE_TIME_FORMAT } from '../app/app.config';
import { socketIoServer } from '../app/app.server';

/**
 * 文件过滤器
 */
export const fileFilter = (fileTypes: string[]) => {
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

/**
 * 文件下载守卫
 */
export const fileDownloadGuard = async (
  request: Request,
  response: Response,
  next: NextFunction,
) => {
  const { token, socketId } = request.query;
  const { fileId } = request.params;

  try {
    // 检查 token
    if (!token) throw new Error('BAD_REQUEST');

    // 检查下载是否可用
    const download = await getDownloadByToken(token as string);
    const isValidDownload = download && !download.used;

    if (!isValidDownload) throw new Error('INVALID_DOWNLOAD');

    // 是否过期
    const isExpired = dayjs().subtract(2, 'hour').isAfter(download.created);
    if (isExpired) throw new Error('DOWNLOAD_EXPRIED');

    // 检查资源是否匹配
    const file = await findFileById(parseInt(fileId, 10));
    const isValidFile = file && file.postId === download.resourceId;

    if (!isValidFile) throw new Error('BAD_REQUEST');

    // 更新下载
    await updateDownload(download.id, {
      used: dayjs().format(DATE_TIME_FORMAT),
    });

    // 触发事件
    if (socketId) {
      socketIoServer.to(socketId as string).emit('fileDownloadUsed', download);
    }

    // 设置请求
    request.body = { download, file };
  } catch (error) {
    return next(error);
  }

  return next();
};
