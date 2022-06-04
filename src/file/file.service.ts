import path = require('path');
import { access, unlink } from 'fs/promises';
import { constants } from 'fs';
import Jimp = require('jimp');
import { connection } from '../app/database/mysql';
import { FileModel } from './file.model';
import { TokenPayload } from '../auth/auth.interface';
import { getPostById, PostStatus } from '../post/post.service';
import { getAuditLogByResource } from '../audit-log/audit-log.service';
import { AuditLogStatus } from '../audit-log/audit-log.model';

/**
 * 存储文件信息
 */
export const createFile = async (file: FileModel) => {
  //准备查询
  const statement = `
    INSERT INTO file
    SET ?
  `;

  // 执行查询
  const [data] = await connection.promise().query(statement, file);

  // 提供数据
  return data;
};

/**
 * 按照ID查找文件
 */
export const findFileById = async (fileId: number) => {
  // 准备查询
  const statement = `
    SELECT * FROM file
    WHERE id = ?
  `;

  // 执行查询
  const [data] = await connection.promise().query(statement, fileId);

  // 提供数据
  return data[0];
};

/**
 * 调整图像尺寸
 */
export const imageResizer = async (image: Jimp, file: Express.Multer.File) => {
  const { imageSize } = image['_exif'];
  const filePath = path.join(file.destination, 'resized', file.filename);

  if (imageSize.width > 1280) {
    image.resize(1280, Jimp.AUTO).quality(85).write(`${filePath}-large`);
  }

  if (imageSize.width > 640) {
    image.resize(640, Jimp.AUTO).quality(85).write(`${filePath}-medium`);
  }

  if (imageSize.width > 320) {
    image.resize(320, Jimp.AUTO).quality(85).write(`${filePath}-thumbnail`);
  }
};

/**
 * 找出内容相关文件
 */
export const getPostFiles = async (postId: number) => {
  const statement = `
    SELECT *
    FROM file
    WHERE postId = ?
  `;

  const [data] = await connection.promise().query(statement, postId);
  return data as Array<FileModel>;
};

/**
 * 删除内容文件
 */
export const deletePostFiles = async (files: Array<FileModel>) => {
  const uploads = 'uploads';
  const resized = [uploads, 'resized'];

  for (const file of files) {
    const filesToDelete = [
      [uploads, file.filename],
      [...resized, `${file.filename}-thumbnail`],
      [...resized, `${file.filename}-medium`],
      [...resized, `${file.filename}-large`],
    ];

    for (const item of filesToDelete) {
      const filePath = path.join(...item);

      try {
        // 查看文件是否存在
        await access(filePath, constants.F_OK);
      } catch (error) {
        // 文件不存在，继续查找下一个文件
        continue;
      }

      // 文件存在，删除文件
      await unlink(filePath);
    }
  }
};

/**
 * 检查文件权限
 */
interface FileAccessControlOptions {
  file: FileModel;
  currentUser: TokenPayload;
}

export const fileAccessControl = async (options: FileAccessControlOptions) => {
  const { file, currentUser } = options;

  const isAdmin = currentUser.id === 1;
  const isOwner = file.userId === currentUser.id;
  const parentPost = await getPostById(file.postId, { currentUser });
  const [parentPostAuditLog] = await getAuditLogByResource({
    resourceId: file.postId,
    resourceType: 'post',
  });
  const isPublished = parentPost.status === PostStatus.published;
  const isApproved =
    parentPostAuditLog && parentPostAuditLog.status === AuditLogStatus.approved;
  const canAccess = isAdmin || isOwner || (isPublished && isApproved);

  if (!canAccess) throw new Error('FORBIDDEN');
};
