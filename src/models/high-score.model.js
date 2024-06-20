import highScoreSchema from '../mongodb/schemas/high-score.schema.js';

export const updateHighScore = async (score) => {
  let highScore = await highScoreSchema.findOne().exec();

  if (!highScore) highScore = new highScoreSchema({ high_score: score });
  else highScore.high_score = score;

  await highScore.save();
};

export const getHighScore = async () => {
  const highScore = await highScoreSchema.findOne().exec();

  return highScore ? highScore.high_score : 0;
};
