import { Router } from 'express';
import {
  createUserMeta,
  getUserMetaByWeixinUnionId,
  updateUserMeta,
} from '../user-meta/user-meta-service';
import { UserMetaModel, UserMetaType } from '../user-meta/user-meta.model';

const router = Router();

router.get('/', (request, response) => {
  response.send({ title: '小白兔的开发之路' });
});

router.post('/echo', async (request, response) => {
  const userMeta = await getUserMetaByWeixinUnionId('321');

  response.send(userMeta);
});

export default router;
