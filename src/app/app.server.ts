import http = require('http');
import { Server } from 'socket.io';
import { ALLOW_ORIGIN } from './app.config';
import app from './index';

/**
 * HTTP 服务器
 */
const httpServer = http.createServer(app);

/**
 * IO 服务器
 */
export const socketIoServer = new Server(httpServer, {
  cors: {
    origin: ALLOW_ORIGIN,
    allowedHeaders: ['X-TOTAL-COUNT'],
  },
});

export default httpServer;
