import jwt from 'jsonwebtoken';
import { getAccounts } from '../models/account.model.js';

export default async (socket, next) => {
  try {
    const { authorization } = socket.request.cookies;
    if (!authorization) throw new Error('토큰이 존재하지 않습니다.');

    const [tokenType, token] = authorization.split(' ');
    if (tokenType !== 'Bearer')
      throw new Error('토큰 타입이 일치하지 않습니다.');

    const decodedToken = jwt.verify(token, process.env.TOKEN_SECRET_KEY);
    const id = decodedToken.id;
    const accounts = await getAccounts();
    const account = accounts.find((account) => account.id == id);

    if (!account) {
      throw new Error('토큰 사용자가 존재하지 않습니다.');
    }

    socket.userId = id;

    next();
  } catch (error) {
    let message;
    switch (error.name) {
      case 'TokenExpiredError':
        message = '토큰이 만료되었습니다.';
        break;
      case 'JsonWebTokenError':
        message = '토큰이 조작되었습니다.';
        break;
      default:
        message = error.message ?? '비정상적인 요청입니다.';
    }
    socket.emit('response', { message });
    next();
  }
};
