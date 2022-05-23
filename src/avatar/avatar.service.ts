import { connection } from '../app/database/mysql';
import { AvatarModel } from './avatar.model';

/**
 * 创建头像
 */
export const createAvatar = async (avatar: AvatarModel) => {
  const statement = `
    INSERT INTO avatar
    SET ?
  `;

  const [data] = await connection.promise().query(statement, avatar);
  return data;
};

/**
 * 按照用户 ID 查找头像
 */
export const getAvatarByUserId = async (userId: number) => {
  const statement = `
    SELECT * FROM avatar
    WHERE userId = ?
    ORDER BY id DESC
    limit 1
  `;

  const [data] = await connection.promise().query(statement, userId);
  return data[0];
};
