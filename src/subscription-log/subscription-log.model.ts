export enum SubscriptionLogAction {
  create = 'create',
  upgrade = 'upgrade',
  resubscribe = 'resubscribe',
  renew = 'renew',
  statusChanged = 'statusChanged',
}
export class SubscriptionLogModel {
  id?: number;
  subscriptionId?: number;
  userId?: number;
  orderId?: number;
  action?: SubscriptionLogAction;
  meta?: any;
  created?: string;
}
