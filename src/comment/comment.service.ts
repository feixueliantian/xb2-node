import { connection } from '../app/database/mysql';
import {
  GetPostsOptionsFilter,
  GetPostsOptionsPagination,
} from '../post/post.service';
import { CommentModel } from './comment.model';
import { sqlFragment } from './comment.provider';

/**
 * 创建评论
 */
export const createComment = async (comment: CommentModel) => {
  const statement = `
    INSERT INTO comment
    SET ?
  `;

  const [data] = await connection.promise().query(statement, comment);
  return data;
};

/**
 * 检查评论是否为回复评论
 */
export const isReplyComment = async (commentId: number) => {
  const statement = `
    SELECT parentId FROM comment
    WHERE id = ?
  `;

  const [data] = await connection.promise().query(statement, commentId);
  return data[0].parentId ? true : false;
};

/**
 * 修改评论
 */
export const updateComment = async (
  commentId: number,
  comment: CommentModel,
) => {
  const statement = `
    UPDATE comment
    SET ?
    WHERE id = ?
  `;

  const [data] = await connection
    .promise()
    .query(statement, [comment, commentId]);
  return data;
};

/**
 * 删除评论
 */
export const deleteComment = async (commentId: number) => {
  const statement = `
    DELETE FROM comment
    WHERE id = ?
  `;

  const [data] = await connection.promise().query(statement, commentId);
  return data;
};

interface GetCommentsOptions {
  filter: GetPostsOptionsFilter;
  pagination?: GetPostsOptionsPagination;
}

/**
 * 获取评论列表
 */
export const getComments = async (options: GetCommentsOptions) => {
  const {
    filter,
    pagination: { limit, offset },
  } = options;

  let params: Array<string | number> = [limit, offset];
  if (filter.params) {
    params = [filter.params, ...params];
  }

  const statement = `
    SELECT
      comment.id,
      comment.content,
      ${sqlFragment.user},
      ${sqlFragment.post}
      ${filter.name == 'userReplied' ? `, ${sqlFragment.repliedComment}` : ''}
      ${filter.name != 'userReplied' ? `, ${sqlFragment.totalReplies}` : ''}
    FROM
      comment
    ${sqlFragment.leftJoinUser}
    ${sqlFragment.leftJoinPost}
    WHERE
      ${filter.sql}
    GROUP BY
      comment.id
    ORDER BY
      comment.id DESC
    LIMIT ?
    OFFSET ?
  `;

  const [data] = await connection.promise().query(statement, params);
  return data;
};

/**
 * 统计评论数量
 */
export const getCommentsTotalCount = async (options: GetCommentsOptions) => {
  const { filter } = options;

  let params: Array<number | string> = [];

  if (filter.params) {
    params = [filter.params, ...params];
  }

  const statement = `
    SELECT COUNT(DISTINCT comment.id) AS total
    FROM comment
    ${sqlFragment.leftJoinUser}
    ${sqlFragment.leftJoinPost}
    WHERE ${filter.sql}
  `;

  const [data] = await connection.promise().query(statement, params);
  return data[0].total;
};
