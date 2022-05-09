import { Request, Response } from 'express';
import { getPosts } from './post.service';

export const index = (request: Request, response: Response): void => {
  const posts = getPosts();
  response.send(posts);
};
