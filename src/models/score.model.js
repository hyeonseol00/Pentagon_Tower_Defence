import redisCli from '../redis/redis.client.js';

const highScoreKey = "high_score";

export const getHighScore = async () => {
    const highScore = await redisCli.get(highScoreKey);

    if (!highScore) {
        await redisCli.set(highScoreKey, 0);
    }

    return highScore || 0;
};

export const setHighScore = async (highScore) => {
    await redisCli.set(highScoreKey, highScore);
};
