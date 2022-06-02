import express = require('express');
import cors = require('cors');
import postRouter from '../post/post.router';
import userRouter from '../user/user.router';
import authRouter from '../auth/auth.router';
import fileRouter from '../file/file.router';
import tagRouter from '../tag/tag.router';
import commentRouter from '../comment/comment.router';
import avatarRouter from '../avatar/avatar.router';
import likeRouter from '../like/like.router';
import appRouter from './app.router';
import { defaultErrorHandler } from './app.middleware';
import { currentUser } from '../auth/auth.middleware';

const app = express();

app.use(
  cors({
    origin: '*',
    exposedHeaders: 'X-Total-Count',
  }),
);

app.use(currentUser);

app.use(express.json());

app.use(
  postRouter,
  userRouter,
  authRouter,
  fileRouter,
  tagRouter,
  commentRouter,
  avatarRouter,
  likeRouter,
  appRouter,
);

app.use(defaultErrorHandler);

export default app;
