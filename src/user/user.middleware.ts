import { Request, Response, NextFunction } from 'express';
import * as userService from './user.service';

export const validateUserData = async (
  request: Request,
  response: Response,
  next: NextFunction,
) => {
  console.log('验证数据数据');

  const { name, password } = request.body;

  if (!name) return next(new Error('NAME_IS_REQUIRED'));
  if (!password) return next(new Error('PASSWORD_IS_REQUIRED'));

  const user = await userService.getUserByName(name);
  if (user) return next(new Error('USER_ALREADY_EXIST'));
  next();
};
