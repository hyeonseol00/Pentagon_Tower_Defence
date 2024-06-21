import { addUser } from '../models/user.model.js';
import { handleConnection, handleDisconnect, handleEvent } from './helper.js';
import {
  addUserData,
  getUserData,
  updateUserData,
} from '../models/user-data.model.js';
import { getGameAssets } from '../init/assets.js';
import cookieParser from 'cookie-parser';
import authMiddleware from '../middlewares/auth.middleware.js';

const registerHandler = (io) => {
  io.use((socket, next) => {
    cookieParser()(socket.request, socket.request.res || {}, next);
  })
    .use(authMiddleware)
    .on('connection', async (socket) => {
      const { commonData, monster } = getGameAssets();
      const userID = socket.userId;
      const userData = await getUserData(userID);

      if (!userID) return;

      await addUser({ uuid: userID, socket_id: socket.id });
      if (!userData)
        await addUserData({
          account_id: userID,
          monster_level: monster[0].level,
          monster_spawn_interval: monster[0].spawn_interval,
          score: 0,
          user_high_score: 0,
          tower_coordinates: [],
          tower_isUpgrades: [],
          gold: commonData.user_gold,
          hp: commonData.base_hp,
        });
      else
        await updateUserData({
          account_id: userID,
          monster_level: monster[0].level,
          monster_spawn_interval: monster[0].spawn_interval,
          score: 0,
          tower_coordinates: [],
          tower_isUpgrades: [],
          gold: commonData.user_gold,
          hp: commonData.base_hp,
        });
      handleConnection(socket, userID);

      socket.on('event', (data) => handleEvent(io, socket, data));
      socket.on('disconnect', () => handleDisconnect(socket, userID));
    });
};

export default registerHandler;
