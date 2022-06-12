export enum SubscriptionLogAction {
  create = 'create',
  upgrade = 'upgrade',
  upgraded = 'upgraded',
  resubscribe = 'resubscribe',
  resubscribed = 'resubscribed',
  renew = 'renew',
  renewed = 'renewed',
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
