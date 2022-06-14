import { config } from 'dotenv';

config();

export const { APP_PORT } = process.env;

export const {
  MYSQL_HOST,
  MYSQL_PORT,
  MYSQL_USER,
  MYSQL_PASSWORD,
  MYSQL_DATABASE,
} = process.env;

export let { PRIVATE_KEY, PUBLIC_KEY } = process.env;
PRIVATE_KEY = Buffer.from(PRIVATE_KEY, 'base64').toString();
PUBLIC_KEY = Buffer.from(PUBLIC_KEY, 'base64').toString();

// 分页
export const POSTS_PER_PAGE = parseInt(process.env['POSTS_PER_PAGE'], 10);
export const COMMENTS_PER_PAGE = parseInt(process.env['COMMENTS_PER_PAGE'], 10);
export const LICENSES_PER_PAGE = parseInt(process.env['LICENSES_PER_PAGE'], 10);

// 跨域
export const ALLOW_ORIGIN = process.env['ALLOW_ORIGIN'];

// 微信登录：网站应用
export const {
  WEIXIN_API_BASE_URL,
  WEIXIN_WEBSITE_APP_ID,
  WEIXIN_WEBSITE_APP_SECRET,
} = process.env;

// 订阅
export const STANDARD_SUBSCRIPTION_DOWNLOAD_LIMIT_PER_WEEK = parseInt(
  process.env['STANDARD_SUBSCRIPTION_DOWNLOAD_LIMIT_PER_WEEK'],
  10,
);

// 日期格式
export const DATE_TIME_FORMAT = 'YYYY-MM-DD HH:mm:ss';
