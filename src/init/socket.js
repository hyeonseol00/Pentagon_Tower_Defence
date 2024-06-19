// src/init/socket.js

import { Server as SocketIO } from 'socket.io';
import registerHandler from '../handlers/register.handler.js';
import { renewalHighScore } from '../handlers/highScore.handler.js';

const initSocket = (server) => {
  // Socket.IO 설정
  const io = new SocketIO(server, {
    cors: {
      origin: '*',
    },
  });

  io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    // 레지스터 핸들러 초기화
    registerHandler(socket);

    socket.on('renewalHighScore', async (payload) => {
      const response = await renewalHighScore(payload);
      io.emit('highScoreUpdated', response);
    });

    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
    });
  });
};

export default initSocket;
