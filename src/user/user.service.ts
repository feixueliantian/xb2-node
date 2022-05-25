import { connection } from '../app/database/mysql';
import { UserModel } from './user.model';

export const createUser = async (user: UserModel) => {
  const statement = `
    INSERT INTO user
    SET ?
  `;

  const [data] = await connection.promise().query(statement, user);
  return data;
};

interface GetUserOptions {
  password?: boolean;
}

const getUser = (condition: string) => {
  return async (param: string | number, options: GetUserOptions = {}) => {
    const { password } = options;
    const statement = `
          SELECT
            user.id,
            user.name,
            IF(count(avatar.id), 1, NULL) AS avatar
            ${password ? ', password' : ''}
          FROM
            user
          LEFT JOIN
            avatar ON avatar.userId = user.id
          GROUP BY user.id
          HAVING ${condition} = ?
      `;

    const [data] = await connection.promise().query(statement, param);
    return data[0];
  };
};

export const getUserByName = getUser('user.name');
export const getUserById = getUser('user.id');
