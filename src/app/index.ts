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
import searchRouter from '../search/search.router';
import auditLogRouter from '../audit-log/audit-log.router';
import dashboardRouter from '../dashboard/dashboard.router';
import weixinLoginRouter from '../weixin-login/weixin-login.router';
import appRouter from './app.router';
import { defaultErrorHandler } from './app.middleware';
import { currentUser } from '../auth/auth.middleware';
import { ALLOW_ORIGIN } from './app.config';

const app = express();

app.use(
  cors({
    origin: ALLOW_ORIGIN,
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
  searchRouter,
  auditLogRouter,
  dashboardRouter,
  weixinLoginRouter,
);

app.use(defaultErrorHandler);

export default app;
