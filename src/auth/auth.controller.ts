import { Request, Response, NextFunction } from 'express';
import { signToken } from './auth.service';

export const login = async (
  request: Request,
  response: Response,
  next: NextFunction,
) => {
  const {
    user: { id, name },
  } = request.body;

  const payload = { id, name };

  try {
    const token = signToken({ payload });
    response.send({ id, name, token });
  } catch (error) {
    next(error);
  }
};

export const validate = (
  request: Request,
  response: Response,
  next: NextFunction,
) => {
  console.log(request.user);
  response.sendStatus(200);
};
