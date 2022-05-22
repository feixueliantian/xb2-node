import { connection } from '../app/database/mysql';
import { PostModel } from './post.model';
import { sqlFragment } from './post.provider';

export const getPosts = async () => {
  const statement = `
    SELECT
      post.id,
      post.title,
      post.content,
      ${sqlFragment.user},
      ${sqlFragment.totalComments},
      ${sqlFragment.file},
      ${sqlFragment.tags}
    FROM post
    ${sqlFragment.leftJoinUser}
    ${sqlFragment.leftJoinOneFile}
    ${sqlFragment.leftJoinTag}
    GROUP BY post.id
  `;
  const [data] = await connection.promise().query(statement);
  return data;
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
