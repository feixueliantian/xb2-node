import { Request, Response, NextFunction } from 'express';
import _ = require('lodash');
import { deletePostFiles, getPostFiles } from '../file/file.service';
import { TagModel } from '../tag/tag.model';
import { createTag, getTagByName } from '../tag/tag.service';
import { PostModel } from './post.model';
import {
  getPosts,
  createPost,
  updatePost,
  deletePost,
  createPostTag,
  postHasTag,
  deletePostTag,
  getPostsTotalCount,
  getPostById,
  PostStatus,
  GetPostsOptions,
} from './post.service';

export const index = async (
  request: Request,
  response: Response,
  next: NextFunction,
) => {
  const { status = '' } = request.query;

  const options: GetPostsOptions = {
    sort: request.sort,
    filter: request.filter,
    pagination: request.pagination,
    currentUser: request.user,
    status: PostStatus[status as string],
  };

  try {
    const posts = await getPosts(options);
    const totalCount = await getPostsTotalCount(options);

    response.header('X-TOTAL-COUNT', totalCount);
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
  const { title, content, status = PostStatus.draft } = request.body;
  const { id: userId } = request.user;

  const post: PostModel = {
    title,
    content,
    userId,
    status,
  };

  try {
    const data = await createPost(post);
    response.status(201).send(data);
  } catch (error) {
    next(error);
  }
};

export const show = async (
  request: Request,
  response: Response,
  next: NextFunction,
) => {
  const { postId } = request.params;

  try {
    const data = await getPostById(parseInt(postId, 10), {
      currentUser: request.user,
    });
    if (!data) throw new Error('NOT_FOUND');
    return response.send(data);
  } catch (error) {
    return next(error);
  }
};

export const update = async (
  request: Request,
  response: Response,
  next: NextFunction,
) => {
  const { postId } = request.params;
  const post = _.pick(request.body, ['title', 'content', 'status']);

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
    // 查找内容相关的文件
    const files = await getPostFiles(parseInt(postId, 10));
    if (files.length) {
      // 删除内容相关的文件
      await deletePostFiles(files);
    }

    const data = await deletePost(parseInt(postId, 10));
    response.send(data);
  } catch (error) {
    next(error);
  }
};

/**
 * 添加内容标签处理器
 */
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

/**
 * 移除内容标签处理器
 */
export const destroyPostTag = async (
  request: Request,
  response: Response,
  next: NextFunction,
) => {
  const { postId } = request.params;
  const { tagId } = request.body;

  try {
    await deletePostTag(parseInt(postId, 10), tagId);
    return response.sendStatus(200);
  } catch (error) {
    return next(error);
  }
};
