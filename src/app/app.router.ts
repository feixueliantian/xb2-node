import { Router } from 'express';

const router = Router();

router.get('/', (request, response) => {
  response.send({ title: '小白兔的开发之路' });
});

router.post('/echo', (request, response) => {
  response.status(201).send(request.body);
});

export default router;
