import { connection } from '../app/database/mysql';
import { ProductMeta, ProductModel } from './product.model';

/**
 * 按照类型获取产品列表
 */
export interface getProductByTypeOptions {
  meta?: ProductMeta;
}

export const getProductByType = async (
  type: string,
  options: getProductByTypeOptions = {},
) => {
  const { meta } = options;
  const params = [type];

  let andWhereSubscriptionType = '';
  if (meta && meta.subscriptionType) {
    params.push(meta.subscriptionType);
    andWhereSubscriptionType = `AND product.meta->'$.subscriptionType' = ?`;
  }

  const statement = `
    SELECT
      product.id,
      product.type,
      product.title,
      product.description,
      product.price,
      product.salePrice,
      product.meta
    FROM
      product
    WHERE
      product.type = ?
      AND product.status = 'published'
      ${andWhereSubscriptionType}
    ORDER BY id DESC
    LIMIT 1
  `;

  const [data] = await connection.promise().query(statement, params);

  return data[0] as ProductModel;
};

/**
 * 按照产品 id 获取产品
 */
export const getProductById = async (productId: number) => {
  const statement = `
    SELECT 
      *
    FROM
      product
    WHERE
      product.id = ?
  `;

  const [data] = await connection.promise().query(statement, productId);
  return data[0] as ProductModel;
};
