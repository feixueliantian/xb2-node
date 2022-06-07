import { Request, Response, NextFunction } from 'express';
import { socketIoServer } from '../app/app.server';
import { getUserMetaByWeixinUnionId } from '../user-meta/user-meta-service';
import { getUserById } from '../user/user.service';
import {
  getWeixinAccessToken,
  getWeixinUserInfo,
} from './weixin-login.service';

/**
 * 微信登录守卫
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
