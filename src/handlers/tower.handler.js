import { getGameAssets } from '../init/assets.js';
import { getUserData, updateUserData } from '../models/user-data.model.js';

export const placeInitialTowerHandler = async (userId, payload) => {
  const userData = await getUserData(userId);
  userData.tower_coordinates.push(payload.newTowerCoordinates);
  await updateUserData(userData);

  return {
    status: 'success',
    message: '기본 타워 하나가 성공적으로 배치되었습니다.',
  };
};

export const placeTowerHandler = async (userId, payload) => {
  const userData = await getUserData(userId);
  const { commonData } = getGameAssets();

  if (userData.gold < commonData.tower_cost)
    return { status: 'fail', message: '돈이 부족해 구매에 실패했습니다!' };

  userData.gold -= 1000;
  userData.tower_coordinates.push(payload.newTowerCoordinates);
  await updateUserData(userData);

  return {
    status: 'success',
    message: '구매한 타워가 성공적으로 배치되었습니다.',
    data: userData,
  };
};