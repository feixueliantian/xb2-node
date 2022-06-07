import { Request, Response, NextFunction } from 'express';

export const requestUrl = (
  request: Request,
  response: Response,
  next: NextFunction,
) => {
  console.log(request.url);
  next();
};

export const defaultErrorHandler = (
  error: any,
  request: Request,
  response: Response,
  next: NextFunction,
) => {
  if (error.message) {
    console.log('错误', error.message, error.sql);
  }

  let statusCode: number, message: string;

  switch (error.message) {
    case 'NAME_IS_REQUIRED':
      statusCode = 400;
      message = '请提供用户名';
      break;
    case 'PASSWORD_IS_REQUIRED':
      statusCode = 400;
      message = '请提供用户密码';
      break;
    case 'USER_ALREADY_EXIST':
      statusCode = 409;
      message = '用户名已经被占用了';
      break;
    case 'USER_DOES_NOT_EXIST':
      statusCode = 400;
      message = '用户不存在';
      break;
    case 'PASSWORD_DOES_NOT_MATCH':
      statusCode = 400;
      message = '密码不正确';
      break;
    case 'UNAUTHORIZED':
      statusCode = 401;
      message = '请先登录';
      break;
    case 'USER_DOSE_NOT_OWN_RESOURCE':
      statusCode = 403;
      message = '您不能处理这个内容';
      break;
    case 'FILE_NOT_FOUND':
      statusCode = 404;
      message = '文件不存在';
      break;
    case 'TAG_ALREADY_EXISTS':
      statusCode = 400;
      message = '标签已经存在';
      break;
    case 'POST_ALREADY_HAS_THIS_TAG':
      statusCode = 400;
      message = '内容已经打过该标签了';
      break;
    case 'UNABLE_TO_REPLY_THIS_COMMENT':
      statusCode = 400;
      message = '无法回复该条评论';
      break;
    case 'FILE_TYPE_NOT_ACCEPT':
      statusCode = 400;
      message = '不能上传此类型的文件';
      break;
    case 'NOT_FOUND':
      statusCode = 404;
      message = '没找到';
      break;
    case 'USER_NOT_FOUND':
      statusCode = 404;
      message = '这个用户没找到';
      break;
    case 'PASSWORD_IS_THE_SAME':
      statusCode = 400;
      message = '新密码不能与原密码相同';
      break;
    case 'BAD_REQUEST':
      statusCode = 400;
      message = '无法处理您的请求';
      break;
    case 'CONNECT_ACCOUNT_REQUIRED':
      statusCode = 400;
      message = '需要关联账户';
      break;
    case 'FORBIDDEN':
      statusCode = 403;
      message = '没有权限访问';
      break;
    default:
      statusCode = 500;
      message = '服务除了点问题';
      break;
  }

  response.status(statusCode).send({ message });
};
