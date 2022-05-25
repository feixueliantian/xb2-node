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
