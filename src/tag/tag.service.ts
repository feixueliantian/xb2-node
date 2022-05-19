import { connection } from '../app/database/mysql';
import { TagModel } from './tag.model';

export const createTag = async (tag: TagModel) => {
  const statement = `
    INSERT INTO tag
    SET ? 
  `;

  const [data] = await connection.promise().query(statement, tag);
  return data as any;
};
