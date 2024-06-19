import { Server as SocketIO } from 'socket.io';
import registerHandler from '../handlers/register.handler.js';
import { renewalHighScore } from '../handlers/highScore.handler.js';

const initSocket = (server) => {
  const io = new SocketIO();
  io.attach(server);

  io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    // 기존 핸들러 등록
    registerHandler(socket);

    // renewalHighScore 이벤트 핸들링
    socket.on('renewalHighScore', async (payload) => {
      const response = await renewalHighScore(payload);
      socket.emit('highScoreUpdated', response);
    });

    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
    });
  });
};

export default initSocket;
