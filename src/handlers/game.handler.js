import { getHighScore, updateHighScore } from '../models/high-score.model.js';
import { getUserData, updateUserData } from '../models/user-data.model.js';

export const gameStart = (userId, payload) => {
  return { status: 'success', message: '게임이 정상적으로 실행되었습니다.' };
};

export const gameEnd = async (userId, payload) => {
  const userData = await getUserData(userId);

  if (Math.abs(userData.score - payload.score) >= 200)
    return { status: 'fail', message: '점수 데이터가 잘못되었습니다!' };

  if (userData.user_high_score < payload.score)
    userData.user_high_score = payload.score;

  await updateUserData(userData);

  const highScore = await getHighScore();

  if (highScore < payload.score) {
    await updateHighScore(payload.score);
    return {
      status: 'success',
      message: '게임 종료, 최고기록이 갱신되었습니다!',
      broadcast: {
        message: '서버 최고기록이 갱신되었습니다!',
        userId,
        highscore: payload.score + 100,
      },
    };
  }

  return { status: 'success', message: '게임 종료!'};
};