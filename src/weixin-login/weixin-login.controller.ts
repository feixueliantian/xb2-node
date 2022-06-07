import { Request, Response, NextFunction } from 'express';
import { socketIoServer } from '../app/app.server';
import { signToken } from '../auth/auth.service';
import { updateUserMeta } from '../user-meta/user-meta-service';
import { weixinLoginPostProcess } from './weixin-login.service';

/**
 * 微信登录：用户授权重定向
 */
export const weixinLoginCallback = async (
  request: Request,
  response: Response,
  next: NextFunction,
) => {
  const { state: socketId } = request.query;
  const { user, userMeta, weixinUserInfo } = request.body;

  try {
    // 签发令牌
    const payload = { id: user.id, name: user.name };
    const token = signToken({ payload });

    // 通知客户端登录成功
    socketIoServer
      .to(socketId as string)
      .emit('weixinLoginSucceeded', { user, token });

    // 更新用户 Meta
    await updateUserMeta(userMeta.id, {
      info: JSON.stringify(weixinUserInfo),
    });

    // 后期处理
    await weixinLoginPostProcess({ user, weixinUserInfo });

    // 做出响应
    response.sendStatus(200);
  } catch (error) {
    return next(error);
  }
};
