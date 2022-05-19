import { Request, Response, NextFunction } from 'express';
import _ = require('lodash');
import { TagModel } from '../tag/tag.model';
import { createTag, getTagByName } from '../tag/tag.service';
import {
  getPosts,
  createPost,
  updatePost,
  deletePost,
  createPostTag,
  postHasTag,
} from './post.service';

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

export const storePostTag = async (
  request: Request,
  response: Response,
  next: NextFunction,
) => {
  const { postId } = request.params;
  const { name } = request.body;

  try {
    //查找标签
    let tag: TagModel = await getTagByName(name);

    // 如果不存在标签，则创建标签
    if (!tag) {
      // 不存在标签，创建该标签
      const data = await createTag({ name });
      tag = { id: data.insertId, name };
    }

    // 查看内容是否已经打上了该标签
    const postTag = await postHasTag(parseInt(postId, 10), tag.id);
    if (postTag) throw new Error('POST_ALREADY_HAS_THIS_TAG');

    // 为内容打上标签
    const data = await createPostTag(parseInt(postId, 10), tag.id);
    return response.status(201).send(data);
  } catch (error) {
    return next(error);
  }
};
