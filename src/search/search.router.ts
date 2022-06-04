import { Router } from 'express';
import { accessLog } from '../access-log/access-log.middleware';
import * as searchController from './search.controller';

const router = Router();

router.get(
  '/search/tags',
  accessLog({
    action: 'searchTags',
    resourceType: 'search',
    payloadParam: 'query.name',
  }),
  searchController.tags,
);
router.get(
  '/search/users',
  accessLog({
    action: 'searchUsers',
    resourceType: 'search',
    payloadParam: 'query.name',
  }),
  searchController.users,
);
router.get(
  '/search/cameras',
  accessLog({
    action: 'searchCameras',
    resourceType: 'search',
    payloadParam: 'query.model',
  }),
  searchController.cameras,
);
router.get(
  '/search/lens',
  accessLog({
    action: 'searchLens',
    resourceType: 'search',
    payloadParam: 'query.model',
  }),
  searchController.lens,
);

export default router;
