import { CLIENT_VERSION } from '../../tower_defense_client/src/constants.js';
import { getGameAssets } from '../init/assets.js';
import { getUsers, removeUser } from '../models/user.model.js';
import handlerMappings from './handlerMapping.js';

export const handleDisconnect = async (socket, uuid) => {
  removeUser(socket.id);
  console.log(`사용자 접속 해제: ${socket.id}`);
  console.log('현재 접속 중인 사용자:', await getUsers());
};

export const handleConnection = async (socket, userUUID) => {
  console.log(
    `새로운 사용자가 접속했습니다: \"${socket.id}\"소켓으로 \"${userUUID}\"사용자가 접속했습니다.`,
  );
  console.log('현재 접속 중인 사용자:', await getUsers());

  const { templates } = getGameAssets();

  socket.emit('connection', { uuid: userUUID });
};

export const handleEvent = (io, socket, data) => {
  if (!CLIENT_VERSION.includes(data.clientVersion)) {
    socket.emit('response', {
      status: 'fail',
      message: '클라이언트 버전이 매치되지 않습니다.',
    });
    return;
  }

  const handler = handlerMappings[data.handlerId];
  if (!handler) {
    socket.emit('response', {
      status: 'fail',
      message: '핸들러를 찾지 못했습니다.',
    });
    return;
  }

  const response = handler(data.userId, data.payload);
  if (response.broadcast) {
    io.emit('response', 'broadcast');
    return;
  }

  // handleConnection 로 사용자 접속 확인
  // handleEvent 로 game version 이 일치하는지 확인
  // handler 로 client가 보내는 sendEvent에 handlerId가 있는지 확인
  // response 로 client의 요청 사항에 대해 응답을 보냄
  if (response.data) {
    socket.emit('syncC/S', response)
  }

  socket.emit('response', response);
};
