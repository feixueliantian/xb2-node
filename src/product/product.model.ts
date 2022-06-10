export enum ProductType {
  license = 'license',
  subscription = 'subscription',
}

export interface ProductMeta {
  unit?: string;
  color?: string;
  billingCycle?: string;
  subscriptionType?: string;
}

export class ProductModel {
  id?: number;
  userId?: number;
  type?: ProductType;
  title?: string;
  description?: Array<string>;
  price?: number;
  slaePrice?: number;
  meta?: ProductMeta;
  created?: Date;
  updated?: Date;
}
