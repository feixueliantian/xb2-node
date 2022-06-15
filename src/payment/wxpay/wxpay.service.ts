import querystring = require('querystring');
import crypto = require('crypto');
import { Request } from 'express';
import {
  WxpayOrder,
  WxpayPaymentResult,
  WxpayPrePayResult,
} from './wxpay.interface';
import {
  APP_NAME,
  WXPAY_API_UNIFIEDORDER,
  WXPAY_APP_ID,
  WXPAY_KEY,
  WXPAY_MCH_ID,
  WXPAY_NOTIFY_URL,
} from '../../app/app.config';
import { OrderModel } from '../../order/order.model';
import {
  httpClient,
  logger,
  uid,
  xmlBuilder,
  xmlParser,
} from '../../app/app.service';

/**
 * 微信支付：签名
 */
export const wxpaySign = (
  data: WxpayOrder | WxpayPaymentResult,
  key: string,
) => {
  // 1. 排序
  const sortedData = {};
  const keys = Object.keys(data).sort();
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

/**
 * 微信支付
 */
export const wxpay = async (order: OrderModel, request: Request) => {
  // 公众账号 ID
  const appid = WXPAY_APP_ID;

  // 微信支付商户 ID
  const mch_id = WXPAY_MCH_ID;

  // 订单号
  const out_trade_no = `${uid()}_${order.id}`;

  // 商品 ID
  const product_id = order.productId;

  // 商品描述
  const body = `${APP_NAME}#${order.id}`;

  // 订单金额
  const total_fee = Math.round(order.totalAmount * 100);

  // 支付类型（扫码支付）
  const trade_type = 'NATIVE';

  // 通知地址
  const notify_url = WXPAY_NOTIFY_URL;

  // 随机字符
  const nonce_str = uid();

  // 附加数据
  const socketId = (request.headers['x-socket-id'] ||
    request.headers['X-Socket-Id']) as string;

  const attach = socketId || 'NULL';

  // 订单
  const wxpayOrder = {
    appid,
    mch_id,
    out_trade_no,
    product_id,
    body,
    total_fee,
    trade_type,
    notify_url,
    nonce_str,
    attach,
  };

  // 签名
  const sign = wxpaySign(wxpayOrder, WXPAY_KEY);

  const wxpayOrderXml = xmlBuilder.buildObject({
    ...wxpayOrder,
    sign,
  });

  // 统一下单
  const response = await httpClient.post(WXPAY_API_UNIFIEDORDER, wxpayOrderXml);
  const { xml: prepayResult } = await xmlParser.parseStringPromise(
    response.data,
  );

  logger.debug('微信支付统一下单结果：', prepayResult);

  if (prepayResult.return_code === 'FAIL') {
    throw new Error(prepayResult.return_msg);
  }

  return prepayResult as WxpayPrePayResult;
};
