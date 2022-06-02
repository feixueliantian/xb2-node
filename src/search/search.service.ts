import { connection } from '../app/database/mysql';

/**
 * 搜索标签
 */
interface SearchTagsOptions {
  name?: string;
}

export const searchTags = async (options: SearchTagsOptions) => {
  const { name } = options;

  const params: Array<any> = [`%${name}%`];

  const statement = ` 
    SELECT
      tag.id,
      tag.name,
      (
        SELECT COUNT(post_tag.postId)
        FROM post_tag
        WHERE post_tag.tagId = tag.id
      ) as totalPosts
    FROM
      tag
    WHERE
      tag.name LIKE ?
    ORDER BY
      totalPosts DESC
    LIMIT
      10
  `;

  const [data] = await connection.promise().query(statement, params);
  return data as any;
};

/**
 * 搜索用户
 */
interface SearchUsersOptions {
  name?: string;
}

export const searchUsers = async (options: SearchUsersOptions) => {
  const { name } = options;

  const params = [`%${name}%`];

  const statement = `
    SELECT
      user.id,
      user.name,
      IF(COUNT(avatar.id) ? 1 : NULL) as avatar
      (
        SELECT COUNT(post.id)
        FROM post
        WHERE post.userId = user.id
      ) as totalPosts
    FROM
      user
    LEFT JOIN
      avatar ON avatar.userId = user.id
    WHERE
      user.name like ?
    GROUP BY
      user.id
    LIMIT
      10
  `;

  const [data] = await connection.promise().query(statement, params);
  return data;
};
