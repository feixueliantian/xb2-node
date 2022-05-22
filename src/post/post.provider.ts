export const sqlFragment = {
  user: `
    JSON_OBJECT(
      'id', user.id,
      'name', user.name
    ) as user
  `,
  leftJoinUser: `
    LEFT JOIN user
    ON user.id = post.userId
  `,
  totalComments: `
    (
      SELECT COUNT(comment.id)
      FROM comment
      WHERE comment.postId = post.id
    ) as totalComments
  `,
  leftJoinOneFile: `
      LEFT JOIN LATERAL (
        SELECT * FROM file
        WHERE file.postId = post.id
        ORDER BY file.id DESC
        LIMIT 1
      ) AS file ON file.postId = post.id
  `,
  file: `
    CAST(
      IF(
        COUNT(file.id),
        GROUP_CONCAT(
          DISTINCT JSON_OBJECT(
            'id', file.id,
            'width', file.width,
            'height', file.height
          )
        ),
        NULL
      ) AS JSON
    ) as file
  `,
};
