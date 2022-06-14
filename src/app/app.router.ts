import { Router } from 'express';
import { postProcessSubsciption } from '../order/order.controller';
import { getOrderById } from '../order/order.service';
import { ProductType } from '../product/product.model';
import { getProductById } from '../product/product.service';
import {
  createUserMeta,
  getUserMetaByWeixinUnionId,
  updateUserMeta,
} from '../user-meta/user-meta-service';
import { UserMetaModel, UserMetaType } from '../user-meta/user-meta.model';
import { logger } from './app.service';

const router = Router();

router.get('/', (request, response) => {
  response.send({ title: '小白兔的开发之路' });
});

router.post('/echo', async (request, response) => {
  logger.info('测试一下 ~~');
  logger.error('测试一下 ~~');
  logger.debug('测试一下 ~~');

  const userMeta = await getUserMetaByWeixinUnionId('321');

  response.send(userMeta);
});

router.post('/pay/:orderId', async (request, response) => {
  const { orderId } = request.params;
  const order = await getOrderById(parseInt(orderId, 10));
  const product = await getProductById(order.productId);

  if (product.type === ProductType.subscription) {
    postProcessSubsciption({ order, product });
  }

  response.sendStatus(200);
});

export default router;
