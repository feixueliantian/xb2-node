export enum OrderLogAction {
  orderCreated = 'orderCreated',
  orderUpdated = 'orderUpdated',
  orderStatusChanged = 'orderStatusChanged',
  orderPaymentRecived = 'orderPaymentRecived',
}

export class OrderLogModel {
  id?: number;
  orderId?: number;
  userId?: number;
  action?: OrderLogAction;
  meta?: string;
  created?: string;
}
