export enum ProductType {
  license = 'license',
  subscription = 'subscription',
}

export class ProductModel {
  id?: number;
  userId?: number;
  type?: ProductType;
  title?: string;
  description?: Array<string>;
  price?: number;
  slaePrice?: number;
  meta?: string;
  created?: Date;
  updated?: Date;
}
