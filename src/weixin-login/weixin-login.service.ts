import path = require('path');
import fs = require('fs');
import Jimp = require('jimp');
import {
  WEIXIN_WEBSITE_APP_ID,
  WEIXIN_WEBSITE_APP_SECRET,
} from '../app/app.config';
import { httpClient, weixinApiHttpClient } from '../app/app.service';
import { UserData } from '../user/user.service';
import { createAvatar } from '../avatar/avatar.service';

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
  province?: string;
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

/**
 * 微信登录：后期处理
 */
export interface WeixinLoginPostProcessOptions {
  user?: UserData;
  weixinUserInfo?: WeixinUserInfo;
}

export const weixinLoginPostProcess = async (
  options: WeixinLoginPostProcessOptions,
) => {
  const {
    user,
    weixinUserInfo: { headimgurl, unionid },
  } = options;

  // 没有头像，用微信头像作为头像
  if (!user.avatar) {
    // 头像地址
    const avatarUrl = headimgurl;

    // 下载头像
    const response = await httpClient.get(avatarUrl, {
      responseType: 'stream',
    });

    // 准备头像文件信息
    const mimetype = response.headers['content-type'];
    const size = response.headers['content-length'];
    const filename = unionid;

    const filePath = path.join('uploads', 'avatar', filename);
    const fileResizedPath = path.join('uploads', 'avatar', 'resized', filename);

    // 创建头像文件
    const fileWriter = fs.createWriteStream(filePath);
    response.data.pipe(fileWriter);

    // 处理头像文件
    fileWriter.on('finish', async () => {
      // 读取文件
      const image = await Jimp.read(filePath);

      // 调整尺寸
      image.cover(256, 256).quality(100).write(`${fileResizedPath}-large`);
      image.cover(128, 128).quality(100).write(`${fileResizedPath}-medium`);
      image.cover(64, 64).quality(100).write(`${fileResizedPath}-small`);

      // 保存头像数据
      createAvatar({
        userId: user.id,
        mimetype,
        filename,
        size: parseInt(size, 10),
      });
    });
  }
};
