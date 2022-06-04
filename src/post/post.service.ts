import { connection } from '../app/database/mysql';
import { AuditLogStatus } from '../audit-log/audit-log.model';
import { TokenPayload } from '../auth/auth.interface';
import { PostModel } from './post.model';
import { sqlFragment } from './post.provider';

export interface GetPostsOptionsFilter {
  name: string;
  sql: string;
  params?: Array<string | number>;
}

export interface GetPostsOptionsPagination {
  limit: number;
  offset: number;
}

export enum PostStatus {
  published = 'published',
  draft = 'draft',
  archived = 'archived',
}

export interface GetPostsOptions {
  sort: string;
  filter: GetPostsOptionsFilter;
  pagination: GetPostsOptionsPagination;
  currentUser: TokenPayload;
  status: PostStatus;
  auditStatus: AuditLogStatus;
}

/**
 * 统计内容数量
 */
export const getPostsTotalCount = async (options: GetPostsOptions) => {
  const { filter, status, auditStatus } = options;

  let params: Array<any> = [];
  if (filter.params) {
    params = [...filter.params];
  }

  // 发布状态
  const whereStatus = status
    ? `post.status = '${status}'`
    : 'post.status IS NOT NULL';

  // 审核状态
  const whereAuditStatus = auditStatus
    ? `AND audit.status = '${auditStatus}'`
    : '';

  const statement = `
    SELECT COUNT(DISTINCT post.id) AS total
    FROM post
    ${sqlFragment.leftJoinUser}
    ${sqlFragment.innerJoinFile}
    ${sqlFragment.leftJoinTag}
    ${sqlFragment.leftJoinOneAuditLog}
    ${filter.name === 'userLiked' ? sqlFragment.innerJoinUserLikePost : ''}
    WHERE ${filter.sql} AND ${whereStatus} ${whereAuditStatus}
  `;

  const [data] = await connection.promise().query(statement, params);
  return data[0].total;
};

export const getPosts = async (options: GetPostsOptions) => {
  const {
    sort,
    filter,
    pagination: { limit, offset },
    currentUser,
    status,
    auditStatus,
  } = options;
  let params: Array<any> = [limit, offset];
  if (filter.params) {
    params = [...filter.params, ...params];
  }

  // 当前用户
  const { id: userId } = currentUser;

  // 发布状态
  const whereStatus = status
    ? `post.status = '${status}'`
    : 'post.status IS NOT NULL';

  // 审核状态
  const whereAuditStatus = auditStatus
    ? `AND audit.status = '${auditStatus}'`
    : '';

  const statement = `
    SELECT
      post.id,
      post.title,
      post.content,
      post.status,
      ${sqlFragment.user},
      ${sqlFragment.totalComments},
      ${sqlFragment.file},
      ${sqlFragment.tags},
      ${sqlFragment.totalLikes},
      ${sqlFragment.audit},
      (
        SELECT COUNT(user_like_post.postId)
        FROM user_like_post
        WHERE user_like_post.postId = post.id
          AND user_like_post.userId = ${userId}
      ) AS liked
    FROM post
    ${sqlFragment.leftJoinUser}
    ${sqlFragment.innerJoinOneFile}
    ${sqlFragment.leftJoinTag}
    ${sqlFragment.leftJoinOneAuditLog}
    ${filter.name === 'userLiked' ? sqlFragment.innerJoinUserLikePost : ''}
    WHERE ${filter.sql} AND ${whereStatus} ${whereAuditStatus}
    GROUP BY post.id
    ORDER BY ${sort}
    LIMIT ?
    OFFSET ?
  `;

  const [data] = await connection.promise().query(statement, params);
  return data;
};

interface GetPostByIdOptions {
  currentUser?: TokenPayload;
}

export const getPostById = async (
  postId: number,
  options?: GetPostByIdOptions,
) => {
  const {
    currentUser: { id: userId },
  } = options;

  const statement = `
    SELECT
      post.id,
      post.title,
      post.content,
      post.status,
      ${sqlFragment.user},
      ${sqlFragment.totalComments},
      ${sqlFragment.file},
      ${sqlFragment.tags},
      ${sqlFragment.totalLikes},
      (
        SELECT COUNT(user_like_post.postId)
        FROM user_like_post
        WHERE user_like_post.postId = post.id
          AND user_like_post.userId = ${userId}
      ) AS liked
    FROM post
    ${sqlFragment.leftJoinUser}
    ${sqlFragment.leftJoinOneFile}
    ${sqlFragment.leftJoinTag}
    WHERE post.id = ?
    GROUP BY post.id
  `;

  const [data] = await connection.promise().query(statement, postId);
  return data[0];
};

export const createPost = async (post: PostModel) => {
  const statement = `
    INSERT INTO post
    SET ?
  `;

  const [data] = await connection.promise().query(statement, post);
  return data;
};

export const updatePost = async (postId: number, post: PostModel) => {
  const statement = `
    UPDATE post
    SET ?
    WHERE id = ?
  `;

  const [data] = await connection.promise().query(statement, [post, postId]);
  return data;
};

export const deletePost = async (postId: number) => {
  const statement = `
    DELETE FROM post
    WHERE id = ?
  `;

  const [data] = await connection.promise().query(statement, postId);
  return data;
};

/**
 * 创建内容标签
 */
export const createPostTag = async (postId: number, tagId: number) => {
  const statement = `
    INSERT INTO post_tag (postId, tagId)
    VALUES (?, ?)
  `;

  const [data] = await connection.promise().query(statement, [postId, tagId]);
  return data;
};

/**
 * 删除内容标签
 */
export const deletePostTag = async (postId: number, tagId: number) => {
  const statement = `
    DELETE FROM post_tag
    WHERE postId = ? AND tagId = ?
  `;

  const [data] = await connection.promise().query(statement, [postId, tagId]);
  return data;
};

/**
 * 检查内容标签
 */
export const postHasTag = async (postId: number, tagId: number) => {
  const statement = `
    SELECT * FROM post_tag
    WHERE postId = ? AND tagId = ?
  `;

  const [data] = await connection.promise().query(statement, [postId, tagId]);
  return data[0] ? true : false;
};
