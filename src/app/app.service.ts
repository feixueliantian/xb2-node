import axios from 'axios';
import ShortUniqueId from 'short-unique-id';
import log4js = require('log4js');
import { WEIXIN_API_BASE_URL } from './app.config';

/**
 * HTTP 客户端：微信
 */
export const weixinApiHttpClient = axios.create({
  baseURL: WEIXIN_API_BASE_URL,
});

/**
 * HTTP 客户端
 */
export const httpClient = axios.create();

/**
 * UID
 */
export const uid = new ShortUniqueId();

/**
 * 日志记录器
 */
log4js.configure({
  appenders: {
    file: {
      type: 'file',
      filename: 'app.log',
      layout: {
        type: 'pattern',
        pattern: '%r %p - %m',
      },
    },
  },
  categories: {
    default: {
      appenders: ['file'],
      level: 'debug',
    },
  },
});

export const logger = log4js.getLogger();
