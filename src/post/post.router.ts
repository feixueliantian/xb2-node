import express = require('express');
import * as postController from './post.controller';
import { authGuard, accessControl } from '../auth/auth.middleware';
import { sort, filter, paginate } from './post.middleware';

const router = express.Router();

router.get('/posts', sort, filter, paginate, postController.index);
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
  accessControl({ possession: true }),
  postController.storePostTag,
);
router.delete(
  '/posts/:postId/tag',
  authGuard,
  accessControl({ possession: true }),
  postController.destroyPostTag,
);

export default router;
