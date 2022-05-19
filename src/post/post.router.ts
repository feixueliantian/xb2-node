import express = require('express');
import * as postController from './post.controller';
import { requestUrl } from '../app/app.middleware';
import { authGuard, accessControl } from '../auth/auth.middleware';

const router = express.Router();

router.get('/posts', requestUrl, postController.index);
router.post('/posts', authGuard, postController.store);
router.patch(
  '/posts/:postId',
  authGuard,
  accessControl({ possession: true }),
  postController.update,
);
router.delete(
  '/posts/:postId',
  authGuard,
  accessControl({ possession: true }),
  postController.destroy,
);
router.post(
  '/posts/:postId/tag',
  authGuard,
  accessControl,
  postController.storePostTag,
);

export default router;
