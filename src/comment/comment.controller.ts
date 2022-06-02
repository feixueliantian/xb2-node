import { Request, Response, NextFunction } from 'express';
import { socketIoServer } from '../app/app.server';
import {
  createComment,
  deleteComment,
  getCommentById,
  getCommentReplies,
  getComments,
  getCommentsTotalCount,
  isReplyComment,
  updateComment,
} from './comment.service';

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
  const socketId = request.header('X-Socket-Id');

  const comment = {
    content,
    postId,
    userId,
  };

  try {
    const data = await createComment(comment);
    const createdComment = await getCommentById(data.insertId);

    // 触发事件
    socketIoServer.emit('commentCreated', {
      comment: createdComment,
      socketId,
    });

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
  const socketId = request.header('X-Socket-Id');

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
    const reply = await getCommentById(data.insertId, {
      resourceType: 'reply',
    });

    // 触发事件
    socketIoServer.emit('replyCreated', {
      reply,
      socketId,
    });

    return response.status(201).send(data);
  } catch (error) {
    return next(error);
  }
};

/**
 * 修改评论
 */
export const update = async (
  request: Request,
  response: Response,
  next: NextFunction,
) => {
  const { commentId } = request.params;
  const { content } = request.body;
  const socketId = request.header('X-Socket-Id');

  const comment = {
    content,
  };

  try {
    const data = await updateComment(parseInt(commentId, 10), comment);

    const isReply = await isReplyComment(parseInt(commentId, 10));
    const resourceType = isReply ? 'reply' : 'comment';
    const resource = await getCommentById(parseInt(commentId, 10), {
      resourceType,
    });

    // 触发事件
    const eventName = isReply ? 'commentReplyUpdated' : 'commentUpdated';
    socketIoServer.emit(eventName, {
      [resourceType]: resource,
      socketId,
    });

    return response.send(data);
  } catch (error) {
    return next(error);
  }
};

/**
 * 删除评论
 */
export const destroy = async (
  request: Request,
  response: Response,
  next: NextFunction,
) => {
  const { commentId } = request.params;

  try {
    const data = await deleteComment(parseInt(commentId, 10));
    return response.send(data);
  } catch (error) {
    return next(error);
  }
};

/**
 * 评论列表
 */
export const index = async (
  request: Request,
  response: Response,
  next: NextFunction,
) => {
  try {
    const total = await getCommentsTotalCount({ filter: request.filter });
    response.header('X-Total-Count', total);

    const data = await getComments({
      filter: request.filter,
      pagination: request.pagination,
    });
    return response.send(data);
  } catch (error) {
    return next(error);
  }
};

/**
 * 回复列表
 */
export const indexReplies = async (
  request: Request,
  response: Response,
  next: NextFunction,
) => {
  const { commentId } = request.params;

  try {
    const data = await getCommentReplies({
      commentId: parseInt(commentId, 10),
    });
    return response.send(data);
  } catch (error) {
    return next(error);
  }
};
