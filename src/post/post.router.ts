import express = require('express');
import * as postController from './post.controller';
import { authGuard, accessControl } from '../auth/auth.middleware';
import {
  sort,
  filter,
  paginate,
  validatePostsStatus,
  modeSwitcher,
} from './post.middleware';
import { POSTS_PER_PAGE } from '../app/app.config';
import { accessLog } from '../access-log/access-log.middleware';

const router = express.Router();

router.get(
  '/posts',
  sort,
  filter,
  paginate(POSTS_PER_PAGE),
  validatePostsStatus,
  modeSwitcher,
  accessLog({ action: 'getPost', resourceType: 'post' }),
  postController.index,
);
router.get('/posts/:postId', postController.show);
router.post(
  '/posts',
  authGuard,
  validatePostsStatus,
  accessLog({
    action: 'createPost',
    resourceType: 'post',
    payloadParam: 'body.title',
  }),
  postController.store,
);
router.patch(
  '/posts/:postId',
  authGuard,
  accessControl({ possession: true }),
  validatePostsStatus,
  accessLog({
    action: 'updatePost',
    resourceType: 'post',
    resourceParamName: 'postId',
  }),
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
