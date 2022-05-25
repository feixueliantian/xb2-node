import _ = require('lodash');
import { Request, Response, NextFunction } from 'express';
import { createUser, getUserById, updateUser } from './user.service';

export const store = async (
  request: Request,
  response: Response,
  next: NextFunction,
) => {
  const { name, password } = request.body;

  try {
    const data = await createUser({ name, password });
    response.status(201).send(data);
  } catch (error) {
    next(error);
  }
};

/**
 * 用户账户
 */
export const show = async (
  request: Request,
  response: Response,
  next: NextFunction,
) => {
  const { userId } = request.params;

  try {
    const user = await getUserById(parseInt(userId, 10));
    if (!user) throw new Error('USER_NOT_FOUND');
    return response.send(user);
  } catch (error) {
    return next(error);
  }
};

/**
 * 更新用户
 */
export const update = async (
  request: Request,
  response: Response,
  next: NextFunction,
) => {
  const { id: userId } = request.user;
  const { update } = request.body;
  const userData = _.pick(update, ['name', 'password']);

  try {
    const data = await updateUser(userId, userData);
    return response.send(data);
  } catch (error) {
    return next(error);
  }
};
