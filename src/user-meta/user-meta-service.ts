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

/**
 * 更新用户 Meta
 */
export const updateUserMeta = async (
  userMetaId: number,
  userMeta: UserMetaModel,
) => {
  const statement = `
    UPDATE user_meta
    SET ?
    WHERE user_meta.id = ?
  `;

  const params = [userMeta, userMetaId];

  const [data] = await connection.promise().query(statement, params);

  return data as any;
};
