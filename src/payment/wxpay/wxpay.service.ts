import querystring = require('querystring');
import crypto = require('crypto');
import { WxpayOrder, WxpayPaymentResult } from './wxpay.interface';

/**
 * 微信支付：签名
 */
export const wxpaySign = (
  data: WxpayOrder | WxpayPaymentResult,
  key: string,
) => {
  // 1. 排序
  const sortedData = {};
  const keys = Object.keys(data);
  for (const key of keys) {
    sortedData[key] = data[key];
  }

  // 2. 转换成地址查询符
  const stringData = querystring.stringify(sortedData, null, null, {
    encodeURIComponent: querystring.unescape,
  });

  // 3. 结尾加上密钥
  const stringDataWithKey = `${stringData}&key=${key}`;

  // 4. md5 后全部大写
  const sign = crypto
    .createHash('md5')
    .update(stringDataWithKey)
    .digest('hex')
    .toUpperCase();

  return sign;
};
