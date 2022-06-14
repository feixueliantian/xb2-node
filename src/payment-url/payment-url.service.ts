import { connection } from '../app/database/mysql';
import { PaymentUrlModel } from './payment-url.model';

/**
 * 创建支付地址
 */
export const createPaymentUrl = async (paymentUrl: PaymentUrlModel) => {
  const statement = `
    INSERT INTO payment_url
    SET ?
  `;

  const [data] = await connection.promise().query(statement, paymentUrl);
  return data as any;
};

/**
 * 更新支付地址
 */
export const updatePaymentUrl = async (
  paymentUrlId: number,
  paymentUrl: PaymentUrlModel,
) => {
  const statement = `
    UPDATE payment_url
    SET ?
    WHERE payment_url.id = ?
  `;

  const [data] = await connection
    .promise()
    .query(statement, [paymentUrl, paymentUrlId]);
  return data as any;
};

/**
 * 按照 token 查找支付地址
 */
export const getPaymentUrlByToken = async (token: string) => {
  const statement = `
    SELECT
      *
    FROM
      payment_url
    WHERE
      payment_url.token = ?
  `;

  const [data] = await connection.promise().query(statement, token);
  return data[0] as PaymentUrlModel;
};
