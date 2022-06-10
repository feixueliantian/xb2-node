export enum ProductType {
  license = 'license',
  subscription = 'subscription',
}

export enum ProductStatus {
  published = 'published',
  draft = 'draft',
  archived = 'archived',
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
  salePrice?: number;
  meta?: ProductMeta;
  status?: ProductStatus;
  created?: Date;
  updated?: Date;
}
