import { Request, Response, NextFunction } from 'express';
import multer = require('multer');
import { fileFilter } from '../file/file.middleware';

const avatarUploadFilter = fileFilter(['image/png', 'image/jpg', 'image/jpeg']);
const avatarUpload = multer({
  dest: 'uploads/avatar',
  fileFilter: avatarUploadFilter,
});

export const avatarInterceptor = avatarUpload.single('avatar');
