import { connection } from '../app/database/mysql';

interface SearchTagsOptions {
  name?: string;
}

/**
 * 按照标签名称搜索标签
 */
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
