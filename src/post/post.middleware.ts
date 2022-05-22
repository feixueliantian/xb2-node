import { Request, Response, NextFunction } from 'express';
import { POSTS_PER_PAGE } from '../app/app.config';

/**
 * 准备排序参数
 */
export const sort = async (
  request: Request,
  response: Response,
  next: NextFunction,
) => {
  const { sort } = request.query;
  let sqlSort: string;

  switch (sort as string) {
    case 'earliest':
      sqlSort = 'post.id ASC';
      break;
    case 'latest':
      sqlSort = 'post.id DESC';
      break;
    case 'most_comments':
      sqlSort = 'totalComments DESC, post.id DESC';
      break;
    default:
      sqlSort = 'post.id DESC';
      break;
  }

  request.sort = sqlSort;
  next();
};

/**
 * 过滤列表
 */
export const filter = async (
  request: Request,
  response: Response,
  next: NextFunction,
) => {
  const { tag, user, action } = request.query;

  request.filter = {
    name: 'default',
    sql: 'post.id IS NOT NULL',
  };

  // 按照标签过滤
  if (tag && !user && !action) {
    request.filter = {
      name: 'tagName',
      sql: 'tag.name = ?',
      params: tag as string,
    };
  }

  // 过滤用户发布的内容
  if (!tag && user && action === 'published') {
    request.filter = {
      name: 'userPublished',
      sql: 'user.id = ?',
      params: user as string,
    };
  }

  next();
};

/**
 * 分页
 */
export const paginate = async (
  request: Request,
  response: Response,
  next: NextFunction,
) => {
  const { page = 1 } = request.query;
  const limit = parseInt(POSTS_PER_PAGE, 10) || 30;
  const offset = (parseInt(page as string, 10) - 1) * limit;

  request.pagination = {
    limit,
    offset,
  };

  next();
};
