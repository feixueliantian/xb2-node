import { Router } from 'express';
import * as searchController from './search.controller';

const router = Router();

router.get('/search/tags', searchController.tags);
router.get('/search/users', searchController.users);
router.get('/search/cameras', searchController.cameras);
router.get('/search/lens', searchController.lens);

export default router;
