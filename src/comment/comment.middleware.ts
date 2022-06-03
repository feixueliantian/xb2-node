import { Request, Response, NextFunction } from 'express';

/**
 * 过滤器
 */
export const filter = async (
  request: Request,
  response: Response,
  next: NextFunction,
) => {
  const { post, user, action } = request.query;

  // 默认查看所有评论，不包括回复
  request.filter = {
    name: 'default',
    sql: 'comment.parentId IS NULL',
  };

  // 查看内容的评论
  if (post && !user && !action) {
    request.filter = {
      name: 'postComments',
      sql: 'comment.parentId IS NULL AND comment.postId = ?',
      params: [post as string],
    };
  }

  // 查看用户的评论
  if (user && action === 'published' && !post) {
    request.filter = {
      name: 'userComments',
      sql: 'comment.parentId IS NULL AND comment.userId = ?',
      params: [user as string],
    };
  }

  // 查看用户的回复
  if (user && action === 'replied' && !post) {
    request.filter = {
      name: 'userReplied',
      sql: 'comment.parentId IS NOT NULL AND comment.userId = ?',
      params: [user as string],
    };
  }

  next();
};
