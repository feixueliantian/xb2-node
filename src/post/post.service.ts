import { connection } from '../app/database/mysql';
import { PostModel } from './post.model';
import { sqlFragment } from './post.provider';

export interface GetPostsOptionsFilter {
  name: string;
  sql: string;
  params?: string;
}

export interface GetPostsOptionsPagination {
  limit: number;
  offset: number;
}

interface GetPostsOptions {
  sort: string;
  filter: GetPostsOptionsFilter;
  pagination: GetPostsOptionsPagination;
}

/**
 * 统计内容数量
 */
export const getPostsTotalCount = async (options: GetPostsOptions) => {
  const { filter } = options;
  const params = [filter.params];

  const statement = `
    SELECT COUNT(DISTINCT post.id) AS total
    FROM post
    ${sqlFragment.leftJoinUser}
    ${sqlFragment.leftJoinOneFile}
    ${sqlFragment.leftJoinTag}
    ${filter.name === 'userLiked' ? sqlFragment.innerJoinUserLikePost : ''}
    WHERE ${filter.sql}
  `;

  const [data] = await connection.promise().query(statement, params);
  return data[0].total;
};

export const getPosts = async (options: GetPostsOptions) => {
  const {
    sort,
    filter,
    pagination: { limit, offset },
  } = options;
  let params: any[] = [limit, offset];
  if (filter.params) {
    params = [filter.params, ...params];
  }

  const statement = `
    SELECT
      post.id,
      post.title,
      post.content,
      ${sqlFragment.user},
      ${sqlFragment.totalComments},
      ${sqlFragment.file},
      ${sqlFragment.tags},
      ${sqlFragment.totalLikes}
    FROM post
    ${sqlFragment.leftJoinUser}
    ${sqlFragment.leftJoinOneFile}
    ${sqlFragment.leftJoinTag}
    ${filter.name === 'userLiked' ? sqlFragment.innerJoinUserLikePost : ''}
    WHERE ${filter.sql}
    GROUP BY post.id
    ORDER BY ${sort}
    LIMIT ?
    OFFSET ?
  `;
  const [data] = await connection.promise().query(statement, params);
  return data;
};

export const getPostById = async (postId: number) => {
  const statement = `
    SELECT
      post.id,
      post.title,
      post.content,
      ${sqlFragment.user},
      ${sqlFragment.totalComments},
      ${sqlFragment.file},
      ${sqlFragment.tags},
      ${sqlFragment.totalLikes}
    FROM post
    ${sqlFragment.leftJoinUser}
    ${sqlFragment.leftJoinOneFile}
    ${sqlFragment.leftJoinTag}
    WHERE post.id = ?
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
