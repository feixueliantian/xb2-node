import { Router } from 'express';
import * as productController from './product.controller';

const router = Router();

router.get('/products/license', productController.showLicenseProduct);

router.get('/products/subscription', productController.showSubscriptionProduct);

export default router;
