import jwt = require('jsonwebtoken');
import { PRIVATE_KEY } from '../app/app.config';

interface SignTokenOptions {
  payload?: any;
}

export const signToken = (options: SignTokenOptions) => {
  const { payload } = options;
  const token = jwt.sign(payload, PRIVATE_KEY, { algorithm: 'RS256' });
  return token;
};
