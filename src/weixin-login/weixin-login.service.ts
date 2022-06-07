import {
  WEIXIN_WEBSITE_APP_ID,
  WEIXIN_WEBSITE_APP_SECRET,
} from '../app/app.config';
import { weixinApiHttpClient } from '../app/app.service';

/**
 * 微信登录：获取访问令牌
 */

export interface WeixinAccessToken {
  access_token?: string;
  expries_in?: number;
  refresh_token?: string;
  openid?: string;
  scope?: string;
  unionid?: string;
}

// code 是微信提供的登录凭证
export const getWeixinAccessToken = async (code: string) => {
  // 微信接口规定的查询符
  const accessTokenQueryString = new URLSearchParams({
    appid: WEIXIN_WEBSITE_APP_ID,
    secret: WEIXIN_WEBSITE_APP_SECRET,
    code,
    grant_type: 'authorization_code',
  }).toString();

  // 请求访问令牌
  const { data } = await weixinApiHttpClient.get(
    `oauth2/access_token?${accessTokenQueryString}`,
  );

  if (!data.access_token) {
    throw new Error('BAD_REQUEST');
  }

  return data as WeixinAccessToken;
};

/**
 * 获取微信用户信息
 */
export interface GetWeixinUserInfoOptions {
  access_token: string;
  openid: string;
}

export interface WeixinUserInfo {
  openid?: string;
  nickname?: string;
  sex?: number;
  language?: string;
  city?: string;
  provice?: string;
  country?: string;
  headimgurl?: string;
  privilege?: Array<string>;
  unionid?: string;
}

export const getWeixinUserInfo = async (options: GetWeixinUserInfoOptions) => {
  // 结构参数
  const { access_token, openid } = options;

  // 查询符
  const userInfoQueryString = new URLSearchParams({
    access_token,
    openid,
  });

  // 请求微信用户信息
  const { data } = await weixinApiHttpClient.get(
    `userinfo?${userInfoQueryString}`,
  );

  if (!data.openid) {
    throw new Error('BAD_REQUEST');
  }

  // 提供微信用户信息
  return data as WeixinUserInfo;
};
