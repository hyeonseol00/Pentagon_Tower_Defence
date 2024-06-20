import { Server as SocketIO } from 'socket.io';
import registerHandler from '../handlers/register.handler.js';
import { wrap } from '../handlers/helper.js';
import cookieParser from 'cookie-parser';

const initSocket = (server) => {
  const io = new SocketIO();
  io.attach(server);

  io.use(wrap(cookieParser()));

  registerHandler(io);
};

export default initSocket;
