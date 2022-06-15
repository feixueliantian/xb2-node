import { socketIoServer } from '../app/app.server';
import { connection } from '../app/database/mysql';
import { LicenseStatus } from '../license/license.model';
import { getLicenseByOrderId, updateLicense } from '../license/license.service';
import { OrderLogAction } from '../order-log/order-log.model';
import { createOrderLog } from '../order-log/order-log.service';
import { postProcessSubsciption } from '../order/order.controller';
import { OrderStatus } from '../order/order.model';
import { getOrderById, updateOrder } from '../order/order.service';
import { ProductStatus, ProductType } from '../product/product.model';
import { getProductById } from '../product/product.service';
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

/**
 * 已收到付款
 */
export const paymentRecived = async (orderId: number, paymentResult: any) => {
  // 检查订单
  const order = await getOrderById(orderId);
  const isValidOrder = order && order.status === OrderStatus.pending;
  if (!isValidOrder) return;

  // 创建订单日志：已收到付款
  await createOrderLog({
    userId: order.userId,
    orderId: order.id,
    action: OrderLogAction.orderPaymentRecived,
    meta: JSON.stringify(paymentResult),
  });

  // 更新订单状态
  await updateOrder(order.id, { status: OrderStatus.completed });

  // 创建订单日志：已完成订单
  await createOrderLog({
    userId: order.userId,
    orderId: order.id,
    action: OrderLogAction.orderStatusChanged,
    meta: JSON.stringify({
      status: OrderStatus.completed,
    }),
  });

  // 检查产品
  const product = await getProductById(order.productId);
  const isValidProduct = product && product.status === ProductStatus.published;

  if (!isValidProduct) return;

  // SocketId
  const socketId = paymentResult.attach || paymentResult.passback_params;
  const isValidSocketId = socketId && socketId !== 'NULL';

  // 许可产品
  if (product.type === ProductType.license) {
    const license = await getLicenseByOrderId(order.id);
    const isValidLicense = license && license.status === LicenseStatus.pending;

    if (!isValidLicense) return;

    await updateLicense(license.id, {
      status: LicenseStatus.valid,
    });

    if (isValidSocketId) {
      socketIoServer.to(socketId).emit('licenseStatusChanged', {
        ...license,
        status: LicenseStatus.valid,
      });
    }
  }

  // 订阅产品
  if (product.type === ProductType.subscription) {
    await postProcessSubsciption({ order, product, socketId });
  }
};
