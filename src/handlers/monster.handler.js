import { getUserData, updateUserData } from '../models/user-data.model.js';
import { getGameAssets } from '../init/assets.js';

export const monsterKilledHandler = async (userId, payload) => {
  const { monster } = getGameAssets();
  const userData = await getUserData(userId);

  if (Math.abs(userData.score - payload.score) >= 200) {
    return { status: 'fail', message: '점수 데이터가 잘못되었습니다!' };
  }
  
  userData.score += 100;

  if (userData.monster_level <= userData.score / 2000) {
    userData.monster_level++;
    userData.gold += 1000;

    await updateUserData(userData);

    return {
      status: 'success',
      message: '몬스터를 처치했습니다, 몬스터가 강해집니다!',
      data: userData,
      monster: monster[userData.monster_level - 1],
    };
  }

  await updateUserData(userData);

  return {
    status: 'success',
    message: '몬스터를 처치했습니다!',
    data: userData,
  };
};
