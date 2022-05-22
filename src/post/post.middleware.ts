import { Request, Response, NextFunction } from 'express';

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
