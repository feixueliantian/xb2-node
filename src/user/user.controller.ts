import { Request, Response, NextFunction } from 'express';
import { createUser, getUserById } from './user.service';

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
