import { Request, Response, NextFunction } from 'express';
import jwt = require('jsonwebtoken');
import bcrypt = require('bcrypt');
import * as userService from '../user/user.service';
import { PUBLIC_KEY } from '../app/app.config';

export const validateLoginData = async (
  request: Request,
  response: Response,
  next: NextFunction,
) => {
  console.log('验证用户登录数据');

  // 准备数据
  const { name, password } = request.body;

  // 验证必填数据
  if (!name) return next(new Error('NAME_IS_REQUIRED'));
  if (!password) return next(new Error('PASSWORD_IS_REQUIRED'));

  // 验证用户名是否存在
  const user = await userService.getUserByName(name, { password: true });
  if (!user) return next(new Error('USER_DOES_NOT_EXIST'));

  // 验证用户密码是否正确
  const matched = await bcrypt.compare(password, user.password);
  if (!matched) return next(new Error('PASSWORD_DOES_NOT_MATCH'));

  // 在请求主体里添加用户
  request.body.user = user;

  next();
};

export const authGuard = (
  request: Request,
  response: Response,
  next: NextFunction,
) => {
  console.log('验证用户身份');

  try {
    // 提取 Authorization
    const authorization = request.get('Authorization');
    if (!authorization) throw new Error();

    // 提取 JWT 令牌
    const token = authorization.replace('Bearer ', '');
    if (!token) throw new Error();

    // 验证令牌
    jwt.verify(token, PUBLIC_KEY, {
      algorithms: ['RS256'],
    });

    next();
  } catch (error) {
    next(new Error('UNAUTHORIZED'));
  }
};
