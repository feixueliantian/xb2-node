import { Router } from 'express';
import * as searchController from './search.controller';

const router = Router();

router.get('/search/tags', searchController.tags);

export default router;
