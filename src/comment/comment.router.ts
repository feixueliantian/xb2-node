import { Router } from 'express';
import { accessLog } from '../access-log/access-log.middleware';
import { COMMENTS_PER_PAGE } from '../app/app.config';
import { accessControl, authGuard } from '../auth/auth.middleware';
import { paginate } from '../post/post.middleware';
import * as commentController from './comment.controller';
import { filter } from './comment.middleware';

const router = Router();

// 发表评论
router.post(
  '/comments',
  authGuard,
  accessLog({
    action: 'createComment',
    resourceType: 'comment',
    payloadParam: 'body.content',
  }),
  commentController.store,
);

// 回复评论
router.post(
  '/comments/:commentId/reply',
  authGuard,
  accessLog({
    action: 'createCommentReply',
    resourceType: 'comment',
    resourceParamName: 'commentId',
    payloadParam: 'body.content',
  }),
  commentController.reply,
);

// 修改评论
router.patch(
  '/comments/:commentId',
  authGuard,
  accessControl({ possession: true }),
  accessLog({
    action: 'updateComment',
    resourceType: 'comment',
    resourceParamName: 'commentId',
    payloadParam: 'body.content',
  }),
  commentController.update,
);

// 删除评论
router.delete(
  '/comments/:commentId',
  authGuard,
  accessControl({ possession: true }),
  accessLog({
    action: 'deleteComment',
    resourceType: 'comment',
    resourceParamName: 'commentId',
  }),
  commentController.destroy,
);

// 评论列表
router.get(
  '/comments',
  filter,
  paginate(COMMENTS_PER_PAGE),
  accessLog({
    action: 'getComments',
    resourceType: 'comment',
  }),
  commentController.index,
);

// 回复列表
router.get(
  '/comments/:commentId/replies',
  accessLog({
    action: 'getCommentReplies',
    resourceType: 'comment',
    resourceParamName: 'commentId',
  }),
  commentController.indexReplies,
);

export default router;
