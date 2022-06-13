import express = require('express');
import * as fileController from './file.controller';
import { authGuard } from '../auth/auth.middleware';
import {
  fileDownloadGuard,
  fileInterceptor,
  fileProcessor,
} from './file.middleware';
import { accessLog } from '../access-log/access-log.middleware';

const router = express.Router();

router.post(
  '/files',
  authGuard,
  fileInterceptor,
  fileProcessor,
  accessLog({
    action: 'createFile',
    resourceType: 'file',
  }),
  fileController.store,
);
router.get('/files/:fileId/serve', fileController.serve);
router.get(
  '/files/:fileId/metadata',
  accessLog({
    action: 'getFileMetadata',
    resourceType: 'file',
    resourceParamName: 'fileId',
  }),
  fileController.metadata,
);

// 文件下载
router.get(
  '/files/:fileId/download',
  fileDownloadGuard,
  fileController.download,
);

export default router;
