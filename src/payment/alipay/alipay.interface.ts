/**
 * 支付宝：请求参数
 */
export interface AlipayRequestParams {
  app_id: string;
  charset: string;
  sign_type: string;
  timestamp: string;
  version: string;
  method: string;
  notify_url?: string;
  return_url?: string;
  biz_content: string;
}

/**
 * 支付宝：支付方法
 */
export enum AlipayMethod {
  page = 'alipay.trade.page.pay',
  wap = 'alipay.trade.wap.pay',
}
