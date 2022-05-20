import { Request, Response, NextFunction } from 'express';
import { createComment, isReplyComment } from './comment.service';

/**
 * 发表评论
 */
export const store = async (
  request: Request,
  response: Response,
  next: NextFunction,
) => {
  const { id: userId } = request.user;
  const { content, postId } = request.body;
  const comment = {
    content,
    postId,
    userId,
  };

  try {
    const data = await createComment(comment);
    return response.status(201).send(data);
  } catch (error) {
    return next(error);
  }
};

/**
 * 回复评论
 */
export const reply = async (
  request: Request,
  response: Response,
  next: NextFunction,
) => {
  const { commentId } = request.params;
  const parentId = parseInt(commentId, 10);
  const { id: userId } = request.user;
  const { content, postId } = request.body;
  const comment = {
    content,
    postId,
    userId,
    parentId,
  };

  try {
    // 查看要回复的评论是否已经是回复
    const isReply = await isReplyComment(parentId);
    if (isReply) throw new Error('UNABLE_TO_REPLY_THIS_COMMENT');

    // 创建一条回复评论
    const data = await createComment(comment);
    return response.status(201).send(data);
  } catch (error) {
    return next(error);
  }
};