import { Router } from 'express';
import * as productController from './product.controller';

const router = Router();

router.get('/products/license', productController.showLicenseProduct);

export default router;
