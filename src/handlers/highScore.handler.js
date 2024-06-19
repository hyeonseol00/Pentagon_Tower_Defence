// src/handlers/highScore.handler.js

import HighScore from '../models/score.model.js';

export const renewalHighScore = async (data) => {
  const { userId, highScore } = data;

  try {
    // userId를 사용하여 데이터베이스에서 유저의 최고 기록을 찾음
    let userHighScore = await HighScore.findOne({ userId });

    if (!userHighScore) {
      // 유저의 기록이 없으면 새로운 기록 생성
      userHighScore = new HighScore({ userId, highScore });
    } else {
      // 유저의 기록이 있으면 기존 기록과 비교하여 높은 점수로 갱신
      if (highScore > userHighScore.highScore) {
        userHighScore.highScore = highScore;
      }
    }

    // 데이터베이스에 저장
    await userHighScore.save();

    // 응답 데이터
    return {
      status: 'success',
      message: '서버에서 최고기록이 갱신되었습니다!',
      highScore: userHighScore.highScore,
      userId: userId
    };
  } catch (error) {
    return {
      status: 'fail',
      message: '서버 오류: 최고 기록 갱신에 실패했습니다.'
    };
  }
};
