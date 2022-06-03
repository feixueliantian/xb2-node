import { Request, Response, NextFunction } from 'express';
import { PostStatus } from './post.service';

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
  const { tag, user, action, cameraMake, cameraModel, lensMake, lensModel } =
    request.query;

  request.filter = {
    name: 'default',
    sql: 'post.id IS NOT NULL',
  };

  // 按照标签过滤
  if (tag && !user && !action) {
    request.filter = {
      name: 'tagName',
      sql: 'tag.name = ?',
      params: [tag as string],
    };
  }

  // 过滤用户发布的内容
  if (!tag && user && action === 'published') {
    request.filter = {
      name: 'userPublished',
      sql: 'user.id = ?',
      params: [user as string],
    };
  }

  // 过滤用户赞过的内容
  if (!tag && user && action === 'liked') {
    request.filter = {
      name: 'userLiked',
      sql: 'user_like_post.userId = ?',
      params: [user as string],
    };
  }

  // 过滤相机
  if (cameraMake && cameraModel) {
    request.filter = {
      name: 'camera',
      sql: 'file.metadata->"$.Make" = ? AND file.metadata->"$.Model" = ?',
      params: [cameraMake as string, cameraModel as string],
    };
  }

  // 过滤镜头
  if (lensMake && lensModel) {
    request.filter = {
      name: 'lens',
      sql: 'file.metadata->"$.LensMake" = ? AND file.metadata->"$.LensModel" = ?',
      params: [lensMake as string, lensModel as string],
    };
  }

  next();
};

/**
 * 分页
 */
export const paginate = (itemsPerPage: number) => {
  return async (request: Request, response: Response, next: NextFunction) => {
    const { page = 1 } = request.query;
    const limit = itemsPerPage || 30;
    const offset = (parseInt(page as string, 10) - 1) * limit;

    request.pagination = {
      limit,
      offset,
    };

    next();
  };
};

/**
 * 验证内容状态
 */
export const validatePostsStatus = async (
  request: Request,
  response: Response,
  next: NextFunction,
) => {
  const { status: statusFromQuery = '' } = request.query;
  const { status: statusFromBody = '' } = request.body;

  const status = statusFromQuery || statusFromBody;

  const isValidStatus = ['', 'published', 'draft', 'archived'].includes(
    status as string,
  );

  if (isValidStatus) {
    return next();
  } else {
    return next(new Error('BAD_REQUEST'));
  }
};

/**
 * 模式切换器
 */
export const modeSwitcher = async (
  request: Request,
  response: Response,
  next: NextFunction,
) => {
  const { manage, admin } = request.query;

  // 用户管理模式
  const isManageMode = manage === 'true';

  // 管理员模式
  const isAdminMode = isManageMode && admin === 'true' && request.user.id === 1;

  if (isManageMode) {
    if (isAdminMode) {
      request.filter = {
        name: 'adminManagePosts',
        sql: 'post.id IS NOT NULL',
        params: [],
      };
    } else {
      request.filter = {
        name: 'userManagePosts',
        sql: 'user.id = ?',
        params: [request.user.id],
      };
    }
  } else {
    request.query.status = PostStatus.published;
  }

  next();
};
