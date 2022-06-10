import { Request, Response, NextFunction } from 'express';
import { socketIoServer } from '../app/app.server';
import { signToken } from '../auth/auth.service';
import { updateUserMeta } from '../user-meta/user-meta-service';
import { UserData } from '../user/user.service';
import { weixinLoginPostProcess } from './weixin-login.service';

/**
 * 微信登录：用户授权重定向，微信登录
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

/**
 * 微信登录：绑定已有用户之后登录
 */
export const weixinLoginConnect = async (
  request: Request,
  response: Response,
  next: NextFunction,
) => {
  const user = request.user as UserData;
  const { weixinUserInfo } = request.body;

  try {
    // 用绑定的已有账户来登录，签发 token
    const payload = {
      id: user.id,
      name: user.name,
    };
    const token = signToken({ payload });

    // 后期处理
    await weixinLoginPostProcess({ user, weixinUserInfo });

    return response.send({ user, token });
  } catch (error) {
    return next(error);
  }
};

/**
 * 微信登录：绑定新创建的用户之后登录
 */
export const weixinLoginCreateConnect = async (
  request: Request,
  response: Response,
  next: NextFunction,
) => {
  const user = request.user as UserData;
  const { weixinUserInfo } = request.body;

  try {
    // 用绑定的已有账户来登录，签发 token
    const payload = {
      id: user.id,
      name: user.name,
    };
    const token = signToken({ payload });

    // 后期处理
    await weixinLoginPostProcess({ user, weixinUserInfo });

    return response.status(201).send({ user, token });
  } catch (error) {
    return next(error);
  }
};
