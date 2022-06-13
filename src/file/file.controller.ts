import path = require('path');
import fs = require('fs');
import { Request, Response, NextFunction } from 'express';
import _ = require('lodash');
import { createFile, fileAccessControl, findFileById } from './file.service';

/**
 * 上传文件
 */
export const store = async (
  request: Request,
  response: Response,
  next: NextFunction,
) => {
  // 当前用户
  const { id: userId } = request.user;

  // 所属内容
  const postId = +request.query.post;

  // 文件信息
  const fileInfo = _.pick(request.file, [
    'originalname',
    'mimetype',
    'filename',
    'size',
  ]);

  try {
    const data = await createFile({
      ...fileInfo,
      userId,
      postId,
      ...request.fileMetaData,
    });

    response.status(201).send(data);
  } catch (error) {
    next(error);
  }
};

/**
 * 文件服务
 */
export const serve = async (
  request: Request,
  response: Response,
  next: NextFunction,
) => {
  const { fileId } = request.params;
  const { user: currentUser } = request;

  try {
    // 查找文件信息
    const file = await findFileById(parseInt(fileId, 10));

    // 检查文件权限
    await fileAccessControl({ file, currentUser });

    // 要提供的图像尺寸
    const { size } = request.query;

    // 文件名与目录
    let filename = file.filename;
    let root = 'uploads';
    const resized = 'resized';

    if (size) {
      // 可用的图像尺寸
      const imageSizes = ['large', 'medium', 'thumbnail'];

      // 检测文件尺寸是否可用
      if (!imageSizes.includes(size as string)) {
        throw new Error('FILE_NOT_FOUND');
      }

      // 检查文件是否存在
      const fileExist = fs.existsSync(
        path.join(root, resized, `${filename}-${size}`),
      );

      // 设备文件名与目录
      if (fileExist) {
        filename = `${filename}-${size}`;
        root = path.join(root, resized);
      }
    }

    response.sendFile(filename, {
      root,
      headers: {
        'Content-Type': file.mimetype,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 文件信息
 */
export const metadata = async (
  request: Request,
  response: Response,
  next: NextFunction,
) => {
  const { fileId } = request.params;
  const { user: currentUser } = request;

  try {
    const file = await findFileById(parseInt(fileId, 10));
    // 检查文件权限
    await fileAccessControl({ file, currentUser });

    const data = _.pick(file, ['id', 'size', 'width', 'height', 'metadata']);
    response.send(data);
  } catch (error) {
    next(error);
  }
};

/**
 * 文件下载
 */
export const download = async (
  request: Request,
  response: Response,
  next: NextFunction,
) => {
  const { file } = request.body;

  try {
    const filePath = path.join('uploads', file.filename);

    response.header({
      'Content-Type': file.mimetype,
    });

    response.download(filePath, file.originalname);
  } catch (error) {
    return next(error);
  }
};
