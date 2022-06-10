import { connection } from '../app/database/mysql';
import { PaymentModel, PaymentStatus } from './payment.model';

/**
 * 获取支付方法
 */
export interface GetPaymentsOptions {
  status?: PaymentStatus;
}
export const getPayments = async (options: GetPaymentsOptions = {}) => {
  const { status = 'published' } = options;

  const statement = `
    SELECT
      payment.id,
      payment.name,
      payment.title,
      payment.description,
      payment.meta
    FROM
      payment
    WHERE
      payment.status = ?
    ORDER BY payment.index ASC
  `;

  const [data] = await connection.promise().query(statement, status);
  return data as Array<PaymentModel>;
};
