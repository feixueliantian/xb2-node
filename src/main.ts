import express = require('express');
import { Request, Response } from 'express';
const app = express();
const port = 3000;

app.use(express.json());

app.listen(port, () => {
  console.log('服务已启动 ~');
});

app.get('/', (request: Request, response: Response) => {
  response.send('你好');
});

const data = [
  {
    id: 1,
    title: '关山月',
    content: '明月出天山，苍茫云海间',
  },
  {
    id: 2,
    title: '望岳',
    content: '会当凌绝顶，一览众山小',
  },
  {
    id: 3,
    title: '忆江南',
    content: '日出江花红胜火，春来江水绿如蓝',
  },
];

app.get('/posts', (request: Request, response: Response) => {
  response.send(data);
});

app.get('/posts/:postId', (request: Request, response: Response) => {
  const { postId } = request.params;

  const posts = data.filter((item) => item.id == parseInt(postId, 10));

  response.send(posts[0]);
});

app.post('/posts', (request: Request, response: Response) => {
  const { content } = request.body;
  response.status(201);
  response.set('Sing-Along', 'How I wonder what you are');

  console.log(request.headers['sing-along']);

  response.send({
    message: `成功创建了内容 ${content}`,
  });
});
