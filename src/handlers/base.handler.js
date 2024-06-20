import { getUserData, updateUserData } from '../models/user-data.model.js';

export const baseUnderAttack = async (userId, payload) => {
  const userData = await getUserData(userId);

  if (userData.hp <= payload.hp)
    return { status: 'fail', message: '기지 체력 데이터가 잘못되었습니다!' };

  userData.hp = payload.hp;

  await updateUserData(userData);

  return { status: 'success', message: '기지가 피격당했습니다!' };
};