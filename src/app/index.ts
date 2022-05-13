import express = require('express');
import postRouter from '../post/post.router';
import userRouter from '../user/user.router';
import authRouter from '../auth/auth.router';
import fileRouter from '../file/file.router';
import { defaultErrorHandler } from './app.middleware';

const app = express();

app.use(express.json());

app.use(postRouter, userRouter, authRouter, fileRouter);

app.use(defaultErrorHandler);

export default app;
