import { Request } from 'express';
import querystring = require('querystring');
import crypto = require('crypto');
import dayjs = require('dayjs');
import { OrderModel } from '../../order/order.model';
import { AlipayMethod, AlipayRequestParams } from './alipay.interface';
import {
  ALIPAY_APP_ID,
  ALIPAY_APP_PRIVATE_KEY,
  ALIPAY_NOTIFY_URL,
  ALIPAY_RETURN_URL,
  APP_NAME,
  DATE_TIME_FORMAT,
} from '../../app/app.config';
import { uid } from '../../app/app.service';

/**
 * 支付宝：请求参数
 */
export const alipayRequestParams = async (
  order: OrderModel,
  method: AlipayMethod,
  request: Request,
) => {
  // 应用 ID
  const app_id = ALIPAY_APP_ID;

  // 编码格式
  const charset = 'utf-8';

  // 签名算法
  const sign_type = 'RSA2';

  // 请求事件
  const timestamp = dayjs().format(DATE_TIME_FORMAT);

  // 接口版本
  const version = '1.0';

  // 通知地址
  const notify_url = ALIPAY_NOTIFY_URL;

  // 返回地址
  const return_url = ALIPAY_RETURN_URL;

  // 订单号
  const out_trade_no = `${uid()}_${order.id}`;

  // 订单金额
  const total_amount = order.totalAmount;

  // 商品标题
  const subject = `${APP_NAME}#${order.id}`;

  // 公用回传
  const socketId = (request.headers['x-socket-id'] ||
    request.headers['X-Socket-Id']) as string;

  const passback_params = socketId || 'NULL';

  // 产品代码
  let product_code: string;

  switch (method) {
    case AlipayMethod.page:
      product_code = 'FAST_INSTANT_TRADE_PAY';
      break;
    case AlipayMethod.wap:
      product_code = 'QUICH_WAP_PAY';
      break;
  }

  // 参数集合
  const biz_content = JSON.stringify({
    out_trade_no,
    total_amount,
    subject,
    passback_params,
    product_code,
  });

  // 请求参数
  const requestParams: AlipayRequestParams = {
    app_id,
    charset,
    sign_type,
    timestamp,
    version,
    method,
    notify_url,
    return_url,
    biz_content,
  };

  return requestParams;
};

/**
 * 支付宝：签名预处理
 */
export const alipayPreSign = (data: AlipayRequestParams) => {
  // 排序
  const sortedData = {};
  const keys = Object.keys(data).sort();
  for (const key of keys) {
    sortedData[key] = data[key].trim();
  }

  // 查询符
  const dataString = querystring.stringify(sortedData, null, null, {
    encodeURIComponent: querystring.unescape,
  });

  return dataString;
};

/**
 * 支付宝：签名
 */
export const alipaySign = (data: AlipayRequestParams) => {
  const dataString = alipayPreSign(data);

  const sign = crypto
    .createSign('sha256')
    .update(dataString)
    .sign(ALIPAY_APP_PRIVATE_KEY, 'base64');

  return sign;
};
