import { Request, Response, NextFunction } from 'express';
import { socketIoServer } from '../app/app.server';
import { createUserLikePost, deleteUserLikePost } from './like.service';

/**
 * 点赞内容
 */
export const storeUserLikePost = async (
  request: Request,
  response: Response,
  next: NextFunction,
) => {
  const { postId } = request.params;
  const { id: userId } = request.user;

  try {
    const data = await createUserLikePost(userId, parseInt(postId, 10));

    // 触发事件
    socketIoServer.emit('userLikePostCreated', {
      postId: parseInt(postId, 10),
      userId,
    });

    return response.status(201).send(data);
  } catch (error) {
    return next(error);
  }
};

/**
 * 取消点赞内容
 */
export const destroyUserLikePost = async (
  request: Request,
  response: Response,
  next: NextFunction,
) => {
  const { postId } = request.params;
  const { id: userId } = request.user;

  try {
    const data = await deleteUserLikePost(userId, parseInt(postId, 10));
    return response.send(data);
  } catch (error) {
    return next(error);
  }
};
