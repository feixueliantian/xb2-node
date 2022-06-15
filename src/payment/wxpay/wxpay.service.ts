import querystring = require('querystring');
import crypto = require('crypto');
import { WxpayOrder, WxpayPaymentResult } from './wxpay.interface';
import { WXPAY_KEY } from '../../app/app.config';

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

/**
 * 微信支付：验证微信服务器发过来的支付结果通知是否有效
 */
export const wxpayVerifyPaymentResult = async (
  paymentResult: WxpayPaymentResult,
) => {
  const { sign } = paymentResult;
  delete paymentResult.sign;

  const selfSign = wxpaySign(paymentResult, WXPAY_KEY);

  const isValidSign = sign === selfSign;

  return isValidSign;
};
