import { Router } from 'express';
import { postProcessSubsciption } from '../order/order.controller';
import { getOrderById } from '../order/order.service';
import { paymentRecived } from '../payment/payment.service';
import { ProductType } from '../product/product.model';
import { getProductById } from '../product/product.service';
import {
  createUserMeta,
  getUserMetaByWeixinUnionId,
  updateUserMeta,
} from '../user-meta/user-meta-service';
import { UserMetaModel, UserMetaType } from '../user-meta/user-meta.model';
import { logger, xmlBuilder, xmlParser } from './app.service';

const router = Router();

router.get('/', (request, response) => {
  response.send({ title: '小白兔的开发之路' });
});

router.post('/echo', async (request, response) => {
  const xmlData = xmlBuilder.buildObject({
    message: '你好 ~',
  });

  logger.info('xmlData', xmlData);

  const data = await xmlParser.parseStringPromise(xmlData);

  logger.debug('data', data);

  const userMeta = await getUserMetaByWeixinUnionId('321');

  response.send(userMeta);
});

router.post('/payments/notify', async (request, response) => {
  // const { orderId } = request.body;
  // paymentRecived(orderId, { message: '通知数据' });
  response.sendStatus(200);
});

export default router;
