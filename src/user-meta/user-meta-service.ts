import { connection } from '../app/database/mysql';
import { UserMetaModel, UserMetaType } from './user-meta.model';

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

/**
 * 按 Info 字段的某个 Prop 查询 UserMeta
 */
export const getUserMetaByInfoProp = (
  type: UserMetaType,
  infoPropName: string,
) => {
  return async (value: number | string) => {
    const statement = `
      SELECT
        *
      FROM
        user_meta
      WHERE
        type = ?
        AND user_meta.info->'$.${infoPropName}' = ?
      ORDER BY
        user_meta.id DESC
      LIMIT 1
    `;

    const params = [type, value];
    const [data] = await connection.promise().query(statement, params);
    return data[0] ? (data[0] as any) : null;
  };
};

export const getUserMetaByWeixinOpenId = getUserMetaByInfoProp(
  UserMetaType.weixinUserInfo,
  // openid 加密之后的微信用户的账户
  'openid',
);

export const getUserMetaByWeixinUnionId = getUserMetaByInfoProp(
  UserMetaType.weixinUserInfo,
  // unionid 微信用户在所有应用里面的统一标识
  'unionid',
);
