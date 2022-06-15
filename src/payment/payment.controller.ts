import { Request, Response, NextFunction } from 'express';
import { logger, xmlBuilder, xmlParser } from '../app/app.service';
import { alipayVerifyPaymentResult } from './alipay/alipay.service';
import { getPayments, paymentRecived } from './payment.service';
import { WxpayPaymentResult } from './wxpay/wxpay.interface';
import { wxpayVerifyPaymentResult } from './wxpay/wxpay.service';
/**
 * 获取支付方式
 */
export const index = async (
  request: Request,
  response: Response,
  next: NextFunction,
) => {
  try {
    const payments = await getPayments();
    return response.send(payments);
  } catch (error) {
    return next(error);
  }
};

/**
 * 支付结果通知：微信支付
 */
export const wxpayNotify = async (
  request: Request,
  response: Response,
  next: NextFunction,
) => {
  try {
    // 1. 处理通知数据
    const data = await xmlParser.parseStringPromise(request.body);
    const paymentResult = data.xml as WxpayPaymentResult;

    logger.debug('微信支付结果：', paymentResult);

    const orderId = paymentResult.out_trade_no.split('_')[1];

    // 2. 验证通知数据
    const isValid = await wxpayVerifyPaymentResult(paymentResult);

    // 3. 处理完成付款
    if (isValid) {
      paymentRecived(parseInt(orderId, 10), paymentResult);
    }

    // 4. 作出响应
    const return_code = isValid ? 'SUCCESS' : 'FAIL';
    const responseData = xmlBuilder.buildObject({
      xml: {
        return_code,
      },
    });

    response.header({ 'Content-Type': 'text/xml' }).send(responseData);
  } catch (error) {
    return next(error);
  }
};

/**
 * 支付结果通知：支付宝
 */
export const alipayNotify = async (
  request: Request,
  response: Response,
  next: NextFunction,
) => {
  try {
    // 1. 处理通知数据
    const paymentResult = request.body;

    logger.debug('支付宝支付结果：', paymentResult);

    // 2. 验证通知数据
    const isValid = alipayVerifyPaymentResult(paymentResult);
    const orderId = paymentResult.out_trade_no.split('_')[1];

    // 3. 处理完成付款
    if (isValid) {
      paymentRecived(parseInt(orderId, 10), paymentResult);
    }

    // 4. 作出响应
    const responseData = isValid ? 'success' : 'failure';

    response.send(responseData);
  } catch (error) {
    return next(error);
  }
};
