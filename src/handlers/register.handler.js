import { addUser } from '../models/user.model.js';
import { handleConnection, handleDisconnect, handleEvent } from './helper.js';
import cookieParser from 'cookie-parser';
import authMiddleware from '../middlewares/auth.middleware.js';

const registerHandler = (io) => {
  io.use((socket, next) => {
    cookieParser()(socket.request, socket.request.res || {}, next);
  })
    .use(authMiddleware)
    .on('connection', async (socket) => {
      const userID = socket.userId;
      if (!userID) return;

      await addUser({ uuid: userID, socket_id: socket.id });

      handleConnection(socket, userID);

      socket.on('event', (data) => handleEvent(io, socket, data));
      socket.on('disconnect', () => handleDisconnect(socket, userID));
    });
};

export default registerHandler;
