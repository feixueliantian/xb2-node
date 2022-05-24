import { connection } from '../app/database/mysql';

/**
 * 保存用户点赞内容
 */
export const createUserLikePost = async (userId: number, postId: number) => {
  const statement = `
    INSERT INTO
      user_like_post (userId, postId)
    VALUES(?, ?)
  `;

  const [data] = await connection.promise().query(statement, [userId, postId]);
  return data;
};

/**
 * 取消用户点赞内容
 */
export const deleteUserLikePost = async (userId: number, postId: number) => {
  const statement = `
    DELETE FROM user_like_post
    WHERE userId = ? AND postId = ?
  `;

  const [data] = await connection.promise().query(statement, [userId, postId]);
  return data;
};
