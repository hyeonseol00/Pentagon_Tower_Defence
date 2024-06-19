// src/init/socket.js

import { Server as SocketIO } from 'socket.io';
import registerHandler from '../handlers/register.handler.js';
import { renewalHighScore } from '../handlers/highScore.handler.js';

const initSocket = (server) => {
  const io = new SocketIO();
  io.attach(server);

  io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    
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
