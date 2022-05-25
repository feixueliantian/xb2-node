import { Request, Response, NextFunction } from 'express';
import bcrypt = require('bcrypt');
import * as userService from './user.service';

export const validateUserData = async (
  request: Request,
  response: Response,
  next: NextFunction,
) => {
  console.log('验证用户数据');

  const { name, password } = request.body;

  if (!name) return next(new Error('NAME_IS_REQUIRED'));
  if (!password) return next(new Error('PASSWORD_IS_REQUIRED'));

  const user = await userService.getUserByName(name);
  if (user) return next(new Error('USER_ALREADY_EXIST'));
  next();
};

export const hashPassword = async (
  request: Request,
  response: Response,
  next: NextFunction,
) => {
  const { password } = request.body;
  request.body.password = await bcrypt.hash(password, 10);
  next();
};

/**
 * 验证更新用户数据
 */
export const validateUpdateUserData = async (
  request: Request,
  response: Response,
  next: NextFunction,
) => {
  const { validate, update } = request.body;
  const { id: userId } = request.user;

  try {
    // 检查用户是否提供了当前密码
    if (!validate.password) throw new Error('PASSWORD_IS_REQUIRED');

    // 检查用户数据
    const user = await userService.getUserById(userId, { password: true });
    if (!user) throw new Error('USER_NOT_FOUND');

    // 验证用户密码
    const matched = await bcrypt.compare(validate.password, user.password);
    if (!matched) throw new Error('PASSWORD_DOES_NOT_MATCH');

    // 检查用户名是否被占用
    if (update.name) {
      const user = await userService.getUserByName(update.name);
      if (user) throw new Error('USER_ALREADY_EXIST');
    }

    // 检查新密码是否与原来的相同
    if (update.password) {
      const matched = await bcrypt.compare(update.password, user.password);
      if (matched) throw new Error('PASSWORD_IS_THE_SAME');

      request.body.update.password = await bcrypt.hash(update.password, 10);
    }
  } catch (error) {
    return next(error);
  }

  next();
};
