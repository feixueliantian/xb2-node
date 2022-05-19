import { Request, Response, NextFunction } from 'express';
import { createTag, getTagByName } from './tag.service';

/**
 * 存储标签
 */
export const store = async (
  request: Request,
  response: Response,
  next: NextFunction,
) => {
  const { name } = request.body;

  try {
    // 查看标签是否已经存在
    const tag = await getTagByName(name);
    if (tag) throw new Error('TAG_ALREADY_EXISTS');

    // 创建标签
    const data = await createTag({ name });
    return response.status(201).send(data);
  } catch (error) {
    return next(error);
  }
};
