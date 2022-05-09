import { connection } from '../app/database/mysql';

export const getPosts = async () => {
  const statement = `
    SELECT * FROM post
  `;
  const [data] = await connection.promise().query(statement);
  return data;
};
