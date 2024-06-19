// src/init/socket.js

import { Server as SocketIO } from 'socket.io';
import registerHandler from '../handlers/register.handler.js';
import { renewalHighScore } from '../handlers/highScore.handler.js';

const initSocket = (server) => {
  const io = new SocketIO();
  io.attach(server);

  io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    // registerHandler(io); // 여기서는 registerHandler를 호출하지 않습니다.

    socket.on('renewalHighScore', async (payload) => {
      const response = await renewalHighScore(payload);
      io.emit('highScoreUpdated', response);  
    });

    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
    });

    // 여기서 registerHandler를 호출합니다.
    registerHandler(io);
  });
};

export default initSocket;
