import { Router } from 'express';
import * as searchController from './search.controller';

const router = Router();

router.get('/search/tags', searchController.tags);
router.get('/search/users', searchController.users);
router.get('/search/cameras', searchController.cameras);

export default router;
