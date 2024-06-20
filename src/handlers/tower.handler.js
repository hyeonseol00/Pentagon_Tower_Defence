import { getGameAssets } from '../init/assets.js';
import { getUserData, updateUserData } from '../models/user-data.model.js';


export const addInitialTowerHandler = async (userId, payload) => {
    const userData = await getUserData(userId);
    userData.tower_coordinates.push({
      x: payload.x,
      y: payload.y,
    });
    userData.tower_isUpgrades.push(false);

    await updateUserData(userData);
  
    return {
      status: 'success',
      message: '기본 타워가 성공적으로 배치되었습니다.',
    };
};


export const purchaseTowerHandler = async (userId, payload) => {
    const { commonData } = getGameAssets();
    const userData = await getUserData(userId);
  
    if (userData.gold < commonData.tower_cost)
      return { status: 'fail', message: '돈이 부족해서 구매에 실패했습니다!' };
  
    userData.gold -= commonData.tower_cost;
    userData.tower_coordinates.push({
      x: payload.x,
      y: payload.y,
    });
    userData.tower_isUpgrades.push(false);
    
    await updateUserData(userData);
  
    return {
      status: 'success',
      message: '구매한 타워가 성공적으로 배치되었습니다.',
      data: userData,
    };
};

export const refundTowerHandler = async (userId, payload) => {
  const userData = await getUserData(userId);
  const { commonData } = getGameAssets();

  if (userData.tower_coordinates.length <= 0)
    return { status: 'fail', message: '환불할 수 있는 타워가 없습니다!' };

  if (userData.tower_isUpgrades.at(-1)) {
    userData.gold += commonData.tower_cost * 2;
  } else {
    userData.gold += commonData.tower_cost;
  }
  userData.tower_coordinates.pop();
  userData.tower_isUpgrades.pop();
  await updateUserData(userData);

  return {
    status: 'success',
    message: '마지막으로 설치한 타워가 성공적으로 환불되었습니다.',
    refundTower: userData,
  };
};

export const upgradeTowerHandler = async (userId, payload) => {
  const userData = await getUserData(userId);
  const { commonData } = getGameAssets();

  if (userData.tower_isUpgrades.findIndex((bool) => bool == false) == -1) {
    return {
      status: 'fail',
      message: '업그레이드 할 수 있는 타워가 없습니다!',
    };
  }

  if (userData.gold < commonData.tower_cost) {
    return {
      status: 'fail',
      message: '업그레이드에 필요한 골드가 부족합니다!',
    };
  }

  let randIdx;
  do {
    randIdx = Math.floor(Math.random() * userData.tower_isUpgrades.length);
  } while (userData.tower_isUpgrades[randIdx] != false);

  userData.gold -= commonData.tower_cost;
  userData.tower_isUpgrades[randIdx] = true;
  await updateUserData(userData);

  return {
    status: 'success',
    message: '타워 하나가 성공적으로 업그레이드 되었습니다.',
    data: userData,
    towerIdx: randIdx,
  };
};

export const epicTowerHandler = async (userId, payload) => {
  const userData = await getUserData(userId);
  userData.epic_tower_coordinates.push({
    x: payload.x,
    y: payload.y,
  });

  await updateUserData(userData);
  
  return {
    status: 'success',
    message: '황금 고블린 처치! 에픽 타워를 획득하셨습니다.',
  };
}