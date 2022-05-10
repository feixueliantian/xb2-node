import { Request, Response, NextFunction } from 'express';
import _ = require('lodash');
import { getPosts, createPost, updatePost, deletePost } from './post.service';

export const index = async (
  request: Request,
  response: Response,
  next: NextFunction,
) => {
  try {
    const posts = await getPosts();
    response.send(posts);
  } catch (error) {
    next(error);
  }
};

export const store = async (
  request: Request,
  response: Response,
  next: NextFunction,
) => {
  const { title, content } = request.body;
  const { id: userId } = request.user;

  try {
    const data = await createPost({ title, content, userId });
    response.status(201).send(data);
  } catch (error) {
    next(error);
  }
};

export const update = async (
  request: Request,
  response: Response,
  next: NextFunction,
) => {
  const { postId } = request.params;
  const post = _.pick(request.body, ['title', 'content']);

  try {
    const data = await updatePost(parseInt(postId, 10), post);
    response.send(data);
  } catch (error) {
    next(error);
  }
};

export const destroy = async (
  request: Request,
  response: Response,
  next: NextFunction,
) => {
  const { postId } = request.params;

  try {
    const data = await deletePost(parseInt(postId, 10));
    response.send(data);
  } catch (error) {
    next(error);
  }
};
