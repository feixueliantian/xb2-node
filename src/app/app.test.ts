import request = require('supertest');
import app from '../app';
import { connection } from './database/mysql';
import { greet } from './playground/demo';

/**
 * 单元测试
 */
describe('演示单元测试', () => {
  test('测试 greet 函数', () => {
    const greeting = greet('李诗情');
    expect(greeting).toBe('你好，李诗情');
  });
});

/**
 * 测试接口
 */
describe('演示接口测试', () => {
  afterAll(() => {
    connection.end();
  });

  test('测试 GET /', async () => {
    // 请求接口
    const response = await request(app).get('/');

    // 做出断言
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ title: '小白兔的开发之路' });
  });

  test('测试 POST /echo', async () => {
    // 请求接口
    const response = await request(app)
      .post('/echo')
      .send({ message: '你好 ~' });

    // 做出断言
    expect(response.status).toBe(201);
    expect(response.body).toEqual({ message: '你好 ~' });
  });
});
