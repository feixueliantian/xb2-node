import httpServer from './app/app.server';
import { APP_PORT } from './app/app.config';
import { connection } from './app/database/mysql';

httpServer.listen(APP_PORT, () => {
  console.log('服务已启动!');
});

connection.connect((error) => {
  if (error) {
    console.log('数据库连接失败', error.message);
    return;
  }
  console.log('成功连接数据库');
});
