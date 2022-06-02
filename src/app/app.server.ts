import http = require('http');
import app from './index';

const httpServer = http.createServer(app);
export default httpServer;
