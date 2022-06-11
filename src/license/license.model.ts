import { ResourceType } from '../app/app.enum';

export enum LicenseStatus {
  pending = 'pending',
  valid = 'valid',
  invalid = 'invalid',
}

export class LicenseModel {
  id?: number;
  userId?: number;
  orderId?: number;
  resourceType?: ResourceType;
  resourceId?: number;
  status?: LicenseStatus;
  created?: string;
}
