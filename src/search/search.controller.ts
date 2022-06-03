import { Request, Response, NextFunction } from 'express';
import {
  searchCameras,
  searchLens,
  searchTags,
  searchUsers,
} from './search.service';

/**
 * 搜索标签
 */
export const tags = async (
  request: Request,
  response: Response,
  next: NextFunction,
) => {
  const name = request.query.name as string;

  try {
    const tags = await searchTags({ name });
    return response.send(tags);
  } catch (error) {
    return next(error);
  }
};

/**
 * 搜索用户
 */
export const users = async (
  request: Request,
  response: Response,
  next: NextFunction,
) => {
  const name = request.query.name as string;

  try {
    const users = await searchUsers({ name });
    return response.send(users);
  } catch (error) {
    return next(error);
  }
};

/**
 * 搜索相机
 */
export const cameras = async (
  request: Request,
  response: Response,
  next: NextFunction,
) => {
  const makeModel = request.query.makeModel as string;

  try {
    const cameras = await searchCameras({ makeModel });
    return response.send(cameras);
  } catch (error) {
    return next(error);
  }
};

/**
 * 搜索镜头
 */
export const lens = async (
  request: Request,
  response: Response,
  next: NextFunction,
) => {
  const makeModel = request.query.makeModel as string;

  try {
    const lens = await searchLens({ makeModel });
    return response.send(lens);
  } catch (error) {
    return next(error);
  }
};
