import { Request, Response, NextFunction } from 'express';
import { createComment } from './comment.service';

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
