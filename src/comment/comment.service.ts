import { connection } from '../app/database/mysql';
import { CommentModel } from './comment.model';

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

  const [data] = await connection.promise().query(statement);
  return data[0].parentId ? true : false;
};
