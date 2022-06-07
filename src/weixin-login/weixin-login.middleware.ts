import { Request, Response, NextFunction } from 'express';
import { socketIoServer } from '../app/app.server';
import {
  createUserMeta,
  getUserMetaByWeixinUnionId,
} from '../user-meta/user-meta-service';
import { UserMetaType } from '../user-meta/user-meta.model';
import { createUser, getUserById } from '../user/user.service';
import {
  getWeixinAccessToken,
  getWeixinUserInfo,
} from './weixin-login.service';

/**
 * 微信登录守卫
 * 获取正在登录的用户的微信账户信息
 * 检查该微信账户是否与系统账户绑定
 */
export const weixinLoginGuard = async (
  request: Request,
  response: Response,
  next: NextFunction,
) => {
  // code 是微信登录凭证
  const { code, state: socketId } = request.query;
  if (!(code && socketId)) return next(new Error('BAD_REQUEST'));

  try {
    // 微信访问令牌
    const { access_token, openid, unionid } = await getWeixinAccessToken(
      code as string,
    );

    // 微信用户信息
    const weixinUserInfo = await getWeixinUserInfo({ access_token, openid });

    // 检查是否绑定
    const userMeta = await getUserMetaByWeixinUnionId(unionid);

    if (userMeta) {
      const user = await getUserById(userMeta.userId);
      request.user = user;
      request.body = {
        user,
        weixinUserInfo,
        userMeta,
      };
    } else {
      // 通知客户端需要绑定账户
      socketIoServer
        .to(socketId as string)
        .emit('weixinLoginConnect', weixinUserInfo);

      return next(new Error('CONNECT_ACCOUNT_REQUIRED'));
    }
  } catch (error) {
    return next(error);
  }

  return next();
};

/**
 * 微信登录关联器
 */
export interface WeixinLoginConnectorOptions {
  isCreateUserRequired: boolean;
}

export const weixinLoginConnector = (
  options: WeixinLoginConnectorOptions = { isCreateUserRequired: true },
) => {
  return async (request: Request, response: Response, next: NextFunction) => {
    const { isCreateUserRequired } = options;

    const { weixinUserInfo } = request.body;

    let { user = null } = request;

    try {
      // 检查是否绑定过
      const { unionid } = weixinUserInfo;
      const userMeta = getUserMetaByWeixinUnionId(unionid);
      if (userMeta) return next(new Error('WEIXIN_ACCOUNT_ALREADY_CONNECTED'));

      // 需要创建新用户
      if (isCreateUserRequired) {
        const { name, password } = request.body;
        const data = await createUser({ name, password });

        // 获取新创建的用户
        user = await getUserById(data.insertId);

        // 设置请求用户
        request.user = user;
      }

      // 关联账户
      await createUserMeta({
        userId: user.id,
        type: UserMetaType.weixinUserInfo,
        info: JSON.stringify(weixinUserInfo),
      });
    } catch (error) {
      return next(error);
    }

    return next();
  };
};
