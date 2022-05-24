import { Request, Response, NextFunction } from 'express';
import { createUserLikePost } from './like.service';

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
    response.status(201).send(data);
  } catch (error) {
    return next(error);
  }
};
