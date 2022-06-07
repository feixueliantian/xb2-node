import { connection } from '../app/database/mysql';
import { UserMetaModel } from './user-meta.model';

/**
 * 创建用户 Meta
 */
export const createUserMeta = async (userMeta: UserMetaModel) => {
  const statement = `
    INSERT INTO user_meta
    SET ?
  `;

  const [data] = await connection.promise().query(statement, userMeta);
  return data as any;
};
