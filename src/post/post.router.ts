import express = require('express');
import * as postController from './post.controller';

const router = express.Router();
router.get('/posts', postController.index);

export default router;
