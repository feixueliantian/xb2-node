export class AccessLogModel {
  id?: number;
  userId?: number;
  userName?: string;
  action?: string;
  resourceType?: string;
  resourceId?: number;
  payload?: number;
  ip?: string;
  origin?: string | string[];
  referer?: string;
  agent?: string;
  language?: string;
  originalUrl?: string;
  method?: string;
  query?: any;
  params?: any;
  created?: number;
}
