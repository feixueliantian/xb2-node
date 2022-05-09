import { Request, Response } from 'express';

export const index = (request: Request, response: Response): void => {
  response.send('内容列表接口');
};
